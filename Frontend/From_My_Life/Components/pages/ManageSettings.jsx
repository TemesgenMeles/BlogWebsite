import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../src/api/axios';
import AuthContext from '../../src/context/AuthContext';
import { 
    Settings, User, Shield, Lock, Save, 
    AlertCircle, CheckCircle2, UserCircle, 
    Mail, BadgeCheck, ShieldAlert 
} from 'lucide-react';

const ManageSettings = () => {
    const { user, setUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile State
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/posts/users/me/');
                setProfileData({
                    username: response.data.username || user?.username || '',
                    email: response.data.email || user?.email || '',
                    first_name: response.data.first_name || user?.first_name || '',
                    last_name: response.data.last_name || user?.last_name || ''
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                // Fallback to names from JWT token in AuthContext
                if (user) {
                    setProfileData({
                        username: user.username || '',
                        email: user.email || '',
                        first_name: user.first_name || '',
                        last_name: user.last_name || ''
                    });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await axiosInstance.patch('/posts/users/me/', profileData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Optionally update AuthContext if username changed
            if (setUser) {
                setUser(prev => ({ 
                    ...prev, 
                    ...response.data,
                    // Explicitly pass names to ensure context is updated
                    first_name: response.data.first_name,
                    last_name: response.data.last_name 
                }));
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setLoading(true);
        try {
            await axiosInstance.patch('/posts/users/me/', {
                password: passwordData.new_password
            });
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (user.is_superuser) {
            setMessage({ type: 'error', text: 'Administrators cannot deactivate their own accounts. Please contact another administrator.' });
            return;
        }

        if (window.confirm("Are you sure you want to deactivate your account? You will be logged out immediately.")) {
            setLoading(true);
            try {
                await axiosInstance.patch('/posts/users/me/', { is_active: false });
                // Log out after deactivation
                if (window.location.pathname.includes('/admin')) {
                    window.location.href = '/login';
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to deactivate account.' });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="admin_management_page animation_fade_in">
            <header className="page_header">
                <div className="header_left">
                    <h1>
                        <Settings size={32} className="accent_text" style={{ display: 'inline', marginRight: '16px', verticalAlign: 'bottom', color: 'var(--primary-color)' }} />
                        Account Settings
                    </h1>
                    <p className="admin_subtitle">Manage your profile, security preferences, and account details.</p>
                </div>
            </header>

            <div className="settings_container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', marginTop: '32px' }}>
                {/* Sidebar Tabs */}
                <div className="settings_sidebar">
                    <button 
                        className={`settings_tab_btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} /> Profile Information
                    </button>
                    <button 
                        className={`settings_tab_btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <Lock size={18} /> Password & Security
                    </button>
                    <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                        <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Account Status</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                            {user?.is_superuser ? <ShieldAlert size={16} style={{ color: '#fbbf24' }} /> : <BadgeCheck size={16} style={{ color: '#10b981' }} />}
                            {user?.is_superuser ? 'Master Admin' : 'Staff Member'}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="settings_content_card" style={{ background: 'var(--bg-white)', borderRadius: '24px', border: '1px solid var(--card-border)', padding: '40px', boxShadow: 'var(--card-shadow)' }}>
                    {message.text && (
                        <div className={`settings_alert ${message.type === 'success' ? 'success' : 'error'}`} style={{
                            padding: '16px 20px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '32px',
                            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#10b981' : '#ef4444',
                            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="settings_section animation_slide_up">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Profile Details</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>Update your personal info and how others see you on the platform.</p>
                            
                            <form onSubmit={handleProfileUpdate} className="settings_form">
                                <div className="form_grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="form_group">
                                        <label>Username</label>
                                        <input 
                                            type="text" 
                                            value={profileData.username}
                                            onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                            disabled // Keep username fixed for stability, or enable if backend supports
                                        />
                                        <span className="settings_help_text">Username cannot be changed.</span>
                                    </div>
                                    <div className="form_group">
                                        <label>Email Address</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="form_group">
                                        <label>First Name</label>
                                        <input 
                                            type="text" 
                                            value={profileData.first_name}
                                            onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="form_group">
                                        <label>Last Name</label>
                                        <input 
                                            type="text" 
                                            value={profileData.last_name}
                                            onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="settings_actions" style={{ marginTop: '40px' }}>
                                    <button type="submit" className="admin_btn_primary" disabled={loading}>
                                        <Save size={18} /> {loading ? 'Saving Changes...' : 'Save Profile Details'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings_section animation_slide_up">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Security Settings</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>Update your password to keep your account secure.</p>
                            
                            <form onSubmit={handlePasswordChange} className="settings_form">
                                <div className="form_group" style={{ maxWidth: '400px', marginBottom: '24px' }}>
                                    <label>New Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        placeholder="Min. 8 characters"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                    />
                                </div>
                                <div className="form_group" style={{ maxWidth: '400px', marginBottom: '24px' }}>
                                    <label>Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                    />
                                </div>
                                <div className="settings_actions" style={{ marginTop: '40px' }}>
                                    <button type="submit" className="admin_btn_primary" disabled={loading}>
                                        <Shield size={18} /> {loading ? 'Updating Password...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>

                            <div style={{ marginTop: '48px', padding: '32px', background: 'rgba(239, 68, 68, 0.03)', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                <h4 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <AlertCircle size={18} /> Danger Zone
                                </h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                    {user?.is_superuser 
                                        ? "Administrators cannot deactivate their own accounts for security reasons. Another admin must perform this action." 
                                        : "Deactivating your account is permanent and cannot be undone. All your posts and data will be lost."}
                                </p>
                                <button 
                                    className="admin_btn_danger" 
                                    onClick={handleDeactivate}
                                    style={user?.is_superuser ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    Deactivate My Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageSettings;
