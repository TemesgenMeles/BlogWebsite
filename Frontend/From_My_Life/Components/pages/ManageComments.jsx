import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, MessageSquare, User, Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/posts/comments/');
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const toggleDisplay = async (id, currentStatus) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/comments/${id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayed: !currentStatus })
            });
            if (response.ok) {
                setComments(comments.map(c => c.id === id ? { ...c, displayed: !currentStatus } : c));
            }
        } catch (error) {
            console.error("Error toggling comment visibility:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanent deletion of this comment?")) return;
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/comments/${id}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setComments(comments.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    return (
        <div className="admin_management_page animation_fade_in">
            <header className="page_header">
                <div className="header_left">
                    <h1>Manage Comments</h1>
                    <p>Moderating {comments.length} user interactions across your posts.</p>
                </div>
            </header>

            <div className="admin_table_container">
                {loading ? (
                    <div className="admin_activity_placeholder">Synchronizing comments...</div>
                ) : (
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>Author Info</th>
                                <th>Target Story</th>
                                <th>Comment Snippet</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comments.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '50%', color: '#64748b' }}>
                                                <User size={18} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <strong>{c.name}</strong>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '0.875rem' }}>
                                            <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {c.post_title}
                                            </span>
                                            <Link to={`/posts/${c.post}`} target="_blank" style={{ color: 'inherit' }}><ExternalLink size={14} /></Link>
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {c.comment}
                                        </p>
                                    </td>
                                    <td>
                                        <span className={`status_badge ${c.displayed ? 'publish' : 'draft'}`}>
                                            {c.displayed ? 'Approved' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="action_cells">
                                        <button 
                                            onClick={() => toggleDisplay(c.id, c.displayed)} 
                                            className="action_btn"
                                            title={c.displayed ? "Hide Comment" : "Approve Comment"}
                                            style={{ color: c.displayed ? '#94a3b8' : 'var(--primary-color)', borderColor: c.displayed ? '#e2e8f0' : 'var(--primary-color)' }}
                                        >
                                            {c.displayed ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button onClick={() => handleDelete(c.id)} className="action_btn delete" title="Delete Permanent">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && comments.length === 0 && (
                    <div className="admin_activity_placeholder">
                        <p>No comments found to moderate.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageComments;
