const Home = () => {
    return (
        <div>
            <div className="home_page">
                <div className="logo_container">
                    <img src="logo.png" alt="Logo" />
                    <h1>From My Life</h1>
                    <p className="part_logo">Stories, lessons, and reflections worth sharing.</p>
                    <p className="intro">I’m Temesgen, sharing my thoughts, experiences, and lessons learned along the way.</p>
                </div>
                <button>Get Started &rarr;</button>
            </div>
            <div className="leatest_post">
                <h1 className="title">Latest Post</h1>
                <p className="phrase">Catch up on my newest reflections and experiences.</p>
                <div className="posts_container">
                    <div className="post_card">
                        <img src="home_bg.png" alt="Post 1" />
                        <h1 className="post_title">Embracing Change: My Journey of Growth</h1>
                        <p className="post_excerpt">Business today is more than profit margins; it is about creating value, building trust, and adapting to change. Companies that thrive are those that innovate, listen to customers, and lead with resilience. This post explores three key pillars that shape modern business success.</p>
                    </div>
                    <div className="post_card">
                        <img src="home_bg.png" alt="Post 1" />
                        <h1 className="post_title">Embracing Change: My Journey of Growth</h1>
                        <p className="post_excerpt">Business today is more than profit margins; it is about creating value, building trust, and adapting to change. Companies that thrive are those that innovate, listen to customers, and lead with resilience. This post explores three key pillars that shape modern business success.
                        </p>
                    </div>
                    <div className="post_card">
                        <img src="home_bg.png" alt="Post 1" />
                        <h1 className="post_title">Embracing Change: My Journey of Growth</h1>
                        <p className="post_excerpt">Business today is more than profit margins; it is about creating value, building trust, and adapting to change. Companies that thrive are those that innovate, listen to customers, and lead with resilience. This post explores three key pillars that shape modern business success. </p>
                        <a className="read-more" href="/posts/embracing-change-my-journey-of-growth">Read More</a>
                        <div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home