import { useParams, useLocation, Link } from 'react-router-dom'
import { getPostBySlug, getCategoryBySlug } from '../data/posts'
import { mdxComponents } from '../components/mdx'
import Card from '../components/Card'
import CreditPills from '../components/CreditPills'

export default function BlogPost() {
    const { category: categorySlug, slug } = useParams<{ category: string; slug: string }>()
    const location = useLocation()
    const post = slug ? getPostBySlug(slug) : undefined
    const raw = location.state
    const navState = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : null
    const backTo = (typeof navState?.from === 'string' ? navState.from : null) ?? (categorySlug ? `/blog/${categorySlug}` : '/blog')
    const backLabel = (typeof navState?.label === 'string' ? navState.label : null) ?? getCategoryBySlug(categorySlug ?? '')?.label ?? 'Blog'

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
            <Link to={backTo} className='text-text-muted hover:text-accent-light transition-colors text-sm mb-3 inline-block' draggable={false}>
                &larr; {backLabel}
            </Link>
            <Card className='p-10'>
                <header className='flex flex-col sm:flex-row gap-3 items-center my-3'>
                    <h1 className='text-accent text-3xl mr-auto'>{post.title}</h1>
                    <span className='flex gap-3 mr-auto sm:mr-0'>
                        <time dateTime={post.date}>{post.date}</time>
                        {post.tags.map(tag => (
                            <span key={tag} className='bg-border px-2 py-0.5 rounded text-xs text-text'>
                                {tag}
                            </span>
                        ))}
                    </span>
                </header>
                {post.credit && <CreditPills credit={post.credit} />}
                <div className='mb-8'/>
                <div className='prose'>
                    <Component components={mdxComponents} />
                </div>
            </Card>
        </article>
    )
}
