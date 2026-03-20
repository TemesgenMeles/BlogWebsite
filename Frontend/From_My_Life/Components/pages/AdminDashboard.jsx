import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ posts: 0, views: 0, comments: 0, subscribers: 0 });
    const [recentActivites, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [postsRes, newsletterRes] = await Promise.all([
                    fetch('http://127.0.0.1:8000/posts/'),
                    fetch('http://127.0.0.1:8000/posts/newsletter/')
                ]);
                
                let totalSubscribers = 0;
                if (newsletterRes.ok) {
                    const newsletterData = await newsletterRes.json();
                    totalSubscribers = newsletterData.length;
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
                        subscribers: totalSubscribers
                    });

                    const sortedData = [...data].sort((a, b) => b.id - a.id);
                    setRecentActivities(sortedData.slice(0, 4));
                }
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="admin_dashboard">
            <h1>Dashboard</h1>
            <p className="admin_subtitle">Overview of your blog's performance.</p>
            
            <div className="admin_stats_grid">
                <div className="admin_stat_card">
                    <h3>Total Posts</h3>
                    <p className="admin_stat_value">{loading ? "..." : stats.posts}</p>
                </div>
                <div className="admin_stat_card">
                    <h3>Total Views</h3>
                    <p className="admin_stat_value">{loading ? "..." : stats.views}</p>
                </div>
                <div className="admin_stat_card">
                    <h3>Comments</h3>
                    <p className="admin_stat_value">{loading ? "..." : stats.comments}</p>
                </div>
                <div className="admin_stat_card">
                    <h3>Subscribers</h3>
                    <p className="admin_stat_value">{loading ? "..." : stats.subscribers}</p>
                </div>
            </div>

            <div className="admin_recent_section">
                <h2>Recent Activity</h2>
                {recentActivites.length > 0 ? (
                    <div className="admin_activity_list">
                        {recentActivites.map(post => (
                            <div key={post.id} className="admin_activity_item flex_center gap_sm">
                                <span className="activity_badge">Post Created</span>
                                <div className="activity_info">
                                    <p className="activity_title">{post.title}</p>
                                    <span className="activity_time">By {post.author?.first_name || 'Admin'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="admin_activity_placeholder">
                        <p>{loading ? "Loading recent activity..." : "No recent activity to display."}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
