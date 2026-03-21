import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Image as ImageIcon, Plus } from 'lucide-react';

const CreatePost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [postData, setPostData] = useState({
        title: '',
        main_content: '',
        excerpt: '',
        content1: '',
        content2: '',
        content3: '',
        status: 'publish',
        latest: false,
        catagory: []
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catRes = await fetch('http://127.0.0.1:8000/posts/categories/');
                const catData = await catRes.json();
                setCategories(catData);

                if (isEdit) {
                    const postRes = await fetch(`http://127.0.0.1:8000/posts/${id}/`);
                    const data = await postRes.json();
                    setPostData({
                        title: data.title,
                        main_content: data.main_content,
                        excerpt: data.excerpt || '',
                        content1: data.content1 || '',
                        content2: data.content2 || '',
                        content3: data.content3 || '',
                        status: data.status,
                        latest: data.latest,
                        catagory: data.catagory ? data.catagory.map(c => c.id || c) : []
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPostData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryChange = (catId) => {
        setPostData(prev => {
            const newCats = prev.catagory.includes(catId)
                ? prev.catagory.filter(c => c !== catId)
                : [...prev.catagory, catId];
            return { ...prev, catagory: newCats };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = isEdit
                ? `http://127.0.0.1:8000/posts/${id}/`
                : 'http://127.0.0.1:8000/posts/';

            const method = isEdit ? 'PUT' : 'POST';

            // Note: In a real app, author would be from session
            const body = {
                ...postData,
                author: postData.author || 1 // Placeholder admin user ID
            };

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                navigate('/admin/posts');
            } else {
                const errorData = await response.json();
                console.error("Error saving post:", errorData);
                alert("Error saving post. Check console.");
            }
        } catch (error) {
            console.error("Error saving post:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="admin_loader">Loading post editor...</div>;

    return (
        <div className="admin_form_page">
            <header className="page_header">
                <h1>{isEdit ? 'Edit Post' : 'Create New Post'}</h1>
                <div className="header_actions">
                    <button onClick={() => navigate('/admin/posts')} className="admin_btn_secondary">
                        <X size={18} /> Cancel
                    </button>
                    <button onClick={handleSubmit} className="admin_btn_primary" disabled={saving}>
                        <Save size={18} /> {saving ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </header>

            <form className="admin_form" onSubmit={handleSubmit}>
                <div className="form_main">
                    <div className="form_group">
                        <label>Post Title</label>
                        <input
                            type="text"
                            name="title"
                            value={postData.title}
                            onChange={handleChange}
                            placeholder="Enter post title"
                            required
                        />
                    </div>

                    <div className="form_group">
                        <label>Main Content (Markdown supported)</label>
                        <textarea
                            name="main_content"
                            value={postData.main_content}
                            onChange={handleChange}
                            placeholder="Write your main story here..."
                            rows={10}
                            required
                        />
                    </div>

                    <div className="form_grid">
                        <div className="form_group">
                            <label>Content Section 1 (Optional)</label>
                            <textarea name="content1" value={postData.content1} onChange={handleChange} rows={5} />
                        </div>
                        <div className="form_group">
                            <label>Content Section 2 (Optional)</label>
                            <textarea name="content2" value={postData.content2} onChange={handleChange} rows={5} />
                        </div>
                    </div>

                    <div className="form_group">
                        <label>Excerpt / Summary</label>
                        <textarea name="excerpt" value={postData.excerpt} onChange={handleChange} rows={3} placeholder="A short summary for previews" />
                    </div>
                </div>

                <aside className="form_sidebar">
                    <div className="sidebar_card">
                        <h3>Publishing</h3>
                        <div className="form_group">
                            <label>Status</label>
                            <select name="status" value={postData.status} onChange={handleChange}>
                                <option value="publish">Publish</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                        <div className="form_checkbox">
                            <input
                                type="checkbox"
                                id="latest"
                                name="latest"
                                checked={postData.latest}
                                onChange={handleChange}
                            />
                            <label htmlFor="latest">Mark as Latest</label>
                        </div>
                    </div>

                    <div className="sidebar_card">
                        <h3>Categories</h3>
                        <div className="category_selector">
                            {categories.map(cat => (
                                <div key={cat.id} className="cat_item">
                                    <input
                                        type="checkbox"
                                        id={`cat-${cat.id}`}
                                        checked={postData.catagory.includes(cat.id)}
                                        onChange={() => handleCategoryChange(cat.id)}
                                    />
                                    <label htmlFor={`cat-${cat.id}`}>{cat.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar_card">
                        <h3>Images</h3>
                        <p className="hint">Images are managed in the post detail view currently.</p>
                        <div className="image_placeholder_btn">
                            <ImageIcon size={24} />
                            <span>Media Manager</span>
                        </div>
                    </div>
                </aside>
            </form>
        </div>
    );
};

export default CreatePost;
