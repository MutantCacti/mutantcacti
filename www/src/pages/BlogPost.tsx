import { useParams } from 'react-router-dom'
import { getPostBySlug } from '../data/posts'
import { mdxComponents } from '../components/mdx'
import Card from '../components/Card'
import TimeAge from '../components/TimeAge'

export default function BlogPost() {
    const { slug } = useParams<{ slug: string }>()
    const post = slug ? getPostBySlug(slug) : undefined

    if (!post) {
        return (
            <div className='text-center'>
                <h1 className='text-accent-light text-2xl mb-4'>Post not found</h1>
            </div>
        )
    }

    const { Component } = post

    return (
        <article className='w-full'>
            <Card className='p-10'>
                <header className='flex gap-3 items-center mt-3'>
                    <h1 className='text-text text-3xl mr-auto'>{post.title}</h1>
                    <time>{post.date}</time>
                    {post.tags.map(tag => (
                        <span key={tag} className='bg-border px-2 py-0.5 rounded text-xs text-text'>
                            {tag}
                        </span>
                    ))}
                </header>
                <div className='mb-8'/>
                <div className='prose'>
                    <Component components={mdxComponents} />
                </div>
            </Card>
        </article>
    )
}
