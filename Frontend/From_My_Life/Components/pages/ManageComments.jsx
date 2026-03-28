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
                                    <th className="text_left pl_20">Author Info</th>
                                    <th className="text_left">Target Story</th>
                                    <th className="text_left">Comment Snippet</th>
                                    <th className="text_center">Status</th>
                                    <th className="text_center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="author_cell">
                                                {c.new && <span className="new_badge">NEW</span>}
                                                <div className="author_info">
                                                    <div className="user_avatar">
                                                        <User size={18} />
                                                    </div>
                                                    <div className="user_meta">
                                                        <strong>{c.name}</strong>
                                                        <span>{c.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="target_story_cell">
                                                <span className="story_title">{c.post_title}</span>
                                                <Link to={`/posts/${c.post}`} target="_blank" className="story_link"><ExternalLink size={14} /></Link>
                                            </div>
                                        </td>
                                        <td className="snippet_cell">
                                            <p>{c.comment}</p>
                                        </td>
                                        <td className="text_center">
                                            <span className={`status_badge ${c.displayed ? 'publish' : 'draft'}`}>
                                                {c.displayed ? 'Approved' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="action_cells">
                                            <button
                                                onClick={() => handleViewComment(c)}
                                                className="action_btn view"
                                                title="View Full Comment"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleDisplay(c.id, c.displayed)}
                                                className={`action_btn ${c.displayed ? 'hide' : 'approve'}`}
                                                title={c.displayed ? "Hide Comment" : "Approve Comment"}
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(c)} className="action_btn delete" title="Delete Permanent">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
                <div className="admin_modal_overlay" onClick={() => setShowViewModal(false)}>
                    <div className="admin_modal_content animation_slide_up" onClick={e => e.stopPropagation()}>
                        <div className="modal_header">
                            <div className="header_title">
                                <MessageSquare size={24} className="accent_text" />
                                <h2>Comment Details</h2>
                            </div>
                            <button className="close_btn" onClick={() => setShowViewModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal_body">
                            <div className="modal_user_info">
                                <div className="avatar_large">
                                    {selectedComment.name[0].toUpperCase()}
                                </div>
                                <div className="user_details">
                                    <h3>{selectedComment.name}</h3>
                                    <p>{selectedComment.email}</p>
                                    <div className="meta_strip">
                                        <span><Calendar size={14} /> {new Date(selectedComment.commented_date).toLocaleDateString()}</span>
                                        <span>ID: #{selectedComment.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal_field">
                                <label>Target Story</label>
                                <div className="story_reference">
                                    {selectedComment.post_title}
                                    <Link to={`/posts/${selectedComment.post}`} target="_blank" className="accent_text"><ExternalLink size={16} /></Link>
                                </div>
                            </div>

                            <div className="modal_field">
                                <label>Comment Message</label>
                                <div className="comment_content">
                                    {selectedComment.comment}
                                </div>
                            </div>
                        </div>
                        <div className="modal_footer">
                            <button
                                className={`admin_btn_${selectedComment.displayed ? 'danger' : 'primary'}`}
                                onClick={() => { toggleDisplay(selectedComment.id, selectedComment.displayed); }}
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
                <div className="admin_modal_overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="admin_modal_content delete_modal animation_slide_up" onClick={e => e.stopPropagation()}>
                        <div className="modal_icon_box danger">
                            <Trash2 size={32} />
                        </div>
                        <h2>Delete Comment?</h2>
                        <p>Are you sure you want to delete this comment from <strong>{commentToDelete.name}</strong>? This action cannot be undone.</p>
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
                    <Check size={18} /> Comment deleted successfully!
                </div>
            )}
        </div>
    );
};

export default ManageComments;
