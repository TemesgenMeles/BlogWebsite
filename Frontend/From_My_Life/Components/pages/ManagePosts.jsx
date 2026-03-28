import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Search, Clock, User, Calendar, ChevronLeft, ChevronRight, MessageSquare, Heart, Twitter, Linkedin, Link as LinkIcon, X } from 'lucide-react';

const CATEGORY_COLORS = {
    showcase: '#8b5cf6',
    education: '#3b82f6',
    business: '#f59e0b',
    insight: '#10b981',
    lifestyle: '#ec4899',
    default: '#94a3b8'
};

const getCategoryColor = (slug = '') => CATEGORY_COLORS[slug] || CATEGORY_COLORS.default;

const ManagePosts = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showPreview, setShowPreview] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Deletion states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const POSTS_PER_PAGE = 10;

    const fetchData = async () => {
        try {
            setLoading(true);
            const [postsRes, catRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/posts/?status=all'),
                fetch('http://127.0.0.1:8000/posts/categories/')
            ]);

            if (postsRes.ok) {
                const postsData = await postsRes.json();
                setPosts(postsData);
            }

            if (catRes.ok) {
                const catData = await catRes.json();
                setCategories(catData);
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClick = (post) => {
        setPostToDelete(post);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/${postToDelete.id}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setPosts(posts.filter(post => post.id !== postToDelete.id));
                setShowDeleteConfirm(false);
                setPostToDelete(null);
                setShowDeleteSuccess(true);
                setTimeout(() => setShowDeleteSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredPosts = posts
        .filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' ||
                post.catagory?.some(cat => cat.slug === selectedCategory);
            
            let matchesStatus = true;
            if (statusFilter === 'publish') matchesStatus = post.status === 'publish';
            else if (statusFilter === 'draft') matchesStatus = post.status === 'draft';
            else if (statusFilter === 'latest') matchesStatus = !!post.latest;

            return matchesSearch && matchesCategory && matchesStatus;
        })
        .sort((a, b) => new Date(b.published_date) - new Date(a.published_date));

    // Pagination Logic
    const indexOfLastPost = currentPage * POSTS_PER_PAGE;
    const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

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

        // Add current page if not already in range
        if (currentPage > 3 && currentPage < totalPages - 2) {
            range.push(currentPage);
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
                    <h1>Manage Posts</h1>
                    <p>Displaying {filteredPosts.length} of {posts.length} stories.</p>
                </div>
                <Link to="/admin/posts/create" className="admin_btn_primary">
                    <Plus size={18} /> Create New Post
                </Link>
            </header>

            <div className="status_filter_tabs">
                <button
                    className={`status_tab ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                >
                    All Posts ({posts.length})
                </button>
                <button
                    className={`status_tab ${statusFilter === 'publish' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('publish')}
                >
                    Published ({posts.filter(p => p.status === 'publish').length})
                </button>
                <button
                    className={`status_tab ${statusFilter === 'draft' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('draft')}
                >
                    Drafts ({posts.filter(p => p.status === 'draft').length})
                </button>
                <button
                    className={`status_tab ${statusFilter === 'latest' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('latest')}
                >
                    Latest Posts ({posts.filter(p => p.latest).length})
                </button>
            </div>

            <div className="admin_filter_wrapper">
                <div className="category_filter_bar">
                    <button
                        className={`filter_pill ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All Stories
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`filter_pill ${selectedCategory === cat.slug ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.slug)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="admin_table_controls">
                    <div className="search_bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="admin_table_container">
                {loading ? (
                    <div className="admin_activity_placeholder">Loading your stories...</div>
                ) : (
                    <>
                        <table className="admin_table">
                            <thead>
                                <tr>
                                    <th>Post Title</th>
                                    <th>Categories</th>
                                    <th>Published Date</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPosts.length > 0 ? (
                                    currentPosts.map((post) => (
                                        <tr key={post.id}>
                                            <td className="post_title_cell">
                                                <div className="post_title_main"><strong>{post.title}</strong></div>
                                                <div className="post_id_sub">ID: #{post.id}</div>
                                            </td>
                                            <td>
                                                <ul className="category_bullet_list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {post.catagory && post.catagory.length > 0 ? (
                                        post.catagory.map(cat => (
                                            <li key={cat.slug} className="category_item">
                                                <span className="dot" style={{ background: getCategoryColor(cat.slug) }} />
                                                <span>{cat.name}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <span className="empty_val">—</span>
                                    )}
                                </ul>
                            </td>
                            <td className="date_cell">{new Date(post.published_date).toLocaleDateString()}</td>
                            <td>
                                <span className={`status_badge ${post.status}`}>
                                    {post.status}
                                </span>
                            </td>
                                            <td className="action_column_cell" style={{ textAlign: 'center' }}>
                                                <div className="action_cells" style={{ justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => { setSelectedPost(post); setShowPreview(true); }}
                                                        className="action_btn view"
                                                        title="Quick Preview"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <Link to={`/admin/posts/edit/${post.id}`} className="action_btn edit" title="Edit Content">
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button onClick={() => handleDeleteClick(post)} className="action_btn delete" title="Remove Post">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : null}
                            </tbody>
                        </table>

                        {/* Professional Pagination Controls */}
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
                {!loading && filteredPosts.length === 0 && (
                    <div className="admin_activity_placeholder">
                        <p>No matches found in this category.</p>
                    </div>
                )}
            </div>
            {/* Preview Modal */}
            {showPreview && selectedPost && (
                <div className="message_modal_overlay" onClick={() => setShowPreview(false)}>
                    <div className="message_modal_content modal_preview animation_slide_up" onClick={e => e.stopPropagation()}>
                        <div className="modal_header">
                            <h2>Post Preview</h2>
                            <button 
                                className="admin_modal_close" 
                                onClick={() => setShowPreview(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal_body preview_mode_body">
                            <article className="post_detail_wrapper">
                                {/* Hero Section */}
                                <header className="article_hero_preview">
                                    <div className="preview_container_small">
                                        <div className="category_pill_list">
                                            {selectedPost.catagory?.map(cat => (
                                                <span key={cat.slug} className={`category_pill badge_${cat.slug || 'insight'}`}>
                                                    {cat.name}
                                                </span>
                                            ))}
                                            <span className="read_time_preview">
                                                <Clock size={14} /> 6 min read
                                            </span>
                                        </div>
                                        <h1 className="article_title_preview">{selectedPost.title}</h1>

                                        <div className="author_meta_box">
                                            <div className="avatar_initials_preview">
                                                {selectedPost.author?.first_name ? selectedPost.author.first_name[0].toUpperCase() : <User size={24} />}
                                            </div>
                                            <div className="author_info">
                                                <h4>{selectedPost.author?.first_name} {selectedPost.author?.last_name}</h4>
                                                <div className="author_sub_info">
                                                    <span><Calendar size={14} /> {new Date(selectedPost.published_date).toLocaleDateString()}</span>
                                                    <span><User size={14} /> {selectedPost.author?.is_staff ? 'Admin' : 'Author'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </header>

                                {/* Featured Image */}
                                <div className="preview_image_container">
                                    <div className="article_featured_image_preview">
                                        {selectedPost.images?.length > 0 ? (
                                            <img
                                                src={selectedPost.images.find(img => img.position === 1)?.image || selectedPost.images[0].image}
                                                alt={selectedPost.title}
                                            />
                                        ) : (
                                            <div className="image_placeholder_preview">No Image Available</div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="article_body_preview">
                                    <div className="article_content_grid_preview">
                                        {/* Mock Share Sidebar */}
                                        <aside className="share_sidebar_preview">
                                            <span className="share_label">SHARE</span>
                                            <div className="share_actions">
                                                <div className="share_stat">
                                                    <Heart size={20} className={selectedPost.likes > 0 ? 'active' : ''} fill={selectedPost.likes > 0 ? '#10b981' : 'none'} />
                                                    <span>{selectedPost.likes || 0}</span>
                                                </div>
                                                <Twitter size={20} />
                                                <Linkedin size={20} />
                                                <LinkIcon size={20} />
                                            </div>
                                        </aside>

                                        <div className="article_rich_text_preview">
                                            {/* Lead Content */}
                                            {selectedPost.main_content && (
                                                <div className="lead_content_preview"
                                                    dangerouslySetInnerHTML={{ __html: selectedPost.main_content }} />
                                            )}

                                            <blockquote className="preview_quote">
                                                {selectedPost.quote ? selectedPost.quote : "Coding isn't just about syntax; it's about solving problems."}
                                                {selectedPost.quote_author && (
                                                    <div className="quote_author_preview">— {selectedPost.quote_author}</div>
                                                )}
                                            </blockquote>

                                            <div className="in_article_tags">
                                                {(selectedPost.tags ? selectedPost.tags.split(',').map(tag => tag.trim()) : ['Tech', 'Blog']).map(tag => (
                                                    <span key={tag} className="content_tag">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                        <div className="modal_footer">
                            <Link to={`/admin/posts/edit/${selectedPost.id}`} className="admin_btn_primary">
                                <Pencil size={18} /> Edit Story
                            </Link>
                            <button className="admin_btn_secondary" onClick={() => setShowPreview(false)}>
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && postToDelete && (
                <div className="admin_modal_overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="admin_modal_content delete_modal animation_slide_up" onClick={e => e.stopPropagation()}>
                        <div className="modal_icon_box danger">
                            <Trash2 size={32} />
                        </div>
                        <h2>Delete Post?</h2>
                        <p>Are you sure you want to delete <strong>"{postToDelete.title}"</strong>? This action cannot be undone.</p>
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
                    <Activity size={18} /> Post deleted successfully!
                </div>
            )}
        </div>
    );
};

export default ManagePosts;
