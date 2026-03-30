import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './NotFound.css'

const NotFound = () => {
    return (
        <div className="not_found_container">
            {/* Decorative background glows */}
            <div className="bg_glow_1"></div>
            <div className="bg_glow_2"></div>

            <div className="not_found_content">
                <div className="not_found_glitch_wrapper">
                    <h1 className="not_found_404">404</h1>
                </div>
                
                <h2 className="not_found_title">Page Lost in Space</h2>
                <p className="not_found_text">
                    The story you're looking for has wandered off the map. 
                    Perhaps it's a draft, a deleted memory, or just a typo in the URL.
                </p>

                <Link to="/" className="back_home_btn">
                    <ArrowLeft size={18} />
                    Return to the Journey
                </Link>
            </div>
        </div>
    )
}

export default NotFound
