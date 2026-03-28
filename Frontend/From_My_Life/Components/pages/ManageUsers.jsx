import React, { useState, useEffect } from 'react';
import axiosInstance from '../../src/api/axios';
import { User, Trash2, Mail, Shield } from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/posts/users/');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (user) => {
        if (!window.confirm(`Are you sure you want to delete ${user.username}?`)) return;
        try {
            await axiosInstance.delete(`/posts/users/${user.id}/`);
            setUsers(users.filter((u) => u.id !== user.id));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Cannot delete this user.');
        }
    };

    return (
        <div className="admin_management_page animation_fade_in">
            <header className="page_header">
                <div className="header_left">
                    <h1><Shield size={24} className="accent_text" style={{ display: 'inline', marginRight: '12px', verticalAlign: 'bottom' }} /> User Management</h1>
                    <p>Manage administrative access and user roles.</p>
                </div>
            </header>
 
            <div className="admin_table_container">
                {loading ? (
                    <div className="admin_activity_placeholder">Fetching users...</div>
                ) : (
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th className="text_left pl_20">Administrator</th>
                                <th className="text_left">Contact Email</th>
                                <th className="text_center">Access Level</th>
                                <th className="text_center">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="author_cell">
                                            <div className="user_avatar">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user_meta">
                                                <strong>{user.username}</strong>
                                                <span>ID: #{user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date_cell">
                                            <span>
                                                <Mail size={14} className="text_muted" /> {user.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text_center">
                                        <span className={`status_badge ${user.is_staff || user.is_superuser ? 'publish' : 'draft'}`}>
                                            {user.is_staff || user.is_superuser ? 'Administrator' : 'General User'}
                                        </span>
                                    </td>
                                    <td className="text_center">
                                        <div className="action_cells" style={{ justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => handleDelete(user)}
                                                className="action_btn delete"
                                                title="Revoke Access"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text_center p_20 text_muted">
                                        No administrative users identified.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
