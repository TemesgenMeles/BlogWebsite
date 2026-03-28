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

            <div className="admin_table_controls">
                <div className="search_bar">
                    <Search size={18} className="search_icon" />
                    <input
                        type="text"
                        placeholder="Filter by email address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                <th className="text_left pl_20">Subscriber</th>
                                <th className="text_left">Subscription Date</th>
                                <th className="text_center">Status</th>
                                <th className="text_center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div className="author_cell">
                                            <div className="user_avatar">
                                                <Mail size={18} />
                                            </div>
                                            <div className="user_meta">
                                                <strong>{s.email}</strong>
                                                <span>ID: #{s.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text_center">
                                        <div className="date_cell" style={{ justifyContent: 'center' }}>
                                            <span>
                                                <Calendar size={14} className="text_muted" />
                                                {new Date(s.subscribed_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text_center">
                                        <span className="status_badge publish">
                                            <CheckCircle size={12} /> Active
                                        </span>
                                    </td>
                                    <td className="text_center">
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

                {!loading && filteredSubscribers.length === 0 && (
                    <div className="admin_activity_placeholder">
                        <p>No subscribers found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && subscriberToDelete && (
                <div className="admin_modal_overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="admin_modal_content delete_modal animation_slide_up" onClick={e => e.stopPropagation()}>
                        <div className="modal_icon_box danger">
                            <Trash2 size={32} />
                        </div>
                        <h2>Remove Subscriber?</h2>
                        <p>Are you sure you want to remove <strong>{subscriberToDelete.email}</strong> from the newsletter? This action cannot be undone.</p>
                        <div className="modal_actions">
                            <button className="admin_btn_secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</button>
                            <button className="admin_btn_danger" onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Removing...' : 'Remove Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {showDeleteSuccess && (
                <div className="admin_toast success animation_slide_up">
                    <Check size={18} /> Subscriber removed successfully!
                </div>
            )}
        </div>
    );
};

export default ManageSubscribers;
