import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, FolderPlus, Tag } from 'lucide-react';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', discription: '' });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId 
            ? `http://127.0.0.1:8000/posts/categories/${editingId}/` 
            : 'http://127.0.0.1:8000/posts/categories/';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                fetchCategories();
                resetForm();
            }
        } catch (error) {
            console.error("Error saving category:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category? Posts using it will remain but without this category.")) return;
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/categories/${id}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setCategories(categories.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat.id);
        setFormData({ name: cat.name, discription: cat.discription || '' });
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', discription: '' });
        setIsAdding(false);
    };

    return (
        <div className="admin_management_page animation_fade_in">
            <header className="page_header">
                <div className="header_left">
                    <h1>Manage Categories</h1>
                    <p>Organize and classify your blog content.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="admin_btn_primary">
                        <Plus size={18} /> Add New Category
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="admin_recent_section mb_lg animation_slide_up" style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0 }}>
                            {editingId ? <Edit2 size={20} /> : <FolderPlus size={20} />} 
                            {editingId ? ' Edit Category' : ' Create New Category'}
                        </h2>
                        <button onClick={resetForm} className="action_btn"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                        <div className="form_group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.875rem' }}>Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Technology" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-main)' }}
                            />
                        </div>
                        <div className="form_group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.875rem' }}>Description</label>
                            <input 
                                type="text" 
                                placeholder="Brief summary of this category" 
                                value={formData.discription}
                                onChange={(e) => setFormData({...formData, discription: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-main)' }}
                            />
                        </div>
                        <div className="form_actions" style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit" className="admin_btn_primary" style={{ padding: '12px' }}>
                                <Check size={18} /> {editingId ? 'Update' : 'Save'}
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
                                <th>Category</th>
                                <th>Slug Identifier</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className={`table_badge_cat badge_${cat.slug || 'insight'}`} style={{ padding: '8px' }}>
                                            <Tag size={16} />
                                        </div>
                                        <strong>{cat.name}</strong>
                                    </td>
                                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.875rem', color: '#475569' }}>{cat.slug}</code></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{cat.discription || 'No description provided.'}</td>
                                    <td className="action_cells">
                                        <button onClick={() => startEdit(cat)} className="action_btn edit" title="Edit Category">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="action_btn delete" title="Delete Category">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && categories.length === 0 && (
                    <div className="admin_activity_placeholder">
                        <p>No categories found. Create one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageCategories;
