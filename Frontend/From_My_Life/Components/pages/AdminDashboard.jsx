import React, { useState, useEffect, useRef } from 'react';
import {
    FileText, Eye, MessageSquare, Users,
    Folder, Mail, Clock, ArrowUpRight,
    Activity, TrendingUp, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Multi-Series Line Chart ─────────────────────────────────── */
const SERIES = [
    { key: 'posts', label: 'Posts', color: '#34d399' },
    { key: 'likes', label: 'Likes', color: '#f472b6' },
    { key: 'comments', label: 'Comments', color: '#fbbf24' },
    { key: 'messages', label: 'Messages', color: '#a78bfa' },
];

const BlogActivityChart = ({ posts, messages, allComments }) => {
    const [tooltip, setTooltip] = useState(null); // { x, y, monthLabel, data }
    const [animated, setAnimated] = useState(false);
    const svgRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 120);
        return () => clearTimeout(t);
    }, [posts, messages]);

    // Build 8-month buckets (7 past + current)
    const now = new Date();
    const monthBuckets = [];
    for (let i = 7; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthBuckets.push({
            label: d.toLocaleString('default', { month: 'short' }),
            year: d.getFullYear(),
            month: d.getMonth(),
            posts: 0, views: 0, likes: 0, comments: 0, messages: 0,
        });
    }

    posts.forEach(p => {
        const d = new Date(p.published_date);
        const b = monthBuckets.find(b => b.year === d.getFullYear() && b.month === d.getMonth());
        if (!b) return;
        b.posts += 1;
        b.views += p.views || 0;
        b.likes += p.likes || 0;
    });

    allComments.forEach(c => {
        const d = new Date(c.commented_date);
        const b = monthBuckets.find(b => b.year === d.getFullYear() && b.month === d.getMonth());
        if (b) b.comments += 1;
    });

    messages.forEach(m => {
        const d = new Date(m.message_date);
        const b = monthBuckets.find(b => b.year === d.getFullYear() && b.month === d.getMonth());
        if (b) b.messages += 1;
    });

    // SVG dimensions
    const W = 900, H = 220;
    const PAD = { top: 20, right: 20, bottom: 30, left: 44 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const n = monthBuckets.length;

    const allVals = SERIES.flatMap(s => monthBuckets.map(b => b[s.key]));
    const maxVal = Math.max(...allVals, 1);

    const xPos = idx => PAD.left + (idx / (n - 1)) * innerW;
    const yPos = val => PAD.top + innerH - (val / maxVal) * innerH;

    const makePath = key =>
        monthBuckets.map((b, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(b[key]).toFixed(1)}`).join(' ');

    const makeArea = key => {
        const pts = monthBuckets.map((b, i) => `${xPos(i).toFixed(1)},${yPos(b[key]).toFixed(1)}`).join(' L');
        const base = yPos(0).toFixed(1);
        return `M${xPos(0).toFixed(1)},${base} L${pts} L${xPos(n - 1).toFixed(1)},${base} Z`;
    };

    const gridYs = [0, 0.25, 0.5, 0.75, 1].map(f => ({
        val: Math.round(maxVal * f),
        y: yPos(maxVal * f),
    }));

    const handleMouseMove = e => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width) - PAD.left;
        const idx = Math.min(n - 1, Math.max(0, Math.round((mx / innerW) * (n - 1))));
        const b = monthBuckets[idx];
        if (b) setTooltip({ idx, label: b.label, data: SERIES.map(s => ({ ...s, val: b[s.key] })) });
    };

    return (
        <div className="chart_card">
            <div className="chart_header">
                <h2><TrendingUp size={22} /> Blog Activity</h2>
                <div className="chart_legend">
                    {SERIES.map(s => (
                        <span key={s.key} className="legend_item">
                            <span className="legend_dot" style={{ background: s.color }} />
                            {s.label}
                        </span>
                    ))}
                </div>
            </div>

            <div className="lc_wrapper" onMouseLeave={() => setTooltip(null)}>
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${W} ${H}`}
                    className="lc_svg"
                    onMouseMove={handleMouseMove}
                >
                    <defs>
                        {SERIES.map(s => (
                            <linearGradient key={s.key} id={`grad_${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={s.color} stopOpacity="0.18" />
                                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                            </linearGradient>
                        ))}
                    </defs>

                    {/* Grid lines + Y labels */}
                    {gridYs.map((g, i) => (
                        <g key={i}>
                            <line x1={PAD.left} y1={g.y} x2={W - PAD.right} y2={g.y}
                                stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            <text x={PAD.left - 6} y={g.y + 4}
                                textAnchor="end" fontSize="10" fill="rgba(148,163,184,0.8)">{g.val}</text>
                        </g>
                    ))}

                    {/* X labels */}
                    {monthBuckets.map((b, i) => (
                        <text key={i} x={xPos(i)} y={H - 6}
                            textAnchor="middle" fontSize="11" fill="rgba(148,163,184,0.9)" fontWeight="600">
                            {b.label}
                        </text>
                    ))}

                    {/* Area fills */}
                    {animated && SERIES.map(s => (
                        <path key={s.key} d={makeArea(s.key)}
                            fill={`url(#grad_${s.key})`} className="lc_area" />
                    ))}

                    {/* Lines */}
                    {animated && SERIES.map(s => (
                        <path key={s.key} d={makePath(s.key)}
                            fill="none" stroke={s.color} strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round"
                            className="lc_line" />
                    ))}

                    {/* Hover crosshair */}
                    {tooltip && (
                        <line
                            x1={xPos(tooltip.idx)} y1={PAD.top}
                            x2={xPos(tooltip.idx)} y2={PAD.top + innerH}
                            stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3"
                        />
                    )}

                    {/* Dots */}
                    {animated && SERIES.map(s =>
                        monthBuckets.map((b, i) => (
                            <circle key={`${s.key}-${i}`}
                                cx={xPos(i)} cy={yPos(b[s.key])} r={tooltip?.idx === i ? 5 : 3}
                                fill={s.color} stroke="#0f172a" strokeWidth="1.5"
                                style={{ transition: 'r 0.15s' }}
                            />
                        ))
                    )}
                </svg>

                {/* Tooltip */}
                {tooltip && (
                    <div className="lc_tooltip"
                        style={{ left: `${(xPos(tooltip.idx) / W) * 100}%` }}>
                        <p className="lc_tip_month">{tooltip.label}</p>
                        {tooltip.data.map(s => (
                            <p key={s.key} className="lc_tip_row">
                                <span className="lc_tip_dot" style={{ background: s.color }} />
                                {s.label}: <strong>{s.val.toLocaleString()}</strong>
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Views Bar Chart ──────────────────────────────────────────── */
const ViewsBarChart = ({ posts }) => {
    const [tooltip, setTooltip] = useState(null);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 150);
        return () => clearTimeout(t);
    }, [posts]);

    const now = new Date();
    const months = [];
    for (let i = 7; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            label: d.toLocaleString('default', { month: 'short' }),
            year: d.getFullYear(),
            month: d.getMonth(),
            views: 0,
        });
    }
    posts.forEach(p => {
        const d = new Date(p.published_date);
        const b = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
        if (b) b.views += p.views || 0;
    });

    const maxVal = Math.max(...months.map(m => m.views), 1);

    return (
        <div className="chart_card" style={{ marginBottom: 0 }}>
            <div className="chart_header">
                <h2><Eye size={20} /> Views per Month</h2>
            </div>
            <div className="vbar_body">
                {months.map((m, idx) => {
                    const pct = (m.views / maxVal) * 100;
                    return (
                        <div key={idx} className="vbar_col"
                            onMouseEnter={() => setTooltip(idx)}
                            onMouseLeave={() => setTooltip(null)}>
                            <div className="vbar_track">
                                {tooltip === idx && (
                                    <div className="vbar_tooltip">
                                        <strong>{m.views.toLocaleString()}</strong> views
                                    </div>
                                )}
                                <div
                                    className="vbar_fill"
                                    style={{ height: animated ? `${pct}%` : '0%' }}
                                />
                            </div>
                            <span className="vbar_label">{m.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
/* ──────────────────────────────────────────────────────────────── */

const AdminDashboard = () => {
    const [stats, setStats] = useState({ posts: 0, views: 0, comments: 0, subscribers: 0, categories: 0, messages: 0 });
    const [recentActivites, setRecentActivities] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [allMessages, setAllMessages] = useState([]);
    const [allComments, setAllComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [postsRes, newsletterRes, catRes, msgRes, commentsRes] = await Promise.all([
                    fetch('http://127.0.0.1:8000/posts/'),
                    fetch('http://127.0.0.1:8000/posts/newsletter/'),
                    fetch('http://127.0.0.1:8000/posts/categories/'),
                    fetch('http://127.0.0.1:8000/posts/contact-message/'),
                    fetch('http://127.0.0.1:8000/posts/comments/')
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
                let messagesArr = [];
                if (msgRes.ok) {
                    messagesArr = await msgRes.json();
                    totalMessages = messagesArr.length;
                }
                setAllMessages(messagesArr);

                let commentsArr = [];
                if (commentsRes.ok) {
                    commentsArr = await commentsRes.json();
                }
                setAllComments(commentsArr);

                if (postsRes.ok) {
                    const data = await postsRes.json();

                    const totalPosts = data.length;
                    const totalViews = data.reduce((acc, current) => acc + (current.views || 0), 0);

                    setStats({
                        posts: totalPosts,
                        views: totalViews,
                        comments: commentsArr.length,
                        subscribers: totalSubscribers,
                        categories: totalCategories,
                        messages: totalMessages
                    });

                    setAllPosts(data);
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
        { title: 'Total Posts', value: stats.posts, icon: FileText, color: '#3b82f6', bg: 'transparent', path: '/admin/posts' },
        { title: 'Total Views', value: stats.views, icon: Eye, color: '#10b981', bg: 'transparent', path: '/admin/posts' },
        { title: 'Comments', value: stats.comments, icon: MessageSquare, color: '#f59e0b', bg: 'transparent', path: '/admin/comments' },
        { title: 'Subscribers', value: stats.subscribers, icon: Users, color: '#8b5cf6', bg: 'transparent', path: '/admin/subscribers' },
        { title: 'Categories', value: stats.categories, icon: Folder, color: '#ec4899', bg: 'transparent', path: '/admin/categories' },
        { title: 'Messages', value: stats.messages, icon: Mail, color: '#f43f5e', bg: 'transparent', path: '/admin/messages' },
    ];

    return (
        <div className="admin_dashboard animation_fade_in">
            <h1>Dashboard</h1>
            <p className="admin_subtitle">Welcome back! Here's what's happening with your blog.</p>

            <div className="admin_stats_grid">
                {statCards.map((card, index) => (
                    <div key={index} className="admin_stat_card">
                        <div className="stat_header" style={{ justifyContent: 'center', width: '100%', position: 'relative' }}>
                            <div className="stat_icon_box" style={{ backgroundColor: card.bg, color: card.color }}>
                                <card.icon size={28} />
                            </div>
                            <span className="trend_tag" style={{
                                color: '#10b981',
                                background: 'rgba(16, 185, 129, 0.1)',
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '600',
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px'
                            }}>
                                +12% <ArrowUpRight size={10} />
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3 style={{ marginBottom: '8px' }}>{card.title}</h3>
                            <p className="admin_stat_value" style={{ fontSize: '2.5rem' }}>{loading ? "..." : card.value.toLocaleString()}</p>
                        </div>
                        <Link to={card.path} className="stat_link_btn">
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                ))}
            </div>

            {/* ── Charts Row ── */}
            <div className="charts_row">
                <BlogActivityChart posts={allPosts} messages={allMessages} allComments={allComments} />
                <ViewsBarChart posts={allPosts} />
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
                    <div className="admin_recent_section" style={{ height: '100%' }}>
                        <h2><TrendingUp size={24} /> Quick Actions</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                            <Link to="/admin/posts/create" className="admin_btn_primary" style={{
                                height: '100px',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: '8px',
                                borderRadius: '16px'
                            }}>
                                <FileText size={20} />
                                <span style={{ fontSize: '0.8rem' }}>New Post</span>
                            </Link>
                            <Link to="/admin/categories" className="admin_btn_secondary" style={{
                                height: '100px',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: '8px',
                                borderRadius: '16px'
                            }}>
                                <Folder size={20} />
                                <span style={{ fontSize: '0.8rem' }}>Categories</span>
                            </Link>
                            <a href="/" target="_blank" className="admin_btn_secondary" style={{
                                height: '100px',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: '8px',
                                borderRadius: '16px'
                            }}>
                                <Eye size={20} />
                                <span style={{ fontSize: '0.8rem' }}>View Site</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
