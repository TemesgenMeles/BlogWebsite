import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Save, X, Image as ImageIcon, Plus,
    ChevronLeft, Clock, Calendar, User, Eye,
    FileText, Heart, Twitter, Linkedin, Link as LinkIcon
} from 'lucide-react';

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
        catagory: [],
        images: []
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    // Auto-expand textareas
    const textareaRefs = {
        main_content: useRef(null),
        content1: useRef(null),
        content2: useRef(null),
        content3: useRef(null),
        excerpt: useRef(null),
    };

    const adjustTextareaHeight = (name) => {
        const ref = textareaRefs[name];
        if (ref && ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = ref.current.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        Object.keys(textareaRefs).forEach(name => adjustTextareaHeight(name));
    }, [postData, loading]);

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
                        catagory: data.catagory ? data.catagory.map(c => c.id || c) : [],
                        images: data.images || []
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPostData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (textareaRefs[name]) adjustTextareaHeight(name);
    };

    const handleCategoryChange = (catId) => {
        setPostData(prev => {
            const isSelected = prev.catagory.includes(catId);
            const newCats = isSelected
                ? prev.catagory.filter(c => c !== catId)
                : [...prev.catagory, catId];
            return { ...prev, catagory: newCats };
        });
    };

    const handleImageChange = (position, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setPostData(prev => {
                const existingImages = [...prev.images];
                const idx = existingImages.findIndex(img => img.position === position);
                const imageData = {
                    ...existingImages[idx],
                    position,
                    file,
                    preview: reader.result,
                    isNew: true
                };
                if (idx > -1) {
                    existingImages[idx] = imageData;
                } else {
                    existingImages.push(imageData);
                }
                return { ...prev, images: existingImages };
            });
        };
        reader.readAsDataURL(file);
    };

    const handleImageDescriptionChange = (position, desc) => {
        setPostData(prev => {
            const existingImages = [...prev.images];
            const idx = existingImages.findIndex(img => img.position === position);
            if (idx > -1) {
                existingImages[idx] = { ...existingImages[idx], discription: desc, isNew: true };
            } else {
                existingImages.push({ position, discription: desc, isNew: true });
            }
            return { ...prev, images: existingImages };
        });
    };

    const getImagePreview = (pos) => {
        const img = postData.images.find(i => i.position === pos);
        if (!img) return '';
        return img.preview || img.image;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            // 1. Save the Post first
            const postUrl = isEdit
                ? `http://127.0.0.1:8000/posts/${id}/`
                : 'http://127.0.0.1:8000/posts/';
            const postMethod = isEdit ? 'PUT' : 'POST';

            const postBody = {
                title: postData.title,
                main_content: postData.main_content,
                excerpt: postData.excerpt,
                content1: postData.content1,
                content2: postData.content2,
                content3: postData.content3,
                status: postData.status,
                latest: postData.latest,
                catagory: postData.catagory,
                author: 1
            };

            const postResponse = await fetch(postUrl, {
                method: postMethod,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postBody)
            });

            if (!postResponse.ok) {
                const errorData = await postResponse.json();
                throw new Error("Failed to save post metadata");
            }

            const savedPost = await postResponse.json();
            const postId = savedPost.id;

            // 2. Upload new/changed images/descriptions
            const imageUploadPromises = postData.images
                .filter(img => img.isNew)
                .map(async (img) => {
                    const formData = new FormData();
                    formData.append('post', postId);
                    formData.append('position', img.position);
                    
                    // Only append image if it's a new file (Blob/File)
                    if (img.file instanceof File || img.file instanceof Blob) {
                        formData.append('image', img.file);
                    }
                    
                    if (img.discription !== undefined) {
                        formData.append('discription', img.discription);
                    }

                    const isUpdate = !!img.id;
                    const imgUrl = isUpdate 
                        ? `http://127.0.0.1:8000/posts/post-images/${img.id}/`
                        : 'http://127.0.0.1:8000/posts/post-images/';
                    const imgMethod = isUpdate ? 'PATCH' : 'POST';

                    return fetch(imgUrl, {
                        method: imgMethod,
                        body: formData
                    });
                });

            await Promise.all(imageUploadPromises);
            navigate('/admin/posts');

        } catch (error) {
            console.error("Error in submission:", error);
            alert("Error saving post or images. Check console.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="loading_screen">
            <div className="loader"></div>
            <p>Preparing the editor...</p>
        </div>
    );

    return (
        <article className="post_detail_wrapper editor_mode">
            <form onSubmit={handleSubmit}>
                {/* Minimal Header */}
                <div className="article_top_nav">
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to="/admin/posts" className="back_btn">
                            <ChevronLeft size={20} /> Back to Dashboard
                        </Link>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button type="button" onClick={() => navigate('/admin/posts')} className="admin_btn_cancel">Cancel</button>
                            <button type="submit" className="admin_btn_save" disabled={saving}>
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Story'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="article_hero">
                    <div className="container_narrow">
                        <div className="article_meta_header">
                            <div className="category_pill_list">
                                {postData.catagory.length > 0 ? (
                                    postData.catagory.map(catId => {
                                        const cat = categories.find(c => c.id === catId);
                                        return cat ? (
                                            <span key={cat.id} className={`category_pill badge_${cat.slug || 'insight'}`} style={{ marginRight: '10px' }}>
                                                {cat.name}
                                            </span>
                                        ) : null;
                                    })
                                ) : (
                                    <span className="category_pill" style={{ opacity: 0.3 }}>No Category Selected</span>
                                )}
                            </div>
                            <div className="read_time"><Clock size={14} /> Live Preview Mode</div>
                        </div>

                        <textarea
                            ref={textareaRefs.title}
                            name="title"
                            className="ghost_textarea article_title"
                            value={postData.title}
                            onChange={handleChange}
                            placeholder="Enter a gripping title..."
                            required
                        />

                        <div className="author_meta_box">
                            <div className="avatar_initials">A</div>
                            <div className="author_info">
                                <h4>Admin Editor</h4>
                                <div className="meta_details">
                                    <span className="meta_item"><Calendar size={12} /> {new Date().toLocaleDateString()}</span>
                                    <span className="meta_item"><Eye size={12} /> Live Preview</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container_narrow">
                    <ImageEditor 
                        position={1} 
                        label="Featured Hero Image" 
                        className="article_featured_image" 
                        images={postData.images}
                        getImagePreview={getImagePreview}
                        handleImageChange={handleImageChange}
                        handleImageDescriptionChange={handleImageDescriptionChange}
                    />
                </div>

                {/* Content Section */}
                <div className="article_body_container">
                    <div className="container_narrow">
                        <div className="article_content_grid">
                            {/* Sticky Sidebar */}
                            <aside className="share_sidebar_sticky">
                                <div className="editor_sidebar_group">
                                    <span className="editor_sidebar_label">Publishing</span>
                                    <select
                                        name="status"
                                        className="editor_status_select"
                                        value={postData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="publish">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                    <label className="editor_checkbox_row">
                                        <input
                                            type="checkbox"
                                            name="latest"
                                            checked={postData.latest}
                                            onChange={handleChange}
                                        />
                                        Latest Post
                                    </label>
                                </div>

                                <div className="editor_sidebar_group">
                                    <span className="editor_sidebar_label">Categories</span>
                                    <div className="editor_cat_list">
                                        {categories.map(cat => (
                                            <div
                                                key={cat.id}
                                                className={`editor_cat_pill ${postData.catagory.includes(cat.id) ? 'active' : ''}`}
                                                onClick={() => handleCategoryChange(cat.id)}
                                            >
                                                <Plus size={14} /> {cat.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="editor_actions_row">
                                    <button type="submit" className="admin_btn_save" disabled={saving}>
                                        <Save size={18} /> {saving ? 'Save' : 'Save Story'}
                                    </button>
                                    <Link to="/admin/posts" className="admin_btn_cancel">Discard Changes</Link>
                                </div>
                            </aside>

                            {/* Main Text Content */}
                            <div className="article_rich_text">
                                {/* Lead Content */}
                                <EditableContent
                                    name="main_content"
                                    placeholder="Start your story with a compelling intro..."
                                    className="lead_content_textarea"
                                    content={postData.main_content}
                                    setPostData={setPostData}
                                />

                                {/* Image 2 - Inset Image */}
                                <ImageEditor 
                                    position={2} 
                                    label="Contextual Image" 
                                    className="article_inset_image" 
                                    images={postData.images}
                                    getImagePreview={getImagePreview}
                                    handleImageChange={handleImageChange}
                                    handleImageDescriptionChange={handleImageDescriptionChange}
                                />

                                {/* Content Block 1 */}
                                <EditableContent
                                    name="content1"
                                    placeholder="Add a dropcap section or sub-heading content..."
                                    style={{ fontWeight: 800, marginBottom: '40px' }}
                                    content={postData.content1}
                                    setPostData={setPostData}
                                />

                                {/* Image 3 & 4 - Gallery Grid */}
                                <div className="article_gallery_grid">
                                    <ImageEditor 
                                        position={3} 
                                        label="Gallery Image Left" 
                                        images={postData.images}
                                        getImagePreview={getImagePreview}
                                        handleImageChange={handleImageChange}
                                        handleImageDescriptionChange={handleImageDescriptionChange}
                                    />
                                    <ImageEditor 
                                        position={4} 
                                        label="Gallery Image Right" 
                                        images={postData.images}
                                        getImagePreview={getImagePreview}
                                        handleImageChange={handleImageChange}
                                        handleImageDescriptionChange={handleImageDescriptionChange}
                                    />
                                </div>

                                {/* Split Section 1: Image Right + Text Left */}
                                <div className="article_split_section">
                                    <ImageEditor 
                                        position={6} 
                                        label="Perspective view" 
                                        className="split_media article_vertical_image_mini" 
                                        images={postData.images}
                                        getImagePreview={getImagePreview}
                                        handleImageChange={handleImageChange}
                                        handleImageDescriptionChange={handleImageDescriptionChange}
                                    />
                                    <EditableContent
                                        name="content2"
                                        placeholder="Text that wraps around the image..."
                                        content={postData.content2}
                                        setPostData={setPostData}
                                    />
                                </div>

                                <blockquote>
                                    "Your powerful quote will appear here. Edit it below."
                                </blockquote>

                                {/* Split Section 2: Image Right + Text Left */}
                                <div className="article_split_section">
                                    <ImageEditor 
                                        position={7} 
                                        label="Detail focus" 
                                        className="split_media article_square_image_mini" 
                                        images={postData.images}
                                        getImagePreview={getImagePreview}
                                        handleImageChange={handleImageChange}
                                        handleImageDescriptionChange={handleImageDescriptionChange}
                                    />
                                    <EditableContent
                                        name="content3"
                                        placeholder="Closing thoughts or detailed analysis..."
                                        content={postData.content3}
                                        setPostData={setPostData}
                                    />
                                </div>

                                <div className="editor_sidebar_group" style={{ margin: '40px 0', background: 'rgba(70, 200, 85, 0.05)' }}>
                                    <span className="editor_sidebar_label">SEO Excerpt / Summary</span>
                                    <textarea
                                        ref={textareaRefs.excerpt}
                                        name="excerpt"
                                        className="ghost_textarea"
                                        style={{ marginBottom: 0, fontSize: '1rem' }}
                                        value={postData.excerpt}
                                        onChange={handleChange}
                                        placeholder="A short summary for search engines and social cards..."
                                    />
                                </div>

                                {/* Image 5 - Wide Section Break */}
                                <ImageEditor 
                                    position={5} 
                                    label="Section Divider" 
                                    className="article_break_image" 
                                    images={postData.images}
                                    getImagePreview={getImagePreview}
                                    handleImageChange={handleImageChange}
                                    handleImageDescriptionChange={handleImageDescriptionChange}
                                />

                                {/* Image 8 - Panoramic/Cinematic Closing */}
                                <ImageEditor 
                                    position={8} 
                                    label="Cinematic Outro" 
                                    className="article_cinematic_image" 
                                    images={postData.images}
                                    getImagePreview={getImagePreview}
                                    handleImageChange={handleImageChange}
                                    handleImageDescriptionChange={handleImageDescriptionChange}
                                />

                                <div className="in_article_tags">
                                    {['Development', 'Growth', 'Coding'].map(tag => (
                                        <span key={tag} className="content_tag">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </article>
    );
};

// Sub-components defined outside to prevent focus/remount issues
const ImageEditor = ({ position, label, className, images, getImagePreview, handleImageChange, handleImageDescriptionChange }) => {
    const img = images.find(i => i.position === position);
    const previewUrl = getImagePreview(position);
    const description = img?.discription || '';
    const fileInputRef = useRef(null);

    return (
        <div className={`article_image_container ${className || ''}`}>
            <div
                className="image_edit_container"
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div className="image_fallback_hero" style={{ background: 'rgba(255,255,255,0.05)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={48} opacity={0.2} />
                    </div>
                )}
                <div className="image_upload_overlay">
                    <ImageIcon size={24} />
                    <span style={{ fontSize: '0.8rem' }}>Upload {label}</span>
                </div>
            </div>
            <textarea 
                className="editor_figcaption"
                placeholder="Add description..."
                value={description}
                onClick={e => e.stopPropagation()}
                onChange={(e) => handleImageDescriptionChange(position, e.target.value)}
                onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
                style={{ height: 'auto' }}
            />
            <input
                type="file"
                ref={fileInputRef}
                className="media_input_hidden"
                accept="image/*"
                onChange={e => handleImageChange(position, e.target.files[0])}
            />
        </div>
    );
};

const EditableContent = ({ name, placeholder, className, style, content, setPostData }) => {
    return (
        <div
            contentEditable
            suppressContentEditableWarning
            className={`editor_content_editable ${className || ''}`}
            style={style}
            data-placeholder={placeholder}
            onBlur={(e) => {
                setPostData(prev => ({ ...prev, [name]: e.target.innerText }));
            }}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};


export default CreatePost;
