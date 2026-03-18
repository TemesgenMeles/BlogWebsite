import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Calendar, User, Clock, ChevronLeft,
    Share2, Twitter, Linkedin, Link as LinkIcon,
    ArrowRight, BookOpen, Heart
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

    const [liking, setLiking] = useState(false)

    const handleLike = async () => {
        if (liking) return
        setLiking(true)
        try {
            const response = await fetch(`http://127.0.0.1:8000/posts/${id}/like/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (response.ok) {
                const updatedPost = await response.json()
                setPost(updatedPost)
            }
        } catch (error) {
            console.error('Error liking post:', error)
        } finally {
            setLiking(false)
        }
    }

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
                        <div className="category_pill_list">
                            {post.catagory?.map(cat => (
                                <span key={cat.slug} className={`category_pill badge_${cat.slug || 'insight'}`}>
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                        <span className="read_time"><Clock size={16} /> 6 min read</span>
                    </div>
                    <h1 className="article_title">{post.title}</h1>

                    <div className="author_meta_box">
                        <div className="author_avatar">
                            <div className="avatar_initials">
                                {post.author?.first_name ? post.author.first_name[0].toUpperCase() : <User size={20} />}
                            </div>
                        </div>
                        <div className="author_info">
                            <h4>{post.author?.first_name} {post.author?.last_name}</h4>
                            <div className="meta_details">
                                <span className="meta_item"><Calendar size={14} /> {new Date(post.published_date).toLocaleDateString()}</span>
                                <span className="meta_item"><User size={14} /> {post.author?.is_staff ? 'Admin' : 'Author'}</span>
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
                            src={post.images.find(img => img.position === 1)?.image || post.images[0].image}
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
                                <button
                                    className="like_btn_detail"
                                    onClick={handleLike}
                                    title="Like this story"
                                    disabled={liking}
                                >
                                    <Heart size={20} className={post.likes > 0 ? 'filled_heart' : ''} />
                                    <span className="like_count">{post.likes}</span>
                                </button>
                                <button title="Share on Twitter"><Twitter size={20} /></button>
                                <button title="Share on LinkedIn"><Linkedin size={20} /></button>
                                <button title="Copy Link"><LinkIcon size={20} /></button>
                            </div>
                        </aside>

                        {/* Main Text Content */}
                        <div className="article_rich_text">
                            {/* Lead Content */}
                            {post.main_content && <p className="lead_content">{post.main_content}</p>}

                            {/* Image 1 - Inset Image */}
                            {post.images?.find(img => img.position === 2) && (
                                <figure className="article_inset_image">
                                    <img
                                        src={post.images.find(img => img.position === 2).image}
                                        alt="Contextual"
                                    />
                                    {post.images.find(img => img.position === 2).discription && (
                                        <figcaption>{post.images.find(img => img.position === 2).discription}</figcaption>
                                    )}
                                </figure>
                            )}

                            {/* Content Block 1 */}
                            {post.content1 && <p className="dropcap">{post.content1}</p>}

                            {/* Image 3 & 4 - Gallery Grid */}
                            {(post.images?.find(img => img.position === 3) || post.images?.find(img => img.position === 4)) && (
                                <div className="article_gallery_grid">
                                    {post.images?.find(img => img.position === 3) && (
                                        <img src={post.images.find(img => img.position === 3).image} alt="Detail view" />
                                    )}
                                    {post.images?.find(img => img.position === 4) && (
                                        <img src={post.images.find(img => img.position === 4).image} alt="Detail view" />
                                    )}
                                </div>
                            )}

                            {/* Split Section 1: Text + Vertical Image */}
                            <div className="article_split_section split_align_top">
                                <div className="split_text">
                                    {post.content2 && <p>{post.content2}</p>}
                                </div>
                                <div className="split_media">
                                    {post.images?.find(img => img.position === 6) && (
                                        <figure className="article_vertical_image_mini">
                                            <img
                                                src={post.images.find(img => img.position === 6).image}
                                                alt="Perspective view"
                                            />
                                            {post.images.find(img => img.position === 6).discription && (
                                                <figcaption>{post.images.find(img => img.position === 6).discription}</figcaption>
                                            )}
                                        </figure>
                                    )}
                                </div>
                            </div>

                            <blockquote>
                                "Coding isn't just about syntax; it's about solving problems and creating experiences that resonate with people."
                            </blockquote>

                            {/* Split Section 2: Square Image + Text (Reversed on Desktop) */}
                            <div className="article_split_section split_reversed split_align_center">
                                <div className="split_media">
                                    {post.images?.find(img => img.position === 7) && (
                                        <figure className="article_square_image_mini">
                                            <img
                                                src={post.images.find(img => img.position === 7).image}
                                                alt="Detail focus"
                                            />
                                            {post.images.find(img => img.position === 7).discription && (
                                                <figcaption>{post.images.find(img => img.position === 7).discription}</figcaption>
                                            )}
                                        </figure>
                                    )}
                                </div>
                                <div className="split_text">
                                    {post.content3 && <p>{post.content3}</p>}
                                </div>
                            </div>

                            {/* Image 5 - Wide Section Break */}
                            {post.images?.find(img => img.position === 5) && (
                                <div className="article_break_image">
                                    <img src={post.images.find(img => img.position === 5).image} alt="Section Divider" />
                                </div>
                            )}

                            {/* Image 8 - Panoramic/Cinematic Closing */}
                            {post.images?.find(img => img.position === 8) && (
                                <div className="article_cinematic_image">
                                    <img src={post.images.find(img => img.position === 8).image} alt="Closing Cinematic" />
                                    {post.images.find(img => img.position === 8).discription && (
                                        <p className="image_caption_simple">{post.images.find(img => img.position === 8).discription}</p>
                                    )}
                                </div>
                            )}

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
