import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Search, Filter } from 'lucide-react';

const ManagePosts = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [postsRes, catRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/posts/'),
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

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || 
            post.catagory_details?.some(cat => cat.slug === selectedCategory);
        return matchesSearch && matchesCategory;
    });

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
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map(post => (
                                <tr key={post.id}>
                                    <td>{post.id}</td>
                                    <td className="post_title_cell"><strong>{post.title}</strong></td>
                                    <td>{post.author_name}</td>
                                    <td>
                                        {post.catagory_details?.map(cat => (
                                            <span key={cat.id} className={`table_badge_cat badge_${cat.slug || 'insight'}`}>{cat.name}</span>
                                        ))}
                                    </td>
                                    <td>{new Date(post.published_date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status_badge ${post.status}`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="action_cells">
                                        <Link to={`/posts/${post.id}`} target="_blank" className="action_btn view" title="View Public Post">
                                            <Eye size={16} />
                                        </Link>
                                        <Link to={`/admin/posts/edit/${post.id}`} className="action_btn edit" title="Edit Content">
                                            <Edit2 size={16} />
                                        </Link>
                                        <button onClick={() => handleDelete(post.id)} className="action_btn delete" title="Remove Post">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && filteredPosts.length === 0 && (
                    <div className="admin_activity_placeholder">
                        <p>No matches found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagePosts;
