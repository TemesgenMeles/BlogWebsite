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
                                <th className="text_left pl_20">Sender</th>
                                <th className="text_left">Subject</th>
                                <th className="text_center">Received</th>
                                <th className="text_center">Status</th>
                                <th className="text_center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(m => (
                                <tr key={m.id} className={m.new ? 'row_unread' : ''}>
                                    <td>
                                        <div className="author_cell">
                                            <div className={`user_avatar ${m.new ? 'unread' : ''}`}>
                                                <User size={18} />
                                            </div>
                                            <div className="user_meta">
                                                <strong>{m.name}</strong>
                                                <span>{m.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="subject_cell">
                                        <span className={m.new ? 'font_bold' : ''}>{m.subject}</span>
                                    </td>
                                    <td className="text_center">
                                        <div className="date_cell" style={{ justifyContent: 'center' }}>
                                            <span>{new Date(m.message_date).toLocaleDateString()}</span>
                                            <span className="time_meta">{new Date(m.message_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="text_center">
                                        <span className={`status_badge ${m.new ? 'draft' : 'publish'}`}>
                                            {m.new ? 'New Inquiry' : 'Reviewed'}
                                        </span>
                                    </td>
                                    <td className="text_center">
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
                    <footer className="admin_pagination">
                        <button
                            className="pagination_btn"
                            disabled={currentPage === 1}
                            onClick={() => paginate(currentPage - 1)}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="pagination_numbers">
                            {getPaginationRange().map((page, i) => (
                                page === '...' ? (
                                    <span key={`dots-${i}`} className="pagination_dots">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        className={`pagination_num ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => paginate(page)}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            className="pagination_btn"
                            disabled={currentPage === totalPages}
                            onClick={() => paginate(currentPage + 1)}
                        >
                            <ChevronRight size={18} />
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
                <div className="admin_modal_overlay" onClick={() => setSelectedMessage(null)}>
                    <div className="admin_modal_content animation_slide_up" onClick={e => e.stopPropagation()}>
                        <header className="modal_header">
                            <div className="header_title">
                                <Mail size={24} className="accent_text" />
                                <h2>{selectedMessage.subject}</h2>
                            </div>
                            <button onClick={() => setSelectedMessage(null)} className="close_btn">
                                <X size={20} />
                            </button>
                        </header>
                        <div className="modal_body">
                            <div className="modal_user_info">
                                <div className="avatar_large">
                                    {selectedMessage.name[0].toUpperCase()}
                                </div>
                                <div className="user_details">
                                    <h3>{selectedMessage.name}</h3>
                                    <p>{selectedMessage.email}</p>
                                    <div className="meta_strip">
                                        <span><Clock size={14} /> Sent on {new Date(selectedMessage.message_date).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal_field">
                                <label>Message Content</label>
                                <div className="comment_content">
                                    {selectedMessage.message}
                                </div>
                            </div>
                        </div>
                        <footer className="modal_footer">
                            <button onClick={() => handleDeleteClick(selectedMessage)} className="admin_btn_danger">
                                <Trash2 size={18} /> Delete
                            </button>
                            <a href={`mailto:${selectedMessage.email}`} className="admin_btn_primary link_btn">
                                <Send size={18} /> Reply via Email
                            </a>
                        </footer>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && messageToDelete && (
                <div className="admin_modal_overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="admin_modal_content delete_modal animation_slide_up" onClick={e => e.stopPropagation()}>
                        <div className="modal_icon_box danger">
                            <Trash2 size={32} />
                        </div>
                        <h2>Delete Message?</h2>
                        <p>Are you sure you want to delete this message from <strong>{messageToDelete.name}</strong>? This action cannot be undone.</p>
                        <div className="modal_actions">
                            <button className="admin_btn_secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</button>
                            <button className="admin_btn_danger" onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {showDeleteSuccess && (
                <div className="admin_toast success animation_slide_up">
                    <Check size={18} /> Message deleted successfully!
                </div>
            )}
        </div>
    );
};

export default ManageMessages;
