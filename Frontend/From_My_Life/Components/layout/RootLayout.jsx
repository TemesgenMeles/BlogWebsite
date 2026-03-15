import {Outlet, NavLink} from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const RootLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className=''>
            <header className='navigation'>
                <div className=' logo_container'>
                    <img src="logo_green.png" alt="Logo image"/>
                </div>

                <button className="mobile_menu_btn" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
                </button>

                <nav className={`nav_container ${isMenuOpen ? 'mobile_open' : ''}`}>
                    <ul className='nav_list'>
                        <li><NavLink to="/" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink></li>
                        <li><NavLink to="/about" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>About</NavLink></li>
                        <li><NavLink to="/contact" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Contact</NavLink></li>
                        <li><NavLink to="/posts" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Posts</NavLink></li>
                    </ul>
                </nav>
            </header>
            
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default RootLayout