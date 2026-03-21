import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
    Calendar, BookOpen, Clock, Mail, ChevronRight, ChevronLeft,
    SearchX, TrendingUp, Facebook, Twitter, Linkedin, Github,
    Search, ArrowRight, ArrowLeft
} from 'lucide-react'

const Posts = () => {
    const [posts, setPosts] = useState([])
    const [categories, setCategories] = useState([])
    const [popularPosts, setPopularPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const [newsletterEmail, setNewsletterEmail] = useState('')
    const [newsletterStatus, setNewsletterStatus] = useState('')
    const postsPerPage = 6

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

    const fetchPosts = async (category = 'All') => {
        try {
            setLoading(true);
            const url = category === 'All' 
                ? 'http://127.0.0.1:8000/posts/' 
                : `http://127.0.0.1:8000/posts/?category=${category}`;
            
            const response = await fetch(url);
            const data = await response.json();
            setPosts(data);
            setLoading(false);
            setCurrentPage(1); // Reset pagination on category change
        } catch (error) {
            console.error('Error fetching posts:', error);
            setLoading(false);
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/posts/categories/');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    const fetchAllPostsForSidebar = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/posts/');
            const data = await res.json();
            // Sort by likes to get popular posts from all categories
            const popular = [...data].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 4);
            setPopularPosts(popular);
        } catch (error) {
            console.error('Error fetching all posts for sidebar:', error);
        }
    }

    useEffect(() => {
        fetchCategories();
        fetchAllPostsForSidebar();
        window.scrollTo(0, 0);
    }, [])

    useEffect(() => {
        fetchPosts(selectedCategory);
    }, [selectedCategory])

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (post.content1 && post.content1.toLowerCase().includes(searchQuery.toLowerCase()))
        
        // Category filtering is now handled by the server
        return matchesSearch;
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
    const indexOfLastPost = currentPage * postsPerPage
    const indexOfFirstPost = indexOfLastPost - postsPerPage
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    return (
        <div className="posts_page_wrapper">
            <header className="blog_archive_header">
                <div className="container">
                    <div className="header_content">
                        <div className="logo_box">
                            <img src="/logo.png" alt="Logo" className="blog_logo" />
                        </div>
                        <span className="eyebrow">The Collective</span>
                        <h1>From My Life <span>Blog</span></h1>
                        <p className="subtitle">Explore stories and reflections on technology, growth, and the journey of building something meaningful.</p>
                    </div>
                </div>
            </header>

            <div className="container main_content_grid">
                <main className="posts_main_area">
                    {/* Updated Category Filter Bar */}
                    <div className="filter_bar">
                        <button 
                            className={`filter_chip ${selectedCategory === 'All' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('All')}
                        >
                            All Stories
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                className={`filter_chip ${selectedCategory === cat.slug ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.slug)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="post_loading_placeholder">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="shimmer_post_card"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="blog_posts_grid">
                                {currentPosts.length > 0 ? (
                                    currentPosts.map((post, idx) => (
                                        <article key={post.id} className="premium_blog_card" style={{animationDelay: `${idx * 0.1}s`}}>
                                            <div className="card_image_wrapper">
                                                {Array.isArray(post.images) && post.images.length > 0 ? (
                                                    <img 
                                                        src={post.images.find(img => img.position === 1)?.image || post.images[0].image} 
                                                        alt={post.title} 
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <img src="/home_bg.png" alt="Default Background" loading="lazy" />
                                                )}
                                                <div className="card_badge_list">
                                                    {post.catagory?.map(cat => (
                                                        <div key={cat.slug} className={`card_badge badge_${cat.slug || 'insight'}`}>
                                                            {cat.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="card_body">
                                                <div className="card_meta">
                                                    <span><Calendar size={14} /> {new Date(post.published_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                    <span><Clock size={14} /> 5 min read</span>
                                                </div>
                                                <h3 className="card_title">
                                                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                                                </h3>
                                                <p className="card_excerpt">
                                                    {post.excerpt || post.content1.substring(0, 120) + '...'}
                                                </p>
                                                <Link to={`/posts/${post.id}`} className="read_more_link">
                                                    Read Full Story <ChevronRight size={18} />
                                                </Link>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="no_posts_state">
                                        <SearchX size={64} />
                                        <h3>No matches found</h3>
                                        <p>Try adjusting your search or category filters.</p>
                                    </div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="professional_pagination">
                                    <button 
                                        className="pagination_nav_btn"
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft size={20} />
                                        <span>Previous</span>
                                    </button>
                                    
                                    <div className="page_numbers_hub">
                                        {[...Array(totalPages)].map((_, idx) => (
                                            <button 
                                                key={idx + 1}
                                                className={`page_dot ${currentPage === idx + 1 ? 'active' : ''}`}
                                                onClick={() => paginate(idx + 1)}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button 
                                        className="pagination_nav_btn"
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <span>Next</span>
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>

                <aside className="blog_sidebar">
                    <div className="sidebar_widget search_widget">
                        <h3>Search</h3>
                        <div className="search_input_box">
                            <Search size={18} className="search_icon" />
                            <input 
                                type="text" 
                                placeholder="Keywords..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="sidebar_widget popular_widget">
                        <h3>Popular Stories <TrendingUp size={18} className="title_icon" /></h3>
                        <div className="popular_list">
                            {popularPosts.map(post => (
                                <Link to={`/posts/${post.id}`} key={post.id} className="popular_item">
                                    <div className="popular_thumb_container">
                                        {post.images && post.images.length > 0 ? (
                                            <img src={post.images[0].image} alt={post.title} />
                                        ) : (
                                            <img src="/home_bg.png" alt="Default Background" />
                                        )}
                                    </div>
                                    <div className="item_content">
                                        <h4>{post.title}</h4>
                                        <span>{new Date(post.published_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <ChevronRight size={16} className="arrow_icon" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar_widget newsletter_widget">
                        <div className="newsletter_card">
                            <div className="icon_circle"><Mail size={24} /></div>
                            <h3>Join the Circle</h3>
                            <p>Get the latest reflections and tutorials delivered to your inbox.</p>
                            <form className="sidebar_newsletter_form" onSubmit={handleNewsletterSubmit}>
                                <input 
                                    type="email" 
                                    placeholder="Your email address" 
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    required 
                                />
                                <button type="submit" disabled={newsletterStatus === 'subscribing'}>
                                    {newsletterStatus === 'subscribing' ? '...' : 'Subscribe Now'}
                                </button>
                            </form>
                            {newsletterStatus === 'success' && <p style={{ color: 'var(--primary-color)', fontSize: '0.85rem', marginTop: '10px' }}>Successfully subscribed!</p>}
                            {newsletterStatus === 'error' && <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '10px' }}>Failed to subscribe. Please try again.</p>}
                        </div>
                    </div>

                    <div className="sidebar_widget socials_widget">
                        <h3>Let's Connect</h3>
                        <div className="sidebar_social_links">
                            <a href="#" className="social_link fb"><Facebook size={20} /></a>
                            <a href="#" className="social_link tw"><Twitter size={20} /></a>
                            <a href="#" className="social_link ln"><Linkedin size={20} /></a>
                            <a href="https://github.com/TemesgenMeles" className="social_link gh"><Github size={20} /></a>
                        </div>
                    </div>
                </aside>
            </div>

            <footer className="blog_archive_footer">
                <div className="container">
                    <div className="footer_grid">
                        <div className="footer_brand">
                            <h3>From My Life</h3>
                            <p>Thoughtful stories on development, entrepreneurship, and personal growth.</p>
                        </div>
                        <nav className="footer_nav">
                            <h4>Navigations</h4>
                            <Link to="/">Home</Link>
                            <Link to="/about">About Me</Link>
                            <Link to="/contact">Contact</Link>
                        </nav>
                        <div className="footer_legal">
                            <h4>Stay Human</h4>
                            <p>&copy; {new Date().getFullYear()} Temesgen. All rights reserved.</p>
                            <div className="legal_links">
                                <a href="#">GitHub</a>
                                <a href="#">LinkedIn</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Posts