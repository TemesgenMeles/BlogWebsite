import React, { useState, useEffect } from 'react';
import axiosInstance from '../../src/api/axios';
import { 
    User, Users, Trash2, Mail, Shield, Search, 
    RefreshCcw, UserCheck, UserX, Calendar,
    ChevronLeft, ChevronRight, MoreVertical,
    UserPlus, ShieldAlert, ShieldCheck
} from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Toggling state
    const [processingId, setProcessingId] = useState(null);

    const fetchUsers = async () => {
        setRefreshing(true);
        try {
            const response = await axiosInstance.get('/posts/users/');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (user) => {
        if (!window.confirm(`Are you sure you want to delete ${user.username}? This action is irreversible.`)) return;
        try {
            await axiosInstance.delete(`/posts/users/${user.id}/`);
            setUsers(users.filter((u) => u.id !== user.id));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Cannot delete this user.');
        }
    };

    const toggleRole = async (user) => {
        const newStatus = !user.is_staff;
        const action = newStatus ? 'promote to Staff' : 'demote to Standard';
        
        if (!window.confirm(`Are you sure you want to ${action} ${user.username}?`)) return;
        
        setProcessingId(user.id);
        try {
            const response = await axiosInstance.patch(`/posts/users/${user.id}/`, {
                is_staff: newStatus
            });
            
            if (response.status === 200) {
                setUsers(users.map(u => u.id === user.id ? { ...u, is_staff: newStatus } : u));
            }
        } catch (error) {
            console.error('Error toggling role:', error);
            alert('Failed to update user role. You may not have sufficient permissions.');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.first_name + " " + user.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="admin_management_page animation_fade_in">
            <header className="page_header">
                <div className="header_left">
                    <h1>
                        <Users size={32} className="accent_text" style={{ display: 'inline', marginRight: '16px', verticalAlign: 'bottom', color: 'var(--primary-color)' }} /> 
                        User Directory
                    </h1>
                    <p className="admin_subtitle">
                        Total Registered Accounts: <strong>{users.length}</strong> • 
                        Staff Members: <strong>{users.filter(u => u.is_staff).length}</strong>
                    </p>
                </div>
                <div className="header_actions">
                    <button 
                        className="admin_btn_secondary" 
                        onClick={fetchUsers} 
                        disabled={refreshing}
                    >
                        <RefreshCcw size={18} className={refreshing ? 'spinning' : ''} /> 
                        {refreshing ? 'Syncing...' : 'Refresh List'}
                    </button>
                </div>
            </header>

            <div className="admin_filter_wrapper">
                <div className="search_bar">
                    <Search size={20} />
                    <input 
                        type="text" 
                        placeholder="Search users by name, email or username..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="admin_table_container animation_slide_up">
                {loading ? (
                    <div className="admin_activity_placeholder">
                        <div className="loading_spinner"></div>
                        <p>Accessing user database...</p>
                    </div>
                ) : (
                    <>
                        <table className="admin_table">
                            <thead>
                                <tr>
                                    <th className="text_left">User Identity</th>
                                    <th className="text_left">Contact Information</th>
                                    <th className="text_center">Account Level</th>
                                    <th className="text_center">Joined Date</th>
                                    <th className="text_center">Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="author_cell">
                                                <div className="user_avatar" style={{ 
                                                    background: user.is_staff 
                                                        ? 'linear-gradient(135deg, #6366f1, #4f46e5)' 
                                                        : 'linear-gradient(135deg, #94a3b8, #64748b)',
                                                    boxShadow: user.is_staff ? '0 0 15px rgba(99, 102, 241, 0.3)' : 'none'
                                                }}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="user_meta">
                                                    <strong>{user.username}</strong>
                                                    <span>{user.first_name} {user.last_name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="date_cell">
                                                <span className="text_main">
                                                    <Mail size={14} className="text_muted" style={{ marginRight: '8px' }} /> {user.email || 'No email provided'}
                                                </span>
                                                {user.is_superuser && (
                                                    <span className="text_muted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', marginTop: '4px', color: '#fbbf24' }}>
                                                        <ShieldAlert size={12} style={{ marginRight: '4px' }} /> Master Admin
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text_center">
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <span className={`status_badge ${user.is_staff ? 'publish' : 'draft'}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {user.is_staff ? <ShieldCheck size={12} /> : <User size={12} />}
                                                    {user.is_staff ? 'Staff' : 'Standard'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text_center">
                                            <div className="text_muted" style={{ fontSize: '0.875rem' }}>
                                                <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                                {new Date(user.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="text_center">
                                            <div className="action_cells" style={{ justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => toggleRole(user)}
                                                    className={`action_btn view ${processingId === user.id ? 'spinning' : ''}`}
                                                    title={user.is_staff ? "Demote to Standard" : "Promote to Staff"}
                                                    disabled={user.is_superuser || processingId === user.id}
                                                >
                                                    {user.is_staff ? <UserX size={16} /> : <UserPlus size={16} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(user)}
                                                    className="action_btn delete"
                                                    title="Permanently Delete"
                                                    disabled={user.is_superuser}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text_center p_40 text_muted">
                                            No user records found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="professional_pagination" style={{ padding: '24px', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
                                <button 
                                    className="pagination_nav_btn"
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={18} /> Previous
                                </button>
                                
                                <div className="page_numbers_hub">
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </div>

                                <button 
                                    className="pagination_nav_btn"
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
