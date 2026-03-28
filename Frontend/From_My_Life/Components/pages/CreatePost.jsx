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
        images: [],
        quote: '',
        quote_author: '',
        tags: ''
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
                        images: data.images || [],
                        quote: data.quote || '',
                        quote_author: data.quote_author || '',
                        tags: data.tags || ''
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
                quote: postData.quote,
                quote_author: postData.quote_author,
                tags: postData.tags,
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
                <div className="article_top_nav admin_header_glass">
                    <div className="admin_header_container">
                        <Link to="/admin/posts" className="admin_btn_back">
                            <ChevronLeft size={18} /> Back
                        </Link>
                        <div className="admin_header_actions">
                            <button type="button" onClick={() => navigate('/admin/posts')} className="admin_btn_secondary">Cancel</button>
                            <button type="submit" className="admin_btn_primary" disabled={saving}>
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
                                            <span key={cat.id} className="status_badge publish">
                                                {cat.name}
                                            </span>
                                        ) : null;
                                    })
                                ) : (
                                    <span className="status_badge draft">Uncategorized</span>
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

                        <div className="author_meta_box admin_author_box">
                            <div className="user_avatar">A</div>
                            <div className="user_meta">
                                <strong>Admin Editor</strong>
                                <div className="date_cell">
                                    <span><Calendar size={12} className="text_muted" /> {new Date().toLocaleDateString()}</span>
                                    <span><Eye size={12} className="text_muted" /> Live Preview</span>
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
                            <aside className="editor_sidebar admin_card">
                                <div className="editor_sidebar_group">
                                    <label className="admin_label">Publishing Status</label>
                                    <div className="admin_select_wrapper">
                                        <select
                                            name="status"
                                            className="admin_input"
                                            value={postData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="publish">Published</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </div>
                                    <label className="admin_check_label">
                                        <input
                                            type="checkbox"
                                            name="latest"
                                            className="admin_checkbox"
                                            checked={postData.latest}
                                            onChange={handleChange}
                                        />
                                        <span>Mark as Latest Post</span>
                                    </label>
                                </div>

                                <div className="editor_sidebar_group">
                                    <label className="admin_label">Categories</label>
                                    <div className="category_pill_list editor_selection_list">
                                        {categories.map(cat => (
                                            <div
                                                key={cat.id}
                                                className={`status_badge ${postData.catagory.includes(cat.id) ? 'publish' : 'draft pointer'}`}
                                                onClick={() => handleCategoryChange(cat.id)}
                                            >
                                                {postData.catagory.includes(cat.id) ? <X size={12} /> : <Plus size={12} />} {cat.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="editor_sidebar_group">
                                    <label className="admin_label">SEO Meta</label>
                                    <textarea
                                        ref={textareaRefs.excerpt}
                                        name="excerpt"
                                        className="admin_input"
                                        style={{ minHeight: '120px', resize: 'vertical' }}
                                        value={postData.excerpt}
                                        onChange={handleChange}
                                        placeholder="Add a search-friendly summary..."
                                    />
                                </div>

                                <div className="editor_sidebar_group">
                                    <label className="admin_label">Tags</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        className="admin_input"
                                        value={postData.tags}
                                        onChange={handleChange}
                                        placeholder="Add tags, separated by commas..."
                                    />
                                </div>

                                <div className="modal_actions editor_sidebar_actions">
                                    <button type="submit" className="admin_btn_primary w_full" disabled={saving}>
                                        <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={() => navigate('/admin/posts')} className="admin_btn_secondary w_full">Discard Changes</button>
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

                                <div className="admin_card editor_quote_section">
                                    <div className="modal_icon_box success">
                                        <FileText size={24} />
                                    </div>
                                    <textarea
                                        name="quote"
                                        className="ghost_textarea quote_input"
                                        value={postData.quote}
                                        onChange={handleChange}
                                        placeholder="Add a powerful quote to your story..."
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                    />
                                    <input
                                        type="text"
                                        name="quote_author"
                                        className="quote_author_input"
                                        value={postData.quote_author}
                                        onChange={handleChange}
                                        placeholder="— Enter Quote Author (Optional)"
                                    />
                                </div>

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
                                    {(postData.tags ? postData.tags.split(',').map(tag => tag.trim()) : ['Development', 'Growth', 'Coding']).map(tag => (
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
        <div className={`editor_image_section ${className || ''}`}>
            <label className="admin_label">{label}</label>
            <div
                className="image_edit_surface admin_card"
                onClick={() => fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt={label} className="preview_img" />
                ) : (
                    <div className="image_placeholder">
                        <ImageIcon size={32} />
                        <span>Click to Upload</span>
                    </div>
                )}
                <div className="surface_overlay">
                    <ImageIcon size={20} />
                    <span>Change Image</span>
                </div>
            </div>
            <textarea 
                className="admin_input image_caption"
                placeholder="Image caption..."
                value={description}
                onClick={e => e.stopPropagation()}
                onChange={(e) => handleImageDescriptionChange(position, e.target.value)}
                onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
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
