import React, { useState, useEffect } from 'react';
import { 
    FileText, Eye, MessageSquare, Users, 
    Folder, Mail, Clock, ArrowUpRight, 
    Activity, TrendingUp, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ posts: 0, views: 0, comments: 0, subscribers: 0, categories: 0, messages: 0 });
    const [recentActivites, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [postsRes, newsletterRes, catRes, msgRes] = await Promise.all([
                    fetch('http://127.0.0.1:8000/posts/'),
                    fetch('http://127.0.0.1:8000/posts/newsletter/'),
                    fetch('http://127.0.0.1:8000/posts/categories/'),
                    fetch('http://127.0.0.1:8000/posts/contact-message/')
                ]);
                
                let totalSubscribers = 0;
                if (newsletterRes.ok) {
                    const newsletterData = await newsletterRes.json();
                    totalSubscribers = newsletterData.length;
                }

                let totalCategories = 0;
                if (catRes.ok) {
                    const catData = await catRes.json();
                    totalCategories = catData.length;
                }

                let totalMessages = 0;
                if (msgRes.ok) {
                    const msgData = await msgRes.json();
                    totalMessages = msgData.length;
                }

                if (postsRes.ok) {
                    const data = await postsRes.json();
                    
                    const totalPosts = data.length;
                    const totalViews = data.reduce((acc, current) => acc + (current.views || 0), 0);
                    const totalComments = data.reduce((acc, current) => acc + (current.comments ? current.comments.length : 0), 0);
                    
                    setStats({
                        posts: totalPosts,
                        views: totalViews,
                        comments: totalComments,
                        subscribers: totalSubscribers,
                        categories: totalCategories,
                        messages: totalMessages
                    });

                    const sortedData = [...data].sort((a, b) => b.id - a.id);
                    setRecentActivities(sortedData.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { title: 'Total Posts', value: stats.posts, icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
        { title: 'Total Views', value: stats.views, icon: Eye, color: '#10b981', bg: '#ecfdf5' },
        { title: 'Comments', value: stats.comments, icon: MessageSquare, color: '#f59e0b', bg: '#fffbeb' },
        { title: 'Subscribers', value: stats.subscribers, icon: Users, color: '#8b5cf6', bg: '#f5f3ff' },
        { title: 'Categories', value: stats.categories, icon: Folder, color: '#ec4899', bg: '#fdf2f8' },
        { title: 'Messages', value: stats.messages, icon: Mail, color: '#f43f5e', bg: '#fff1f2' },
    ];

    return (
        <div className="admin_dashboard animation_fade_in">
            <h1>Dashboard</h1>
            <p className="admin_subtitle">Welcome back! Here's what's happening with your blog.</p>
            
            <div className="admin_stats_grid">
                {statCards.map((card, index) => (
                    <div key={index} className="admin_stat_card">
                        <div className="stat_header">
                            <div className="stat_icon_box" style={{ backgroundColor: card.bg, color: card.color }}>
                                <card.icon size={24} />
                            </div>
                            <span className="trend_tag" style={{ color: '#10b981', background: '#ecfdf5', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                +12% <ArrowUpRight size={12} />
                            </span>
                        </div>
                        <div>
                            <h3>{card.title}</h3>
                            <p className="admin_stat_value">{loading ? "..." : card.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin_content_grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                <div className="admin_recent_section">
                    <h2><Activity size={24} /> Recent Content Updates</h2>
                    {recentActivites.length > 0 ? (
                        <div className="admin_activity_list">
                            {recentActivites.map(post => (
                                <div key={post.id} className="admin_activity_item">
                                    <div className="activity_badge_icon" style={{ background: '#ecfdf5', color: '#10b981', padding: '10px', borderRadius: '10px' }}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="activity_info" style={{ flex: 1 }}>
                                        <p className="activity_title">{post.title}</p>
                                        <span className="activity_time">
                                            {new Date(post.published_date).toLocaleDateString()} • {post.author_name || 'Admin'}
                                        </span>
                                    </div>
                                    <Link to={`/admin/posts/edit/${post.id}`} className="action_btn" style={{ textDecoration: 'none' }}>
                                        <ChevronRight size={20} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="admin_activity_placeholder">
                            <p>{loading ? "Synchronizing data..." : "No recent activity to show."}</p>
                        </div>
                    )}
                </div>

                <div className="admin_quick_actions">
                    <div className="admin_recent_section">
                        <h2><TrendingUp size={24} /> Quick Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                            <Link to="/admin/posts/create" className="admin_btn_primary" style={{ width: '100%', justifyContent: 'center' }}>
                                Create New Post
                            </Link>
                            <Link to="/admin/categories" className="admin_btn_secondary" style={{ width: '100%', justifyContent: 'center' }}>
                                Manage Categories
                            </Link>
                            <a href="/" target="_blank" className="admin_btn_secondary" style={{ width: '100%', justifyContent: 'center' }}>
                                View Website
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
