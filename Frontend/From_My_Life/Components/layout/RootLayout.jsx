import {Outlet} from 'react-router-dom'
import { Link } from 'react-router-dom'

const RootLayout = () => {
    return (
        <div>
            
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                    <li><Link to="/posts">Posts</Link></li>
                </ul>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default RootLayout