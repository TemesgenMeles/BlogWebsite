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
    return (
        <div className="home_wrapper">
            {/* Hero Section */}
            <header className="home_page">
                <div className="logo_container">
                    <img src="logo.png" alt="Logo" />
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
                    <div className="post_card">
                        <div className="post_image_container">
                            <img src="home_bg.png" alt="Post 1" />
                            <span className="category_badge badge_business">Business</span>
                        </div>
                        <h1 className="post_title">Embracing Change: My Journey of Growth</h1>
                        <div className="post_meta flex_center gap_sm">
                            <span className="author_name flex_center gap_xs"><User size={14}/> Temesgen</span>
                            <span className="admin_badge flex_center gap_xs"><ShieldCheck size={14}/> Admin</span>
                        </div>
                        <p className="post_excerpt">Business today is more than profit margins; it is about creating value, building trust, and adapting to change. Companies that thrive are those that innovate, listen to customers, and lead with resilience. This post explores three key pillars that shape modern business success.</p>
                        <Link className="read-more flex_center gap_sm" to="/posts/embracing-change">Read More <ArrowRight size={16} /></Link>
                    </div>
                    <div className="post_card">
                        <div className="post_image_container">
                            <img src="home_bg.png" alt="Post 2" />
                            <span className="category_badge badge_education">Education</span>
                        </div>
                        <h1 className="post_title">Learning React Advanced Concepts</h1>
                        <div className="post_meta flex_center gap_sm">
                            <span className="author_name flex_center gap_xs"><User size={14}/> Temesgen</span>
                            <span className="admin_badge flex_center gap_xs"><ShieldCheck size={14}/> Admin</span>
                        </div>
                        <p className="post_excerpt">React has evolved significantly over the years. Understanding the advanced concepts like React Server Components and fine-grained reactivity is crucial for modern web development. In this article, I cover the patterns I wish I knew earlier.</p>
                        <Link className="read-more flex_center gap_sm" to="/posts/react-advanced">Read More <ArrowRight size={16} /></Link>
                    </div>
                    <div className="post_card">
                        <div className="post_image_container">
                            <img src="home_bg.png" alt="Post 3" />
                            <span className="category_badge badge_insight">Insight</span>
                        </div>
                        <h1 className="post_title">The Art of Mindful Productivity</h1>
                        <div className="post_meta flex_center gap_sm">
                            <span className="author_name flex_center gap_xs"><User size={14}/> Temesgen</span>
                            <span className="admin_badge flex_center gap_xs"><ShieldCheck size={14}/> Admin</span>
                        </div>
                        <p className="post_excerpt">In a world full of distractions, maintaining focus is harder than ever. I share my personal strategies for setting boundaries, prioritizing deep work, and staying productive without moving into burnout territory.</p>
                        <Link className="read-more flex_center gap_sm" to="/posts/mindful-productivity">Read More <ArrowRight size={16} /></Link>
                    </div>
                </div>
                <div className="view_all_container">
                    <Link to="/blog" className="btn_primary flex_center gap_sm inline_flex">View All Posts <ArrowRight size={20} /></Link>
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
                        <MonitorPlay size={40} className="category_icon mb-3" style={{color: 'var(--cat-showcase)'}} />
                        <h3 style={{color: 'var(--cat-showcase)'}}>Showcase</h3>
                        <p>A deeper dive into my best projects, highlighting key features, tech stacks, and the challenges overcome during development.</p>
                    </Link>
                    <Link to="/category/education" className="category_card shadow_education">
                        <BookOpen size={40} className="category_icon mb-3" style={{color: 'var(--cat-education)'}} />
                        <h3 style={{color: 'var(--cat-education)'}}>Education</h3>
                        <p>Tutorials, continuous learning resources, and guides designed to help you level up your programming and web design skills.</p>
                    </Link>
                    <Link to="/category/business" className="category_card shadow_business">
                        <BookOpen size={40} className="category_icon mb-3" style={{color: 'var(--cat-business)'}} />
                        <h3 style={{color: 'var(--cat-business)'}}>Business</h3>
                        <p>Insights on entrepreneurship, navigating the market, and exploring modern business strategies for independent creators.</p>
                    </Link>
                    <Link to="/category/insight" className="category_card shadow_insight">
                        <Search size={40} className="category_icon mb-3" style={{color: 'var(--cat-insight)'}} />
                        <h3 style={{color: 'var(--cat-insight)'}}>Insight</h3>
                        <p>Deep dives into thought-provoking topics, analyzing trends in technology, and sharing meaningful takeaways and opinions.</p>
                    </Link>
                    <Link to="/category/lifestyle" className="category_card shadow_lifestyle">
                        <Coffee size={40} className="category_icon mb-3" style={{color: 'var(--cat-lifestyle)'}} />
                        <h3 style={{color: 'var(--cat-lifestyle)'}}>Lifestyle</h3>
                        <p>Reflections on building better habits, fostering productivity, avoiding burnout, and balancing a tech life with personal well-being.</p>
                    </Link>
                </div>
            </section>

            {/* Call to Action (CTA) */}
            <section className="cta_section">
                <div className="cta_content">
                    <h2>Stay in the Loop</h2>
                    <p>Subscribe to my newsletter to get the latest posts, exclusive resources, and updates delivered straight to your inbox. No spam, just good content.</p>
                    <form className="newsletter_form" onSubmit={(e) => e.preventDefault()}>
                        <div className="input_group">
                            <Mail size={20} className="input_icon" />
                            <input type="email" placeholder="Enter your email address" required />
                        </div>
                        <button type="submit" className="btn_primary flex_center gap_sm">Subscribe <ChevronRight size={20} /></button>
                    </form>
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
                            <Link to="/blog" className="flex_center gap_xs"><ChevronRight size={16} /> Blog</Link>
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
                    <p>&copy; {new Date().getFullYear()} Temesgen. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;