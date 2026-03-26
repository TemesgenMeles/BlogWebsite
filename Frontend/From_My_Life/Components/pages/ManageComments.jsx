import React, { useState, useEffect } from 'react';
import { Eye, Check, Trash2, MessageSquare, User, Calendar, ExternalLink, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const ManageComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedComment, setSelectedComment] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Deletion states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const COMMENTS_PER_PAGE = 10;

    const fetchComments = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/posts/comments/');
            const data = await response.json();
            // Sort: Newest first, with 'new' comments at the absolute top
            const sortedData = data.sort((a, b) => {
                if (a.new && !b.new) return -1;
                if (!a.new && b.new) return 1;
                return new Date(b.commented_date) - new Date(a.commented_date);
            });
            setComments(sortedData);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    // Auto-open comment from notification deep-link
    useEffect(() => {
        if (!loading && comments.length > 0) {
            const viewId = searchParams.get('view');
            if (viewId) {
                const commentToView = comments.find(c => c.id === parseInt(viewId));
                if (commentToView) {
                    handleViewComment(commentToView);
                    // Clear the param search so it doesn't re-open on every render/refresh
                    setSearchParams({}, { replace: true });
                }
            }
        }
    }, [loading, comments, searchParams]);

    const toggleDisplay = async (id, currentStatus) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/comments/${id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayed: !currentStatus, new: false })
            });
            if (response.ok) {
                setComments(comments.map(c => c.id === id ? { ...c, displayed: !currentStatus, new: false } : c));
                if (selectedComment && selectedComment.id === id) {
                    setSelectedComment({ ...selectedComment, displayed: !currentStatus, new: false });
                }
            }
        } catch (error) {
            console.error("Error toggling comment visibility:", error);
        }
    };

    const handleViewComment = async (comment) => {
        setSelectedComment({ ...comment, new: false }); // Optimistic update
        setShowViewModal(true);
        if (comment.new) {
            try {
                await fetch(`http://127.0.0.1:8000/posts/comments/${comment.id}/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ new: false })
                });
                setComments(comments.map(c => c.id === comment.id ? { ...c, new: false } : c));
            } catch (err) {
                console.error("Error marking comment as read:", err);
            }
        }
    };

    const handleDeleteClick = (comment) => {
        setCommentToDelete(comment);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!commentToDelete) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/comments/${commentToDelete.id}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setComments(comments.filter(c => c.id !== commentToDelete.id));
                setShowDeleteConfirm(false);
                setCommentToDelete(null);
                setShowDeleteSuccess(true);
                setTimeout(() => setShowDeleteSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter Logic
    const filteredComments = comments.filter(c => {
        if (statusFilter === 'approved') return c.displayed === true;
        if (statusFilter === 'hidden') return c.displayed === false;
        if (statusFilter === 'new') return c.new === true;
        return true;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * COMMENTS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - COMMENTS_PER_PAGE;
    const currentItems = filteredComments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredComments.length / COMMENTS_PER_PAGE);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPaginationRange = () => {
        const range = [];
        const rangeWithDots = [];

        // Always show first 3 (as requested)
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
                    <h1>Manage Comments</h1>
                    <p>Moderating {filteredComments.length} of {comments.length} user interactions.</p>
                </div>
            </header>

            <div className="status_filter_tabs">
                <button
                    className={`status_tab ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                >
                    All Comments ({comments.length})
                </button>
                <button
                    className={`status_tab ${statusFilter === 'approved' ? 'active' : ''}`}
                    onClick={() => { setStatusFilter('approved'); setCurrentPage(1); }}
                >
                    Approved ({comments.filter(c => c.displayed).length})
                </button>
                <button
                    className={`status_tab ${statusFilter === 'hidden' ? 'active' : ''}`}
                    onClick={() => { setStatusFilter('hidden'); setCurrentPage(1); }}
                >
                    Hidden ({comments.filter(c => !c.displayed).length})
                </button>
                <button
                    className={`status_tab ${statusFilter === 'new' ? 'active' : ''}`}
                    onClick={() => { setStatusFilter('new'); setCurrentPage(1); }}
                >
                    New ({comments.filter(c => c.new).length})
                </button>
            </div>

            <div className="admin_table_container">
                {loading ? (
                    <div className="admin_activity_placeholder">Synchronizing comments...</div>
                ) : (
                    <>
                        <table className="admin_table">
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', paddingLeft: '20px' }}>Author Info</th>
                                    <th style={{ textAlign: 'left' }}>Target Story</th>
                                    <th style={{ textAlign: 'left' }}>Comment Snippet</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ paddingLeft: '20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                {c.new && (
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
                                                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', color: '#94a3b8' }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <strong>{c.name}</strong>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '0.875rem' }}>
                                                <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600' }}>
                                                    {c.post_title}
                                                </span>
                                                <Link to={`/posts/${c.post}`} target="_blank" style={{ color: 'inherit', opacity: 0.6 }}><ExternalLink size={14} /></Link>
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '300px' }}>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {c.comment}
                                            </p>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status_badge ${c.displayed ? 'publish' : 'draft'}`}>
                                                {c.displayed ? 'Approved' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="action_cells" style={{ textAlign: 'center', display: 'table-cell' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleViewComment(c)}
                                                    className="action_btn view"
                                                    title="View Full Comment"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => toggleDisplay(c.id, c.displayed)}
                                                    className="action_btn edit"
                                                    title={c.displayed ? "Hide Comment" : "Approve Comment"}
                                                    style={{ color: c.displayed ? '#94a3b8' : '#10b981', borderColor: c.displayed ? 'rgba(255,255,255,0.1)' : 'rgba(16, 185, 129, 0.3)' }}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(c)} className="action_btn delete" title="Delete Permanent">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredComments.length > COMMENTS_PER_PAGE && (
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
                    </>
                )}
                {!loading && filteredComments.length === 0 && (
                    <div className="admin_activity_placeholder">
                        <p>No comments found for this filter.</p>
                    </div>
                )}
            </div>

            {/* View Comment Modal */}
            {showViewModal && selectedComment && (
                <div className="message_modal_overlay" onClick={() => setShowViewModal(false)}>
                    <div className="message_modal_content animation_slide_up" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal_header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MessageSquare size={24} color="var(--primary-color)" /> Comment Details
                            </h2>
                            <button className="close_btn" onClick={() => setShowViewModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal_body" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'Bold', color: '#fff' }}>
                                    {selectedComment.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{selectedComment.name}</h3>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{selectedComment.email}</p>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.8rem', color: 'rgba(148,163,184,0.6)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {new Date(selectedComment.commented_date).toLocaleDateString()}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MessageSquare size={14} /> ID: #{selectedComment.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Target Story</h4>
                                <div style={{ color: 'var(--primary-color)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {selectedComment.post_title}
                                    <Link to={`/posts/${selectedComment.post}`} target="_blank" style={{ color: 'inherit' }}><ExternalLink size={16} /></Link>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Comment Message</h4>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', lineHeight: '1.6', color: '#e2e8f0', fontSize: '1.05rem' }}>
                                    {selectedComment.comment}
                                </div>
                            </div>
                        </div>
                        <div className="modal_footer">
                            <button
                                className="admin_btn_primary"
                                onClick={() => { toggleDisplay(selectedComment.id, selectedComment.displayed); }}
                                style={{ background: selectedComment.displayed ? '#ef4444' : '#10b981' }}
                            >
                                {selectedComment.displayed ? 'Hide Comment' : 'Approve Comment'}
                            </button>
                            <button className="admin_btn_secondary" onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && commentToDelete && (
                <div className="message_modal_overlay" style={{ zIndex: 1100 }}>
                    <div className="message_modal_content animation_slide_up" style={{ maxWidth: '450px', padding: '40px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '25px', color: '#ef4444' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Trash2 size={40} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>Delete Comment?</h2>
                            <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '1rem' }}>
                                Are you sure you want to delete this comment from <strong>{commentToDelete.name}</strong>?<br/>
                                This cannot be undone.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                className="admin_btn_secondary" 
                                style={{ flex: 1, padding: '12px' }} 
                                onClick={() => { setShowDeleteConfirm(false); setCommentToDelete(null); }}
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
                , animation: 'slideDownFade 0.5s ease' }}>
                    <Plus size={20} style={{ transform: 'rotate(45deg)' }} /> Comment deleted successfully!
                </div>
            )}
        </div>
    );
};

export default ManageComments;
