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
                <div className="admin_recent_section mb_lg animation_slide_up" style={{ marginBottom: '32px', background: 'rgba(70, 200, 85, 0.05)', borderRadius: '20px', border: '1px solid rgba(70, 200, 85, 0.1)', padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
                            <Edit2 size={24} color="var(--primary-color)" /> Edit Category: <span style={{ color: 'var(--primary-color)' }}>{formData.name}</span>
                        </h2>
                        <button onClick={resetForm} className="close_btn" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '20px', alignItems: 'end' }}>
                        <div className="form_group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.9rem', color: '#94a3b8' }}>Category Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Technology" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px' }}
                            />
                        </div>
                        <div className="form_group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.9rem', color: '#94a3b8' }}>Description</label>
                            <input 
                                type="text" 
                                placeholder="Brief summary of this category" 
                                value={formData.discription}
                                onChange={(e) => setFormData({...formData, discription: e.target.value})}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px' }}
                            />
                        </div>
                        <div className="form_actions">
                            <button type="submit" className="admin_btn_primary" style={{ padding: '12px 24px' }} disabled={isUpdating}>
                                {isUpdating ? (
                                    <>Synchronizing...</>
                                ) : (
                                    <><Check size={18} /> Update Category</>
                                )}
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
                                <th style={{ textAlign: 'left', paddingLeft: '20px' }}>Category</th>
                                <th style={{ textAlign: 'left' }}>Slug Identifier</th>
                                <th style={{ textAlign: 'left' }}>Description</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td style={{ paddingLeft: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className={`table_badge_cat badge_${cat.slug || 'insight'}`} style={{ padding: '8px' }}>
                                                <Tag size={16} />
                                            </div>
                                            <strong>{cat.name}</strong>
                                        </div>
                                    </td>
                                    <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)' }}>{cat.slug}</code></td>
                                    <td style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{cat.discription || 'No description provided.'}</td>
                                    <td className="action_cells" style={{ textAlign: 'center', display: 'table-cell' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button onClick={() => startEdit(cat)} className="action_btn edit" title="Edit Category" style={{ padding: '10px' }}>
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Success Toast */}
            {showSuccess && (
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
                }}>
                    <Check size={20} /> Category updated successfully!
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
