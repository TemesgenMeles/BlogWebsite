import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, FolderPlus, Tag } from 'lucide-react';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', discription: '' });
    const [showSuccess, setShowSuccess] = useState(false);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/posts/categories/');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const [isUpdating, setIsUpdating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingId) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/categories/${editingId}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                await fetchCategories();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                resetForm();
            }
        } catch (error) {
            console.error("Error updating category:", error);
        } finally {
            setIsUpdating(false);
        }
    };



    const startEdit = (cat) => {
        setEditingId(cat.id);
        setFormData({ name: cat.name, discription: cat.discription || '' });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', discription: '' });
        setIsEditing(false);
    };

    return (
        <div className="admin_management_page animation_fade_in">
            <header className="page_header">
                <div className="header_left">
                    <h1>Manage Categories</h1>
                    <p>Refine and organize your content categories.</p>
                </div>
            </header>

            {isEditing && (
                <div className="admin_edit_section animation_slide_up">
                    <div className="section_header">
                        <div className="header_title">
                            <Edit2 size={24} className="accent_text" />
                            <h2>Edit Category: <span>{formData.name}</span></h2>
                        </div>
                        <button onClick={resetForm} className="close_btn"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="admin_form_inline">
                        <div className="form_group">
                            <label>Category Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Technology" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form_group">
                            <label>Description</label>
                            <input 
                                type="text" 
                                placeholder="Brief summary of this category" 
                                value={formData.discription}
                                onChange={(e) => setFormData({...formData, discription: e.target.value})}
                            />
                        </div>
                        <div className="form_actions">
                            <button type="submit" className="admin_btn_primary" disabled={isUpdating}>
                                {isUpdating ? 'Synchronizing...' : 'Update Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin_table_container">
                {loading ? (
                    <div className="admin_activity_placeholder">Synchronizing categories...</div>
                ) : (
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th className="text_left pl_20">Category</th>
                                <th className="text_left">Slug Identifier</th>
                                <th className="text_left">Description</th>
                                <th className="text_center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>
                                        <div className="category_name_cell">
                                            <div className={`cat_icon badge_${cat.slug || 'insight'}`}>
                                                <Tag size={16} />
                                            </div>
                                            <strong>{cat.name}</strong>
                                        </div>
                                    </td>
                                    <td><code className="admin_code">{cat.slug}</code></td>
                                    <td className="desc_cell">{cat.discription || 'No description provided.'}</td>
                                    <td className="action_cells">
                                        <button onClick={() => startEdit(cat)} className="action_btn edit" title="Edit Category">
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Success Toast */}
            {showSuccess && (
                <div className="admin_toast success animation_slide_up">
                    <Check size={18} /> Category updated successfully!
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
