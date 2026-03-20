import { use, useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createBrowserRouter, Router, RouterProvider } from 'react-router-dom'
import { createRoutesFromElements, Route } from 'react-router-dom'
import RootLayout from '../Components/layout/RootLayout'
import Home from '../Components/pages/Home'
import About from '../Components/pages/About'
import Contact from '../Components/pages/Contact'
import Posts from '../Components/pages/Posts'
import PostDetail from '../Components/pages/PostDetail'
import AdminLayout from '../Components/layout/AdminLayout'
import AdminDashboard from '../Components/pages/AdminDashboard'

function App() {
  const [count, setCount] = useState(0)



  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
        </Route>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </>
    )
  )

  return (
    <RouterProvider router={router} />
  )
}

export default App
