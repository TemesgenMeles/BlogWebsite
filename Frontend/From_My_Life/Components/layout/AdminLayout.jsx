import { Outlet, NavLink } from 'react-router-dom';
import '../../src/Admin.css';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Sun, Moon, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

const AdminLayout = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState([]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/posts/contact-message/');
                const data = await response.json();
                const newMsgs = data.filter(msg => msg.new === true);
                setUnreadMessages(newMsgs);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();
    }, []);

    const handleMarkAsRead = async () => {
        if (unreadMessages.length === 0) return;
        try {
            const messagesToUpdate = [...unreadMessages];
            setUnreadMessages([]);
            await Promise.all(messagesToUpdate.map(msg => 
                fetch(`http://127.0.0.1:8000/posts/contact-message/${msg.id}/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ new: false })
                })
            ));
        } catch (error) {
            console.error("Error updating messages:", error);
        }
    };

    return (
        <div className={`admin_container ${isDarkMode ? 'dark_mode' : ''}`}>
            <aside className="admin_sidebar">
                <div className="admin_logo">
                    <img src="/logo_green.png" alt="Admin Logo" />
                    <h2>Admin Panel</h2>
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
                        {/* Placeholders for future pages */}
                        <li>
                            <a href="#users" className="admin_disabled">
                                <Users size={20} /> Users
                            </a>
                        </li>
                        <li>
                            <a href="#settings" className="admin_disabled">
                                <Settings size={20} /> Settings
                            </a>
                        </li>
                    </ul>
                </nav>
                <div className="admin_footer_nav">
                    <NavLink to="/">
                        <LogOut size={20} /> Back to Site
                    </NavLink>
                </div>
            </aside>
            <main className="admin_main_content">
                <header className="admin_topbar">
                    <button className="theme_toggle_btn" onClick={toggleTheme} aria-label="Toggle Dark Mode">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div style={{ flex: 1 }}></div>
                    <div 
                        className="admin_notifications" 
                        onClick={handleMarkAsRead} 
                        style={{ position: 'relative', cursor: 'pointer', marginRight: '20px', display: 'flex', alignItems: 'center' }}
                        title="Mark messages as read"
                    >
                        <Bell size={20} />
                        {unreadMessages.length > 0 && (
                            <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                                {unreadMessages.length}
                            </span>
                        )}
                    </div>
                    <div className="admin_topbar_user">
                        <span>Welcome, Admin</span>
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
