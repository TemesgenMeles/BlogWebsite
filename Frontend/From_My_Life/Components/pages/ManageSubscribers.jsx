import React, { useState, useEffect } from 'react';
import { Mail, Search, Trash2, Download, Users, Calendar, CheckCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const ManageSubscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Deletion states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [subscriberToDelete, setSubscriberToDelete] = useState(null);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSubscribers = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/posts/newsletter/');
            const data = await response.json();
            setSubscribers(data);
        } catch (error) {
            console.error("Error fetching subscribers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleDeleteClick = (subscriber) => {
        setSubscriberToDelete(subscriber);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!subscriberToDelete) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/newsletter/${subscriberToDelete.id}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setSubscribers(subscribers.filter(s => s.id !== subscriberToDelete.id));
                setShowDeleteConfirm(false);
                setSubscriberToDelete(null);
                setShowDeleteSuccess(true);
                setTimeout(() => setShowDeleteSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Error deleting subscriber:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredSubscribers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSubscribers.length / ITEMS_PER_PAGE);

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

    const exportToCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + ["ID,Email,Date Subscribed"].join(",") + "\n"
            + subscribers.map(s => `${s.id},${s.email},${s.subscribed_date}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `blog_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="admin_management_page animation_fade_in">
            <header className="page_header">
                <div className="header_left">
                    <h1>Newsletter Subscribers</h1>
                    <p>Building your audience. Total active subscribers: <strong>{subscribers.length}</strong></p>
                </div>
                <button onClick={exportToCSV} className="admin_btn_secondary">
                    <Download size={18} /> Export CSV List
                </button>
            </header>

            <div className="admin_table_controls" style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="search_bar" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Filter by email address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                    />
                </div>
            </div>

            <div className="admin_table_container">
                {loading ? (
                    <div className="admin_activity_placeholder">Fetching audience data...</div>
                ) : (
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>Subscriber</th>
                                <th>Subscription Date</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '10px', color: '#10b981' }}>
                                                <Mail size={18} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <strong>{s.email}</strong>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{s.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                                            <Calendar size={14} className="text_muted" />
                                            <span>{new Date(s.subscribed_date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status_badge publish" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={12} /> Active
                                        </span>
                                    </td>
                                    <td className="action_column_cell" style={{ textAlign: 'center' }}>
                                        <div className="action_cells" style={{ justifyContent: 'center' }}>
                                            <button onClick={() => handleDeleteClick(s)} className="action_btn delete" title="Unsubscribe Message">
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
                {!loading && filteredSubscribers.length > ITEMS_PER_PAGE && (
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

                {!loading && filteredSubscribers.length === 0 && (
                    <div className="admin_activity_placeholder">
                        <p>No subscribers found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && subscriberToDelete && (
                <div className="message_modal_overlay" style={{ zIndex: 1100 }}>
                    <div className="message_modal_content animation_slide_up" style={{ maxWidth: '450px', padding: '40px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '25px', color: '#ef4444' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Trash2 size={40} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>Remove Subscriber?</h2>
                            <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '1rem' }}>
                                Are you sure you want to remove <strong>{subscriberToDelete.email}</strong> from the newsletter?<br />
                                This cannot be undone.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                className="admin_btn_secondary"
                                style={{ flex: 1, padding: '12px' }}
                                onClick={() => { setShowDeleteConfirm(false); setSubscriberToDelete(null); }}
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
                                {isDeleting ? 'Removing...' : 'Remove Permanently'}
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
                    <Plus size={20} style={{ transform: 'rotate(45deg)' }} /> Subscriber removed successfully!
                </div>
            )}
        </div>
    );
};

export default ManageSubscribers;
