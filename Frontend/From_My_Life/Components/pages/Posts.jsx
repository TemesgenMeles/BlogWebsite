import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
    Calendar, User, ArrowRight, Search, Filter, 
    BookOpen, Clock, Tag, Facebook, Twitter, 
    Linkedin, Github, TrendingUp, Mail, ChevronRight,
    SearchX
} from 'lucide-react'

const Posts = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const postsPerPage = 6

    // Mock Popular Posts (could be fetched from API later)
    const popularPosts = [
        { id: 1, title: "Building an Unstoppable Growth Mindset", date: "Jan 12, 2024" },
        { id: 2, title: "10 React Best Practices for 2024", date: "Feb 05, 2024" },
        { id: 3, title: "The Future of AI in Web Development", date: "Mar 10, 2024" }
    ]

    const categories = ['All', 'Tech', 'Life', 'Education', 'Business', 'Insights']

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/posts/')
            const data = await response.json()
            setPosts(data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching posts:', error)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
        window.scrollTo(0, 0)
    }, [])

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.content1.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || 
                               (post.catagory && post.catagory.some(c => c.name === selectedCategory));
        return matchesSearch && matchesCategory
    })

    // Pagination Logic
    const indexOfLastPost = currentPage * postsPerPage
    const indexOfFirstPost = indexOfLastPost - postsPerPage
    const currentPosts = filteredPosts.slice(0, indexOfLastPost) // Using Load More style
    const hasMore = indexOfLastPost < filteredPosts.length

    return (
        <div className="posts_page_wrapper">
            {/* Professional Hero/Header */}
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
                {/* Main Post Section */}
                <main className="posts_main_area">
                    {/* Category Filter Bar */}
                    <div className="filter_bar">
                        <button 
                            className={`filter_chip ${selectedCategory === 'All' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('All')}
                        >
                            All Stories
                        </button>
                        {categories.slice(1).map(cat => (
                            <button 
                                key={cat}
                                className={`filter_chip ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
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
                                                        src={post.images.find(img => img.position === 2)?.image || post.images[0].image} 
                                                        alt={post.title} 
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="placeholder_thumb">
                                                        <BookOpen size={40} />
                                                    </div>
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
                                                    <span><Calendar size={14} /> {new Date(post.published_date).toLocaleDateString()}</span>
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

                            {/* Pagination - Load More */}
                            {hasMore && (
                                <div className="pagination_area">
                                    <button 
                                        className="load_more_btn"
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        Load More Articles
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* Sidebar */}
                <aside className="blog_sidebar">
                    {/* Search Widget */}
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

                    {/* Popular Posts Widget */}
                    <div className="sidebar_widget popular_widget">
                        <h3>Popular Stories <TrendingUp size={18} className="title_icon" /></h3>
                        <div className="popular_list">
                            {popularPosts.map(post => (
                                <Link to={`/posts/${post.id}`} key={post.id} className="popular_item">
                                    <div className="item_content">
                                        <h4>{post.title}</h4>
                                        <span>{post.date}</span>
                                    </div>
                                    <ChevronRight size={16} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter Widget */}
                    <div className="sidebar_widget newsletter_widget">
                        <div className="newsletter_card">
                            <div className="icon_circle"><Mail size={24} /></div>
                            <h3>Join the Circle</h3>
                            <p>Get the latest reflections and tutorials delivered to your inbox.</p>
                            <form className="sidebar_newsletter_form" onSubmit={e => e.preventDefault()}>
                                <input type="email" placeholder="Your email address" required />
                                <button type="submit">Subscribe Now</button>
                            </form>
                        </div>
                    </div>

                    {/* Socials Widget */}
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

            {/* Premium Archive Footer */}
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