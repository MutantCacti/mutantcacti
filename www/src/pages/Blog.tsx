import { Link, useParams } from 'react-router-dom'
import { posts, categories, getCategoryBySlug, getPostsByTag } from '../data/posts'
import Card from '../components/Card'
import Tiltable from '../components/Tiltable'
import TimeAge from '../components/TimeAge'
import HilbertCanvas from '../components/HilbertCanvas'
import CausticCanvas from '../components/CausticCanvas'
import MandelbrotCanvas from '../components/MandelbrotCanvas'
import PostList from '../components/PostList'

export default function Blog() {
    const { category: categorySlug } = useParams<{ category: string }>()
    const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined

    if (categorySlug && !category) {
        return (
            <div className='text-center'>
                <h1 className='text-accent-light text-2xl mb-4'>Category not found</h1>
            </div>
        )
    }

    if (category) {
        const filteredPosts = getPostsByTag(category.tag)
        return (
            <>
                <Link to='/blog' className='text-text-muted hover:text-accent-light transition-colors text-sm mb-3 inline-block self-start' draggable={false}>
                    &larr; Blog
                </Link>
                <div className='w-full mb-6 bg-bg border border-border rounded-lg overflow-hidden relative'>
                    {category.slug === 'essays'
                        ? <HilbertCanvas className='absolute inset-0 w-full h-full' rotation={90} iterations={6} strokeMultiplier={0.15} scaleBase='width' mobileScaleBase='width' />
                        : category.slug === 'poetry'
                        ? <CausticCanvas className='absolute inset-0 w-full h-full' gradientHeight={400} />
                        : category.slug === 'music'
                        ? <MandelbrotCanvas className='absolute inset-0 w-full h-full' rotation={-Math.PI}/>
                        : <div className='absolute inset-0 bg-surface' />
                    }
                    <div className='absolute inset-0' style={{ background: 'radial-gradient(ellipse 90% 120% at 0% 54%, var(--color-bg) 30%, transparent 100%)' }} />
                    <div className='relative px-6 py-5'>
                        <h1 className='text-text text-3xl'>{category.label}</h1>
                    </div>
                </div>
                <PostList categorySlug={category.slug} filteredPosts={filteredPosts} />
            </>
        )
    }

    const recentPosts = posts.slice(0, 4)

    return (
        <>
            <h1 className='sr-only'>Blog</h1>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 w-full'>
                {categories.map(cat => (
                    <Link key={cat.slug} to={`/blog/${cat.slug}`} className='rounded-lg' draggable={false}>
                        <Tiltable className='h-full'>
                            <div className='bg-bg border border-border rounded-lg overflow-hidden h-full'>
                                <div className='relative h-40 sm:will-change-transform' style={{ clipPath: 'inset(0 round 0 0 15% 15%)' }}>
                                    {cat.slug === 'essays'
                                        ? <HilbertCanvas iterations={4} strokeMultiplier={0.15} className='absolute inset-0 w-full h-full' mobileScaleBase='height' />
                                        : cat.slug === 'poetry'
                                        ? <CausticCanvas className='absolute inset-0 w-full h-full' />
                                        : cat.slug === 'music'
                                        ? <MandelbrotCanvas className='absolute inset-0 w-full h-full' />
                                        : <div className='absolute inset-0 bg-surface' />
                                    }
                                    <div className='absolute inset-0 pointer-events-none' style={{ boxShadow: 'inset 0 0 12px 4px hsla(0, 0%, 100%, 0.18)' }} />
                                    <div className='absolute pointer-events-none' style={{
                                        inset: '0 0 -1px 0',
                                        boxShadow: 'inset 0 -60px 40px -10px var(--color-bg)',
                                    }} />
                                </div>
                                <div className='px-4 pb-4 -mt-4 relative'>
                                    <h2 className='text-accent-light text-xl mb-2'>{cat.label}</h2>
                                    <p className='text-text-muted text-xs'>
                                        {(() => { const n = getPostsByTag(cat.tag).length; return `${n} ${n === 1 ? 'post' : 'posts'}` })()}
                                    </p>
                                </div>
                            </div>
                        </Tiltable>
                    </Link>
                ))}
            </div>
            {recentPosts.length > 0 && (
                <section className='w-full mt-8'>
                    <h2 className='text-text text-xl mb-4'>Recent Posts</h2>
                    <div className='flex flex-col gap-5'>
                        {recentPosts.map(post => {
                            const cat = categories.find(c => post.tags.includes(c.tag))
                            return (
                                <Link key={post.slug} to={`/blog/${cat?.slug ?? 'essays'}/${post.slug}`} state={{ from: '/blog', label: 'Blog' }} draggable={false} className='group'>
                                    <Card className='w-full'>
                                        <h3 className='text-accent-light text-lg group-hover:underline decoration-accent-light underline-offset-2'>{post.title}</h3>
                                        <div className='flex items-center gap-2 mt-1'>
                                            <TimeAge date={post.date} className='text-text-muted text-sm' />
                                            {cat && <span className='text-text-muted text-xs bg-border px-2 py-0.5 rounded'>{cat.label}</span>}
                                        </div>
                                        {post.description && (
                                            <p className='text-text mt-2'>{post.description}</p>
                                        )}
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            )}
        </>
    )
}
