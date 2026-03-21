import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    MonitorPlay,
    Coffee,
    BookOpen,
    Mail,
    Twitter,
    Linkedin,
    Github,
    ChevronRight,
    Search,
    User,
    ShieldCheck
} from 'lucide-react';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterStatus, setNewsletterStatus] = useState('');

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        setNewsletterStatus('subscribing');
        try {
            const response = await fetch('http://127.0.0.1:8000/posts/newsletter/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newsletterEmail }),
            });
            if (response.ok) {
                setNewsletterStatus('success');
                setNewsletterEmail('');
            } else {
                setNewsletterStatus('error');
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            setNewsletterStatus('error');
        }
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/posts/');
                const data = await response.json();
                // Filter for latest posts or just take first 3
                setPosts(data.filter(p => p.latest).slice(0, 3));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching latest posts:', error);
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="home_wrapper">
            {/* Hero Section */}
            <header className="home_page">
                <div className="logo_container">
                    <img src="/logo.png" alt="Logo" />
                    <h1>From My Life</h1>
                    <p className="part_logo">Stories, lessons, and reflections worth sharing.</p>
                    <p className="intro">I’m Temesgen, sharing my thoughts, experiences, and lessons learned along the way.</p>
                </div>
                <button className="flex_center gap_sm">Get Started <ArrowRight size={20} /></button>
            </header>

            {/* Latest Posts Preview */}
            <section className="leatest_post">
                <h1 className="title">Latest Posts</h1>
                <p className="phrase">Catch up on my newest reflections and experiences.</p>
                <div className="posts_container">
                    {loading ? (
                        <p>Loading stories...</p>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="post_card">
                                <div className="post_image_container">
                                    {post.images && post.images.length > 0 ? (
                                        <img src={post.images[0].image} alt={post.title} />
                                    ) : (
                                        <img src="home_bg.png" alt={post.title} />
                                    )}
                                    <div className="card_badge_list">
                                        {post.catagory?.map(cat => (
                                            <span key={cat.slug} className={`category_badge badge_${cat.slug || 'insight'}`}>
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <h1 className="post_title">{post.title}</h1>
                                <div className="post_meta flex_center gap_sm">
                                    <span className="author_name flex_center gap_xs"><User size={14} /> {post.author?.first_name} {post.author?.last_name}</span>
                                    <span className="admin_badge flex_center gap_xs"><ShieldCheck size={14} /> {post.author?.is_staff ? 'Admin' : 'Author'}</span>
                                </div>
                                <p className="post_excerpt">{post.excerpt || post.content1.substring(0, 150) + '...'}</p>
                                <Link className="read-more flex_center gap_sm" to={`/posts/${post.id}`}>Read More <ArrowRight size={16} /></Link>
                            </div>
                        ))
                    )}
                </div>
                <div className="view_all_container">
                    <Link to="/posts" className="btn_primary flex_center gap_sm inline_flex">View All Posts <ArrowRight size={20} /></Link>
                </div>
            </section>

            {/* About Snapshot */}
            <section className="about_snapshot">
                <div className="about_content">
                    <h2 className="section_title">A Little About Me</h2>
                    <p className="section_text">Hi, I'm Temesgen! I started this blog to document my journey through technology, entrepreneurship, and personal growth. I believe in the power of shared experiences to help us all learn and grow together. Welcome to my little corner of the internet.</p>
                    <Link to="/about" className="btn_secondary flex_center gap_sm inline_flex"><Search size={20} /> Read Full Story</Link>
                </div>
            </section>

            {/* Categories or Topics */}
            <section className="categories_section">
                <h2 className="section_title">Explore Topics</h2>
                <div className="categories_grid">
                    <Link to="/category/showcase" className="category_card shadow_showcase">
                        <MonitorPlay size={40} className="category_icon mb-3" style={{ color: 'var(--cat-showcase)' }} />
                        <h3 style={{ color: 'var(--cat-showcase)' }}>Showcase</h3>
                        <p>A deeper dive into my best projects, highlighting key features, tech stacks, and the challenges overcome during development.</p>
                    </Link>
                    <Link to="/category/education" className="category_card shadow_education">
                        <BookOpen size={40} className="category_icon mb-3" style={{ color: 'var(--cat-education)' }} />
                        <h3 style={{ color: 'var(--cat-education)' }}>Education</h3>
                        <p>Tutorials, continuous learning resources, and guides designed to help you level up your programming and web design skills.</p>
                    </Link>
                    <Link to="/category/business" className="category_card shadow_business">
                        <BookOpen size={40} className="category_icon mb-3" style={{ color: 'var(--cat-business)' }} />
                        <h3 style={{ color: 'var(--cat-business)' }}>Business</h3>
                        <p>Insights on entrepreneurship, navigating the market, and exploring modern business strategies for independent creators.</p>
                    </Link>
                    <Link to="/category/insight" className="category_card shadow_insight">
                        <Search size={40} className="category_icon mb-3" style={{ color: 'var(--cat-insight)' }} />
                        <h3 style={{ color: 'var(--cat-insight)' }}>Insight</h3>
                        <p>Deep dives into thought-provoking topics, analyzing trends in technology, and sharing meaningful takeaways and opinions.</p>
                    </Link>
                    <Link to="/category/lifestyle" className="category_card shadow_lifestyle">
                        <Coffee size={40} className="category_icon mb-3" style={{ color: 'var(--cat-lifestyle)' }} />
                        <h3 style={{ color: 'var(--cat-lifestyle)' }}>Lifestyle</h3>
                        <p>Reflections on building better habits, fostering productivity, avoiding burnout, and balancing a tech life with personal well-being.</p>
                    </Link>
                </div>
            </section>

            {/* Call to Action (CTA) */}
            <section className="cta_section">
                <div className="cta_content">
                    <h2>Stay in the Loop</h2>
                    <p>Subscribe to my newsletter to get the latest posts, exclusive resources, and updates delivered straight to your inbox. No spam, just good content.</p>
                    <form className="newsletter_form" onSubmit={handleNewsletterSubmit}>
                        <div className="input_group">
                            <Mail size={20} className="input_icon" />
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={newsletterStatus === 'subscribing'} className="btn_primary flex_center gap_sm">
                            {newsletterStatus === 'subscribing' ? 'Subscribing...' : 'Subscribe'} <ChevronRight size={20} />
                        </button>
                    </form>
                    {newsletterStatus === 'success' && <p style={{ color: 'var(--primary-color)', marginTop: '10px' }}>Successfully subscribed!</p>}
                    {newsletterStatus === 'error' && <p style={{ color: 'red', marginTop: '10px' }}>Failed to subscribe. Please try again.</p>}
                </div>
            </section>

            {/* Footer */}
            <footer className="footer_section">
                <div className="footer_content">
                    <div className="footer_info">
                        <h3>From My Life</h3>
                        <p>Stories, lessons, and reflections worth sharing.</p>
                        <div className="footer_socials">
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex_center gap_xs inline_flex"><Twitter size={20} /> Twitter</a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex_center gap_xs inline_flex"><Linkedin size={20} /> LinkedIn</a>
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex_center gap_xs inline_flex"><Github size={20} /> GitHub</a>
                        </div>
                    </div>
                    <div className="footer_links_group">
                        <h4>Navigation</h4>
                        <div className="footer_links">
                            <Link to="/" className="flex_center gap_xs"><ChevronRight size={16} /> Home</Link>
                            <Link to="/posts" className="flex_center gap_xs"><ChevronRight size={16} /> Blog</Link>
                            <Link to="/about" className="flex_center gap_xs"><ChevronRight size={16} /> About</Link>
                            <Link to="/contact" className="flex_center gap_xs"><ChevronRight size={16} /> Contact</Link>
                        </div>
                    </div>
                    <div className="footer_links_group">
                        <h4>Topics</h4>
                        <div className="footer_links">
                            <Link to="/category/showcase" className="flex_center gap_xs"><MonitorPlay size={16} /> Showcase</Link>
                            <Link to="/category/education" className="flex_center gap_xs"><BookOpen size={16} /> Education</Link>
                            <Link to="/category/business" className="flex_center gap_xs"><BookOpen size={16} /> Business</Link>
                            <Link to="/category/insight" className="flex_center gap_xs"><Search size={16} /> Insight</Link>
                            <Link to="/category/lifestyle" className="flex_center gap_xs"><Coffee size={16} /> Lifestyle</Link>
                        </div>
                    </div>
                </div>
                <div className="footer_bottom">
                    <p>&copy; {new Date().getFullYear()} Temesgen &ndash; All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;