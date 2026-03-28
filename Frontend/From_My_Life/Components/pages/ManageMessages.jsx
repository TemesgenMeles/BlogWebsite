import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Eye, X, User, Calendar, Clock, Send, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const ManageMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMessage, setSelectedMessage] = useState(null);

    // Deletion states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchMessages = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/posts/contact-message/');
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const [searchParams, setSearchParams] = useSearchParams();

    // Auto-open message from notification deep-link
    useEffect(() => {
        if (!loading && messages.length > 0) {
            const viewId = searchParams.get('view');
            if (viewId) {
                const msgToView = messages.find(m => m.id === parseInt(viewId));
                if (msgToView) {
                    handleView(msgToView);
                    setSearchParams({}, { replace: true });
                }
            }
        }
    }, [loading, messages, searchParams]);

    const markAsRead = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/contact-message/${id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new: false })
            });
            if (response.ok) {
                setMessages(messages.map(m => m.id === id ? { ...m, new: false } : m));
            }
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    const handleDeleteClick = (msg) => {
        setMessageToDelete(msg);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!messageToDelete) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/contact-message/${messageToDelete.id}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setMessages(messages.filter(m => m.id !== messageToDelete.id));
                if (selectedMessage?.id === messageToDelete.id) setSelectedMessage(null);
                setShowDeleteConfirm(false);
                setMessageToDelete(null);
                setShowDeleteSuccess(true);
                setTimeout(() => setShowDeleteSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleView = (msg) => {
        setSelectedMessage(msg);
        if (msg.new) markAsRead(msg.id);
    };

    const MESSAGES_PER_PAGE = 10;

    // Pagination Logic
    const indexOfLastItem = currentPage * MESSAGES_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - MESSAGES_PER_PAGE;
    const currentItems = messages.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(messages.length / MESSAGES_PER_PAGE);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPaginationRange = () => {
        const range = [];
        const rangeWithDots = [];

        // Always show first 3
        for (let i = 1; i <= Math.min(3, totalPages); i++) {
            range.push(i);
        }

        // Add current page neighbors if not already there
        let start = Math.max(1, currentPage - 1);
        let end = Math.min(totalPages, currentPage + 1);
        for (let i = start; i <= end; i++) {
            if (!range.includes(i)) range.push(i);
        }

        // Always show last 3
        for (let i = Math.max(1, totalPages - 2); i <= totalPages; i++) {
            if (!range.includes(i)) range.push(i);
        }

        range.sort((a, b) => a - b);

        let l;
        for (let i of range) {
            if (l) {
                if (i - l > 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    return (
        <div className="admin_management_page animation_fade_in">
            <header className="page_header">
                <div className="header_left">
                    <h1>Contact Messages</h1>
                    <p>Inquiries and feedback from your readers.</p>
                </div>
            </header>

            <div className="admin_table_container">
                {loading ? (
                    <div className="admin_activity_placeholder">Fetching messages...</div>
                ) : (
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>Sender</th>
                                <th>Subject</th>
                                <th>Received</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {m.new && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: '800',
                                                    color: '#10b981',
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    width: 'fit-content',
                                                    marginBottom: '4px',
                                                    letterSpacing: '1px'
                                                }}>NEW</span>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ padding: '8px', background: m.new ? '#ecfdf5' : '#f1f5f9', borderRadius: '50%', color: m.new ? '#10b981' : '#64748b' }}>
                                                    <User size={18} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <strong>{m.name}</strong>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: m.new ? '700' : '500' }}>{m.subject}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.875rem' }}>
                                            <span>{new Date(m.message_date).toLocaleDateString()}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(m.message_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status_badge ${m.new ? 'draft' : 'approved'}`} style={{ color: m.new ? '#9b1c1c' : '#03543f', background: m.new ? '#fee2e2' : '#def7ec' }}>
                                            {m.new ? 'New Inquiry' : 'Reviewed'}
                                        </span>
                                    </td>
                                    <td className="action_column_cell" style={{ textAlign: 'center' }}>
                                        <div className="action_cells" style={{ justifyContent: 'center' }}>
                                            <button onClick={() => handleView(m)} className="action_btn view" title="Detailed View">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(m)} className="action_btn delete" title="Delete Permanent">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Professional Pagination Controls */}
                {!loading && messages.length > MESSAGES_PER_PAGE && (
                    <footer className="professional_pagination" style={{ padding: '40px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'transparent' }}>
                        <button
                            className="pagination_nav_btn"
                            disabled={currentPage === 1}
                            onClick={() => paginate(currentPage - 1)}
                        >
                            <ChevronLeft size={18} /> Previous
                        </button>

                        <div className="page_numbers_hub">
                            {getPaginationRange().map((page, i) => (
                                page === '...' ? (
                                    <span key={`dots-${i}`} className="pagination_dots" style={{ color: '#94a3b8', opacity: 0.5, padding: '0 8px', fontSize: '1.2rem', fontWeight: 'bold' }}>...</span>
                                ) : (
                                    <button
                                        key={page}
                                        className={`page_dot ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => paginate(page)}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            className="pagination_nav_btn"
                            disabled={currentPage === totalPages}
                            onClick={() => paginate(currentPage + 1)}
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    </footer>
                )}

                {!loading && messages.length === 0 && (
                    <div className="admin_activity_placeholder">
                        <p>Your inbox is quiet. No messages yet.</p>
                    </div>
                )}
            </div>

            {selectedMessage && (
                <div className="message_modal_overlay animation_fade_in">
                    <div className="message_modal_content animation_slide_up">
                        <header className="modal_header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedMessage.subject}</h3>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <span><User size={14} /> {selectedMessage.name}</span>
                                    <span><Mail size={14} /> {selectedMessage.email}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMessage(null)} className="action_btn">
                                <X size={20} />
                            </button>
                        </header>
                        <div className="modal_body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
                                <Clock size={14} /> Sent on {new Date(selectedMessage.message_date).toLocaleString()}
                            </div>
                            <div style={{ background: 'transparent', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {selectedMessage.message}
                            </div>
                        </div>
                        <footer className="modal_footer">
                            <button onClick={() => handleDeleteClick(selectedMessage)} className="admin_btn_danger">
                                <Trash2 size={18} /> Delete
                            </button>
                            <a href={`mailto:${selectedMessage.email}`} className="admin_btn_primary">
                                <Send size={18} /> Reply via Email
                            </a>
                        </footer>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && messageToDelete && (
                <div className="message_modal_overlay" style={{ zIndex: 1100 }}>
                    <div className="message_modal_content animation_slide_up" style={{ maxWidth: '450px', padding: '40px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '25px', color: '#ef4444' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Trash2 size={40} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>Delete Message?</h2>
                            <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '1rem' }}>
                                Are you sure you want to delete this message from <strong>{messageToDelete.name}</strong>?<br />
                                This cannot be undone.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                className="admin_btn_secondary"
                                style={{ flex: 1, padding: '12px' }}
                                onClick={() => { setShowDeleteConfirm(false); setMessageToDelete(null); }}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="admin_btn_primary"
                                style={{ flex: 1, padding: '12px', background: '#ef4444' }}
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {showDeleteSuccess && (
                <div style={{
                    position: 'fixed',
                    top: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#10b981',
                    color: '#fff',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontWeight: '600'
                    , animation: 'slideDownFade 0.5s ease'
                }}>
                    <Plus size={20} style={{ transform: 'rotate(45deg)' }} /> Message deleted successfully!
                </div>
            )}
        </div>
    );
};

export default ManageMessages;
