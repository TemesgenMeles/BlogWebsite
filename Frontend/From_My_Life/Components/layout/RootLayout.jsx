import {Outlet, NavLink} from 'react-router-dom'

const RootLayout = () => {
    return (
        <div className=''>
            <header className='navigation'>
                <div className=' logo_container'>
                    <img src="logo_green.png" alt="Logo image"/>
                </div>
                <nav className='nav_container'>
                    <ul className='nav_list'>
                        <li><NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink></li>
                        <li><NavLink to="/about" className={({isActive}) => isActive ? 'active' : ''}>About</NavLink></li>
                        <li><NavLink to="/contact" className={({isActive}) => isActive ? 'active' : ''}>Contact</NavLink></li>
                        <li><NavLink to="/posts" className={({isActive}) => isActive ? 'active' : ''}>Posts</NavLink></li>
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