import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../../src/Admin.css';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Sun, Moon, Bell, ChevronRight, Folder, MessageSquare, Mail, Eye, Shield } from 'lucide-react';
import { useState, useEffect, useRef, useContext } from 'react';
import AuthContext from '../../src/context/AuthContext';

const AdminLayout = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const [msgRes, commentRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/posts/contact-message/'),
                fetch('http://127.0.0.1:8000/posts/comments/')
            ]);

            const msgs = msgRes.ok ? await msgRes.json() : [];
            const comments = commentRes.ok ? await commentRes.json() : [];

            const newNotifs = [
                ...msgs.filter(m => m.new).map(m => ({
                    id: m.id,
                    type: 'message',
                    sender: m.name,
                    content: m.subject,
                    date: m.message_date,
                    path: `/admin/messages?view=${m.id}`
                })),
                ...comments.filter(c => c.new).map(c => ({
                    id: c.id,
                    type: 'comment',
                    sender: c.name,
                    content: c.comment,
                    date: c.commented_date,
                    path: `/admin/comments?view=${c.id}`
                }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            setNotifications(newNotifs);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);

        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const markAsRead = async (id, type) => {
        const endpoint = type === 'message' ? `contact-message/${id}` : `comments/${id}`;
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/${endpoint}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new: false })
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => !(n.id === id && n.type === type)));
            }
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleNotificationClick = (notif) => {
        markAsRead(notif.id, notif.type);
        setShowNotifications(false);
        navigate(notif.path);
    };

    return (
        <div className="admin_container">
            <aside className="admin_sidebar">
                <div className="admin_logo">
                    <img src="/logo_green.png" alt="Admin Logo" style={{ height: '60px', width: 'auto' }} />
                </div>
                <nav className="admin_nav">
                    <ul className="admin_nav_list">
                        <li>
                            <NavLink to="/admin" end className={({ isActive }) => isActive ? 'admin_active' : ''}>
                                <LayoutDashboard size={20} /> Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/posts" className={({ isActive }) => isActive ? 'admin_active' : ''}>
                                <FileText size={20} /> Manage Posts
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'admin_active' : ''}>
                                <Folder size={20} /> Categories
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/comments" className={({ isActive }) => isActive ? 'admin_active' : ''}>
                                <MessageSquare size={20} /> Comments
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/messages" className={({ isActive }) => isActive ? 'admin_active' : ''}>
                                <Mail size={20} /> Messages
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/subscribers" className={({ isActive }) => isActive ? 'admin_active' : ''}>
                                <Users size={20} /> Subscribers
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/users" className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}>
                                <Shield size={20} /> User Directory
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'admin_active' : ''}>
                                <Settings size={20} /> Settings
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <div className="admin_footer_nav">
                    <button onClick={logoutUser} className="admin_logout_btn">
                        <LogOut size={20} /> Logout
                    </button>
                    <NavLink to="/">
                        <Eye size={20} /> View Site
                    </NavLink>
                </div>
            </aside>
            <main className="admin_main_content">
                <header className="admin_topbar">
                    <NavLink to="/admin" className="topbar_logo_link">
                        <img src="/logo_green.png" alt="Dashboard Home" style={{ height: '45px', width: 'auto' }} />
                    </NavLink>
                    <div style={{ flex: 1 }}></div>
                    <div
                        className="admin_notifications"
                        ref={notificationRef}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="notification_badge">
                                {notifications.length}
                            </span>
                        )}

                        {showNotifications && (
                            <div className="notification_dropdown" onClick={(e) => e.stopPropagation()}>
                                <div className="notification_header">
                                    <h4>Notifications</h4>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{notifications.length} New</span>
                                </div>
                                <div className="notification_list">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif, idx) => (
                                            <div 
                                                key={`${notif.type}-${notif.id}`} 
                                                className="notification_item"
                                                onClick={() => handleNotificationClick(notif)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span className="notif_sender">{notif.sender}</span>
                                                <p className="notif_content">{notif.content}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                    <span className="notif_type_label">{notif.type === 'message' ? 'Message' : 'Comment'}</span>
                                                    <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>• {new Date(notif.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="notif_action_btn">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="notif_empty">
                                            <p>All caught up!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="admin_topbar_user">
                        <span>Welcome, {user?.username || 'Admin'}</span>
                    </div>
                </header>
                <div className="admin_content_area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
