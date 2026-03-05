import React, { useState, useEffect } from 'react'

const Posts = () => {
    const [value, setValue] = useState([])

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/posts/')
            const data = await response.json()
            console.log(data)
            
            setValue(data)
        } catch (error) {
            console.error('Error fetching posts:', error)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    return (
        <div>
            <h2 className='text-red-500'>Posts</h2>
            <ul>
                {value.map(post => (
                    <li key={post.id}>
                        <h3>{post.title}</h3>
                        <p>{post.content1}</p>
                        {Array.isArray(post.images) && post.images
                        .filter(img => img.position === 2)
                        .map((img, i) => (
                            <img key={i} src={img.image} alt={`Image ${i}`} />
                            ))
                        }
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Posts