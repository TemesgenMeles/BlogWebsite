import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
    Calendar, User, Clock, ChevronLeft, 
    Share2, Twitter, Linkedin, Link as LinkIcon,
    ArrowRight, BookOpen
} from 'lucide-react'

const PostDetail = () => {
    const { id } = useParams()
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/posts/${id}/`)
                const data = await response.json()
                setPost(data)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching post:', error)
                setLoading(false)
            }
        }
        fetchPost()
        window.scrollTo(0, 0)
    }, [id])

    if (loading) {
        return (
            <div className="loading_screen">
                <div className="loader"></div>
                <p>Opening the story...</p>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="error_screen">
                <h2>Post Not Found</h2>
                <Link to="/posts" className="back_link"><ChevronLeft /> Back to Blog</Link>
            </div>
        )
    }

    return (
        <article className="post_detail_wrapper">
            {/* Minimal Header with Back Link */}
            <div className="article_top_nav">
                <div className="container">
                    <Link to="/posts" className="back_btn">
                        <ChevronLeft size={20} /> Back to Archive
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <header className="article_hero">
                <div className="container_narrow">
                    <div className="article_meta_header">
                        <span className="category_pill">{post.category || 'Insight'}</span>
                        <span className="read_time"><Clock size={16} /> 6 min read</span>
                    </div>
                    <h1 className="article_title">{post.title}</h1>
                    
                    <div className="author_meta_box">
                        <div className="author_avatar">
                            {/* Shortened for premium look */}
                            <div className="avatar_initials">TM</div>
                        </div>
                        <div className="author_info">
                            <h4>Temesgen Meles</h4>
                            <div className="meta_details">
                                <span className="meta_item"><Calendar size={14} /> {post.date || 'Oct 24, 2023'}</span>
                                <span className="meta_item"><User size={14} /> Author</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Featured Image */}
            <div className="container">
                <div className="article_featured_image">
                    {Array.isArray(post.images) && post.images.length > 0 ? (
                        <img 
                            src={post.images.find(img => img.position === 2)?.image || post.images[0].image} 
                            alt={post.title} 
                        />
                    ) : (
                        <div className="image_fallback_hero">
                            <BookOpen size={80} />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="article_body_container">
                <div className="container_narrow">
                    <div className="article_content_grid">
                        {/* Share Sidebar (Sticky) */}
                        <aside className="share_sidebar_sticky">
                            <span>SHARE</span>
                            <div className="share_icons">
                                <button title="Share on Twitter"><Twitter size={20} /></button>
                                <button title="Share on LinkedIn"><Linkedin size={20} /></button>
                                <button title="Copy Link"><LinkIcon size={20} /></button>
                            </div>
                        </aside>

                        {/* Main Text Content */}
                        <div className="article_rich_text">
                            <p className="dropcap">
                                {post.content1}
                            </p>
                            
                            {/* Mock additional content for depth */}
                            <blockquote>
                                "Coding isn't just about syntax; it's about solving problems and creating experiences that resonate with people."
                            </blockquote>
                            
                            <p>
                                Personal growth often happens at the edges of our comfort zone. Whether it's mastering a new framework like React or navigating the complexities of a backend system, every line of code tells a story of persistence and discovery.
                            </p>

                            <div className="in_article_tags">
                                {['Development', 'Growth', 'Coding'].map(tag => (
                                    <span key={tag} className="content_tag">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Simple Bottom Navigation */}
                    <footer className="article_footer">
                        <div className="related_navigation">
                            <Link to="/posts" className="nav_btn_simple">
                                <ChevronLeft size={20} /> Previous Article
                            </Link>
                            <Link to="/posts" className="nav_btn_simple">
                                Next Article <ArrowRight size={20} />
                            </Link>
                        </div>
                    </footer>
                </div>
            </div>
        </article>
    )
}

export default PostDetail
