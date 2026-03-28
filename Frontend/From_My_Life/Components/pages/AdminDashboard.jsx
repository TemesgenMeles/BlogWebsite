import React, { useState, useEffect, useRef } from 'react';
import {
    FileText, Eye, MessageSquare, Users,
    Folder, Mail, Clock, ArrowUpRight,
    Activity, TrendingUp, ChevronRight
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

/* ─── Multi-Series Line Chart ─────────────────────────────────── */
const SERIES = [
    { key: 'posts', label: 'Posts', color: '#10b981' },
    { key: 'likes', label: 'Likes', color: '#f472b6' },
    { key: 'comments', label: 'Comments', color: '#fbbf24' },
    { key: 'messages', label: 'Messages', color: '#6366f1' },
];

const BlogActivityChart = ({ posts, messages, allComments }) => {
    const [tooltip, setTooltip] = useState(null);
    const [animated, setAnimated] = useState(false);
    const svgRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 120);
        return () => clearTimeout(t);
    }, [posts, messages]);

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

    const gridYs = [0, 0.5, 1].map(f => ({
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
                <h2><TrendingUp size={20} /> Analytics</h2>
                <div className="chart_legend">
                    {SERIES.map(s => (
                        <span key={s.key} className="legend_item">
                            <span className="dot" style={{ background: s.color }} />
                            {s.label}
                        </span>
                    ))}
                </div>
            </div>

            <div className="lc_wrapper" onMouseLeave={() => setTooltip(null)}>
                <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="lc_svg" onMouseMove={handleMouseMove}>
                    <defs>
                        {SERIES.map(s => (
                            <linearGradient key={s.key} id={`grad_${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={s.color} stopOpacity="0.1" />
                                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                            </linearGradient>
                        ))}
                    </defs>
                    {gridYs.map((g, i) => (
                        <g key={i}>
                            <line x1={PAD.left} y1={g.y} x2={W - PAD.right} y2={g.y} stroke="rgba(255,255,255,0.03)" />
                            <text x={PAD.left - 6} y={g.y + 4} textAnchor="end" fontSize="10" fill="rgba(148,163,184,0.5)">{g.val}</text>
                        </g>
                    ))}
                    {monthBuckets.map((b, i) => (
                        <text key={i} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="rgba(148,163,184,0.6)">{b.label}</text>
                    ))}
                    {animated && SERIES.map(s => (
                        <path key={s.key} d={makeArea(s.key)} fill={`url(#grad_${s.key})`} style={{ transition: 'opacity 0.3s' }} />
                    ))}
                    {animated && SERIES.map(s => (
                        <path key={s.key} d={makePath(s.key)} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    ))}
                    {tooltip && <line x1={xPos(tooltip.idx)} y1={PAD.top} x2={xPos(tooltip.idx)} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />}
                </svg>
                {tooltip && (
                    <div className="lc_tooltip" style={{ left: `${(xPos(tooltip.idx) / W) * 100}%` }}>
                        <p className="lc_tip_month">{tooltip.label}</p>
                        {tooltip.data.map(s => (
                            <p key={s.key} className="lc_tip_row">
                                <span className="lc_tip_dot" style={{ backgroundColor: s.color }} />
                                {s.label}: <strong>{s.val}</strong>
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
        <div className="chart_card">
            <div className="chart_header">
                <h2><Eye size={20} /> Traffic</h2>
            </div>
            <div className="vbar_body_container">
                {months.map((m, idx) => {
                    const pct = (m.views / maxVal) * 100;
                    return (
                        <div key={idx} className="vbar_column"
                            onMouseEnter={() => setTooltip(idx)}
                            onMouseLeave={() => setTooltip(null)}>
                            <div className="vbar_track">
                                <div className="vbar_fill" style={{ height: animated ? `${pct}%` : '0%' }} />
                                {tooltip === idx && (
                                    <div className="vbar_tooltip">
                                        {m.views}
                                    </div>
                                )}
                            </div>
                            <span className="vbar_label">{m.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

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

                if (postsRes.ok) {
                    const data = await postsRes.json();
                    const newsletter = newsletterRes.ok ? await newsletterRes.json() : [];
                    const categories = catRes.ok ? await catRes.json() : [];
                    const messages = msgRes.ok ? await msgRes.json() : [];
                    const comments = commentsRes.ok ? await commentsRes.json() : [];

                    setStats({
                        posts: data.length,
                        views: data.reduce((acc, p) => acc + (p.views || 0), 0),
                        comments: comments.length,
                        subscribers: newsletter.length,
                        categories: categories.length,
                        messages: messages.length
                    });

                    setAllPosts(data);
                    setAllMessages(messages);
                    setAllComments(comments);
                    setRecentActivities([...data].sort((a, b) => b.id - a.id).slice(0, 5));
                }
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="admin_loading">Loading Dashboard...</div>;

    const cards = [
        { title: 'Posts', value: stats.posts, icon: FileText, color: '#10b981', path: '/admin/posts' },
        { title: 'Views', value: stats.views, icon: Eye, color: '#6366f1', path: '/admin/posts' },
        { title: 'Comments', value: stats.comments, icon: MessageSquare, color: '#fbbf24', path: '/admin/comments' },
    ];

    return (
        <div className="admin_dashboard">
            <h1>Overview</h1>
            <p className="admin_subtitle">Your blog's performance at a glance.</p>

            <div className="admin_stats_grid">
                {cards.map((card, i) => (
                    <div key={i} className="admin_stat_card">
                        <div className="stat_icon_box" style={{ color: card.color }}>
                            <card.icon size={24} />
                        </div>
                        <h3>{card.title}</h3>
                        <p className="admin_stat_value">{card.value.toLocaleString()}</p>
                        <NavLink to={card.path} className="stat_link_btn">
                            <ArrowUpRight size={18} />
                        </NavLink>
                    </div>
                ))}
            </div>

            <div className="admin_dashboard_lower_grid">
                <div className="flex_col gap_24">
                    <section className="admin_recent_section">
                        <h2><Activity size={20} /> Recent Content</h2>
                        <div className="admin_activity_list">
                            {recentActivites.map(post => (
                                <div key={post.id} className="admin_activity_item">
                                    <span className="status_badge publish">POST</span>
                                    <div className="activity_info">
                                        <p className="activity_title">{post.title}</p>
                                        <span className="activity_time">{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <Link to={`/admin/posts/edit/${post.id}`} className="stat_link_btn relative_btn">
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </section>
                    <ViewsBarChart posts={allPosts} />
                </div>

                <div className="flex_col gap_24">
                    <BlogActivityChart posts={allPosts} messages={allMessages} allComments={allComments} />
                    <div className="admin_recent_section">
                        <h2><TrendingUp size={20} /> Quick Actions</h2>
                        <div className="quick_actions_grid">
                            <Link to="/admin/posts/create" className="filter_pill active action_link_pill">
                                <FileText size={20} /> Create Post
                            </Link>
                            <Link to="/admin/settings" className="filter_pill action_link_pill">
                                <Mail size={20} /> Notifications
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
