import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../src/api/axios';
import AuthContext from '../../src/context/AuthContext';
import {
    User, Users, Trash2, Mail, Shield, Search,
    RefreshCcw, UserCheck, UserX, Calendar,
    ChevronLeft, ChevronRight, MoreVertical,
    UserPlus, ShieldAlert, ShieldCheck, X, Edit2, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';



const ManageUsers = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: '',
        is_active: true,
        is_staff: false,
        is_superuser: false
    });


    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        user: null,
        onConfirm: null,
        isDanger: false
    });

    // Toggling state
    const [processingId, setProcessingId] = useState(null);


    const fetchCurrentUser = async () => {
        try {
            const response = await axiosInstance.get('/posts/users/me/');
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

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
        // Security check: only superusers can access this page
        if (user && !user.is_superuser) {
            navigate('/admin');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchCurrentUser();
        fetchUsers();
    }, []);

    const filteredUsers = React.useMemo(() => {
        return users.filter(usr =>
            usr.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (usr.first_name + " " + usr.last_name).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const sortedUsers = React.useMemo(() => {
        if (!currentUser) return filteredUsers;
        const others = filteredUsers.filter(u => u.id !== currentUser.id);
        const me = filteredUsers.find(u => u.id === currentUser.id);
        return me ? [me, ...others] : filteredUsers;
    }, [filteredUsers, currentUser]);


    const handleDelete = async (user) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Account',
            message: `Are you sure you want to delete ${user.username}? This action is irreversible and all associated data will be lost.`,
            user: user,
            isDanger: true,
            onConfirm: async () => {
                try {
                    await axiosInstance.delete(`/posts/users/${user.id}/`);
                    setUsers(users.filter((u) => u.id !== user.id));
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error deleting user:', error);
                    alert('Cannot delete this user.');
                }
            }
        });
    };


    const handleEdit = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            username: user.username,
            password: '', // Keep empty for editing unless user wants to change it
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_active: user.is_active,
            is_staff: user.is_staff,
            is_superuser: user.is_superuser
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setModalMode('create');
        setSelectedUser(null);
        setFormData({
            username: '',
            password: '',
            email: '',
            first_name: '',
            last_name: '',
            is_active: true,
            is_staff: false,
            is_superuser: false
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setRefreshing(true);
        try {
            if (modalMode === 'create') {
                const response = await axiosInstance.post('/posts/users/', formData);
                setUsers([response.data, ...users]);
            } else {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                const response = await axiosInstance.patch(`/posts/users/${selectedUser.id}/`, updateData);
                setUsers(users.map(u => u.id === selectedUser.id ? response.data : u));
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Failed to save user. Please check your data.');
        } finally {
            setRefreshing(false);
        }
    };

    const toggleActive = async (user) => {
        if (user.id === currentUser?.id) {
            alert("You cannot deactivate your own account from the User Directory.");
            return;
        }
        setProcessingId(user.id);
        try {
            const response = await axiosInstance.patch(`/posts/users/${user.id}/`, {
                is_active: !user.is_active
            });
            setUsers(users.map(u => u.id === user.id ? { ...u, is_active: response.data.is_active } : u));
        } catch (error) {
            console.error('Error toggling active status:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const toggleRole = async (user) => {
        if (user.id === currentUser?.id) {
            alert("You cannot change your own role.");
            return;
        }
        const newStatus = !user.is_staff;
        const action = newStatus ? 'promote to Staff' : 'demote to Standard';

        setConfirmModal({
            isOpen: true,
            title: 'Update User Role',
            message: `Are you sure you want to ${action} ${user.username}?`,
            user: user,
            isDanger: false,
            onConfirm: async () => {
                setProcessingId(user.id);
                try {
                    const response = await axiosInstance.patch(`/posts/users/${user.id}/`, {
                        is_staff: newStatus
                    });

                    if (response.status === 200) {
                        setUsers(users.map(u => u.id === user.id ? { ...u, is_staff: newStatus } : u));
                    }
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error toggling role:', error);
                    alert('Failed to update user role. You may not have sufficient permissions.');
                } finally {
                    setProcessingId(null);
                }
            }
        });
    };




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
                        className="admin_btn_primary"
                        onClick={handleCreate}
                    >
                        <UserPlus size={18} />
                        Register New User
                    </button>
                    <button
                        className="admin_btn_secondary"
                        onClick={fetchUsers}
                        disabled={refreshing}
                    >
                        <RefreshCcw size={18} className={refreshing ? 'spinning' : ''} />
                        {refreshing ? 'Syncing...' : 'Refresh'}
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
                                {sortedUsers.slice(indexOfFirstItem, indexOfLastItem).map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`
                                            ${user.id === currentUser?.id ? 'active_user_row' : ''} 
                                            ${user.id !== currentUser?.id ? (user.is_active ? 'user_row_active' : 'user_row_disabled') : ''}
                                        `}
                                    >
                                        <td>
                                            <div className="author_cell">
                                                <div className={`user_status_tag ${user.is_active ? 'tag_active' : 'tag_disabled'}`}>
                                                    {user.is_active ? 'Active' : 'Disabled'}
                                                </div>
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
                                                {user.id !== currentUser?.id && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="action_btn view"
                                                            title="Edit User"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleActive(user)}
                                                            className={`action_btn ${user.is_active ? 'delete' : 'publish'} ${processingId === user.id ? 'spinning' : ''}`}
                                                            title={user.is_active ? "Disable Account" : "Enable Account"}
                                                            disabled={processingId === user.id}
                                                        >
                                                            {user.is_active ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                                        </button>
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
                                                    </>
                                                )}
                                                {user.id === currentUser?.id && (
                                                    <span className="text_muted" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Your Account</span>
                                                )}
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

            {/* User Registration/Edit Modal */}
            {isModalOpen && (
                <div className="admin_modal_overlay animation_fade_in">
                    <div className="admin_modal_content animation_slide_up" style={{ maxWidth: '600px' }}>
                        <div className="modal_header">
                            <h2>{modalMode === 'create' ? 'Register New User' : 'Edit User Details'}</h2>
                            <button className="close_btn" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="modal_form">
                            <div className="form_grid">
                                <div className="form_group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        disabled={modalMode === 'edit'}
                                    />
                                </div>
                                <div className="form_group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form_group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </div>
                                <div className="form_group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </div>
                                {modalMode === 'create' && (
                                    <div className="form_group full_width">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="Enter password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="permissions_section">
                                <h3>Permissions & Access</h3>
                                <div className="checkbox_group">
                                    <label className="checkbox_label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        <span>Account Active</span>
                                    </label>
                                    <label className="checkbox_label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_staff}
                                            onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                                        />
                                        <span>Staff Status</span>
                                    </label>
                                    <label className="checkbox_label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_superuser}
                                            onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                                        />
                                        <span>Superuser Status</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal_actions">
                                <button type="button" className="admin_btn_secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin_btn_primary">
                                    {modalMode === 'create' ? 'Register Account' : 'Update User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="admin_modal_overlay animation_fade_in">
                    <div className="admin_modal_content animation_slide_up" style={{ maxWidth: '450px' }}>
                        <div className="modal_header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <AlertTriangle size={20} style={{ color: confirmModal.isDanger ? 'var(--danger)' : 'var(--warning)' }} />
                                {confirmModal.title}
                            </h2>
                            <button className="close_btn" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal_body" style={{ padding: '32px' }}>
                            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', lineHeight: '1.6' }}>
                                {confirmModal.message}
                            </p>
                        </div>
                        <div className="modal_footer" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)' }}>
                            <button className="admin_btn_secondary" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
                                Cancel
                            </button>
                            <button
                                className={confirmModal.isDanger ? 'admin_btn_danger' : 'admin_btn_primary'}
                                onClick={confirmModal.onConfirm}
                            >
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;

