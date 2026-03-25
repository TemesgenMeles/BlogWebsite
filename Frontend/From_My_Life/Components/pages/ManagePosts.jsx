import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Search, Clock, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/${id}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setPosts(posts.filter(post => post.id !== id));
            }
        } catch (error) {
            console.error("Error deleting post:", error);
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
                                                            <li key={cat.slug} style={{ color: getCategoryColor(cat.slug), fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                • <span style={{ fontSize: '0.9rem', color: getCategoryColor(cat.slug) }}>{cat.name}</span>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <span style={{ color: 'rgba(148,163,184,0.5)' }}>—</span>
                                                    )}
                                                </ul>
                                            </td>
                                            <td className="date_cell">{new Date(post.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
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
                                                    <button onClick={() => handleDelete(post.id)} className="action_btn delete" title="Remove Post">
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
                        {filteredPosts.length > POSTS_PER_PAGE && (
                            <footer className="professional_pagination" style={{ padding: '60px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'transparent' }}>
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
                            <button className="close_btn" onClick={() => setShowPreview(false)}>&times;</button>
                        </div>
                        <div className="modal_body preview_mode_body" style={{ backgroundColor: '#0f172a', padding: '0', color: '#f8fafc' }}>
                            <article className="post_detail_wrapper" style={{ padding: '0', border: 'none', background: 'transparent' }}>
                                {/* Hero Section */}
                                <header className="article_hero" style={{ padding: '60px 20px 40px', textAlign: 'left', background: 'rgba(30, 41, 59, 0.5)' }}>
                                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                        <div className="category_pill_list" style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {selectedPost.catagory?.map(cat => (
                                                <span key={cat.slug} className={`category_pill badge_${cat.slug || 'insight'}`} style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', color: '#fff' }}>
                                                    {cat.name}
                                                </span>
                                            ))}
                                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                                                <Clock size={14} /> 6 min read
                                            </span>
                                        </div>
                                        <h1 className="article_title" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '25px', lineHeight: '1.2' }}>{selectedPost.title}</h1>

                                        <div className="author_meta_box" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div className="avatar_initials" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                {selectedPost.author?.first_name ? selectedPost.author.first_name[0].toUpperCase() : <User size={24} />}
                                            </div>
                                            <div className="author_info">
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{selectedPost.author?.first_name} {selectedPost.author?.last_name}</h4>
                                                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {new Date(selectedPost.published_date).toLocaleDateString()}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={14} /> {selectedPost.author?.is_staff ? 'Admin' : 'Author'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </header>

                                {/* Featured Image (Position 1) */}
                                <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
                                    <div className="article_featured_image" style={{ height: '500px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                                        {selectedPost.images?.length > 0 ? (
                                            <img
                                                src={selectedPost.images.find(img => img.position === 1)?.image || selectedPost.images[0].image}
                                                alt={selectedPost.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            />
                                        ) : (
                                            <img src="/home_bg.png" alt="Default Background" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        )}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="article_body_container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 60px' }}>
                                    <div className="article_rich_text" style={{ color: '#e2e8f0', lineHeight: '1.8', fontSize: '1.125rem' }}>
                                        {/* Lead Content */}
                                        {selectedPost.main_content && (
                                            <div className="lead_content" style={{ fontSize: '1.4rem', marginBottom: '40px', color: '#fff', fontWeight: '400' }}
                                                dangerouslySetInnerHTML={{ __html: selectedPost.main_content }} />
                                        )}

                                        {/* Inset Image (Position 2) */}
                                        {selectedPost.images?.find(img => img.position === 2) && (
                                            <figure className="article_inset_image" style={{ height: '500px', margin: '40px 0', borderRadius: '20px', overflow: 'hidden', textAlign: 'center' }}>
                                                <img src={selectedPost.images.find(img => img.position === 2).image} alt="Contextual" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                {selectedPost.images.find(img => img.position === 2).discription && (
                                                    <figcaption style={{ padding: '15px', fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', opacity: '0.5' }}
                                                        dangerouslySetInnerHTML={{ __html: selectedPost.images.find(img => img.position === 2).discription }} />
                                                )}
                                            </figure>
                                        )}

                                        {/* Content Block 1 */}
                                        {selectedPost.content1 && (
                                            <div className="dropcap" style={{ marginBottom: '40px' }} dangerouslySetInnerHTML={{ __html: selectedPost.content1 }} />
                                        )}

                                        {/* Gallery Grid (Positions 3 & 4) */}
                                        {(selectedPost.images?.find(img => img.position === 3) || selectedPost.images?.find(img => img.position === 4)) && (
                                            <div className="article_gallery_grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '60px 0' }}>
                                                {selectedPost.images?.find(img => img.position === 3) && (
                                                    <img src={selectedPost.images.find(img => img.position === 3).image} alt="Detail" style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '20px' }} />
                                                )}
                                                {selectedPost.images?.find(img => img.position === 4) && (
                                                    <img src={selectedPost.images.find(img => img.position === 4).image} alt="Detail" style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '20px' }} />
                                                )}
                                            </div>
                                        )}

                                        {/* Split Section 1 (Position 6) */}
                                        <div className="article_split_section" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', margin: '40px 0' }}>
                                            <div style={{ flex: '1' }}>
                                                {selectedPost.content2 && <div dangerouslySetInnerHTML={{ __html: selectedPost.content2 }} />}
                                            </div>
                                            {selectedPost.images?.find(img => img.position === 6) && (
                                                <div className="article_vertical_image_mini" style={{ width: '250px', flexShrink: 0 }}>
                                                    <img src={selectedPost.images.find(img => img.position === 6).image} alt="Side" style={{ width: '100%', aspectRatio: '2/2', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} />
                                                </div>
                                            )}
                                        </div>

                                        <blockquote style={{ margin: '60px 0', padding: '40px', background: 'rgba(70, 200, 85, 0.05)', borderRadius: '0 20px 20px 0', borderLeft: '4px solid var(--primary-color)', fontStyle: 'italic', fontSize: '1.5rem', color: '#fff', lineHeight: '1.5' }}>
                                            "Coding isn't just about syntax; it's about solving problems and creating experiences that resonate with people."
                                        </blockquote>

                                        {/* Split Section 2 (Position 7) */}
                                        <div className="article_split_section" style={{ display: 'flex', gap: '40px', alignItems: 'center', margin: '40px 0', flexDirection: 'row-reverse' }}>
                                            <div style={{ flex: '1' }}>
                                                {selectedPost.content3 && <div dangerouslySetInnerHTML={{ __html: selectedPost.content3 }} />}
                                            </div>
                                            {selectedPost.images?.find(img => img.position === 7) && (
                                                <div className="article_square_image_mini" style={{ width: '250px', flexShrink: 0 }}>
                                                    <img src={selectedPost.images.find(img => img.position === 7).image} alt="Side" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Wide Section Break (Position 5) */}
                                        {selectedPost.images?.find(img => img.position === 5) && (
                                            <div className="article_break_image" style={{ margin: '80px -20px', width: 'calc(100% + 40px)' }}>
                                                <img src={selectedPost.images.find(img => img.position === 5).image} alt="Divider" style={{ width: '100%', height: '450px', objectFit: 'cover', borderRadius: '30px' }} />
                                            </div>
                                        )}

                                        {/* Cinematic Closing (Position 8) */}
                                        {selectedPost.images?.find(img => img.position === 8) && (
                                            <div className="article_cinematic_image" style={{ margin: '60px 0 40px' }}>
                                                <img src={selectedPost.images.find(img => img.position === 8).image} alt="Closing" style={{ width: '100%', aspectRatio: '21/9', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }} />
                                                {selectedPost.images.find(img => img.position === 8).discription && (
                                                    <div className="image_caption_simple" style={{ marginTop: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', opacity: '0.4', textTransform: 'uppercase', letterSpacing: '1px' }}
                                                        dangerouslySetInnerHTML={{ __html: selectedPost.images.find(img => img.position === 8).discription }} />
                                                )}
                                            </div>
                                        )}
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
        </div>
    );
};

export default ManagePosts;
