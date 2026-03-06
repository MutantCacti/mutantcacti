import { Link, useParams } from 'react-router-dom'
import { posts, categories, getCategoryBySlug, getPostsByTag } from '../data/posts'
import Card from '../components/Card'
import Tiltable from '../components/Tiltable'
import HilbertCanvas from '../components/HilbertCanvas'
import CausticCanvas from '../components/CausticCanvas'

function PostList({ categorySlug, filteredPosts }: { categorySlug: string, filteredPosts: typeof posts }) {
    if (filteredPosts.length === 0) {
        return <p className='text-text-muted text-center'>No posts yet.</p>
    }

    return (
        <div className='flex flex-col gap-4 w-full'>
            {filteredPosts.map(post => (
                <Link key={post.slug} to={`/blog/${categorySlug}/${post.slug}`}>
                    <Card className='w-full'>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 mb-2'>
                            <h2 className='text-accent-light text-xl'>{post.title}</h2>
                            <span className='text-text-muted text-sm'>{post.date}</span>
                        </div>
                        {post.description && (
                            <p className='text-text'>{post.description}</p>
                        )}
                    </Card>
                </Link>
            ))}
        </div>
    )
}

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
                <div className='w-full mb-6 bg-bg border border-border rounded-lg overflow-hidden relative'>
                    {category.slug === 'essays'
                        ? <HilbertCanvas className='absolute inset-0 w-full h-full' rotation={90} iterations={6} strokeMultiplier={0.15} scaleBase='width' />
                        : category.slug === 'poetry'
                        ? <CausticCanvas className='absolute inset-0 w-full h-full' gradientHeight={400} />
                        : <div className='absolute inset-0 bg-surface' />
                    }
                    <div className='absolute inset-0' style={{ background: 'radial-gradient(ellipse 70% 100% at 0% 54%, var(--color-bg) 30%, transparent 100%)' }} />
                    <div className='relative px-6 py-5'>
                        <h1 className='text-text text-3xl'>{category.label}</h1>
                    </div>
                </div>
                <PostList categorySlug={category.slug} filteredPosts={filteredPosts} />
            </>
        )
    }

    return (
        <>
            <h1 className='sr-only'>Blog</h1>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 w-full'>
                {categories.map(cat => (
                    <Link key={cat.slug} to={`/blog/${cat.slug}`} className='rounded-lg'>
                        <Tiltable className='h-full'>
                            <div className='bg-bg border border-border rounded-lg overflow-hidden h-full'>
                                <div className='relative h-40' style={{ willChange: 'transform' }}>
                                    {cat.slug === 'essays'
                                        ? <HilbertCanvas iterations={4} strokeMultiplier={0.15} className='absolute inset-0 w-full h-full' />
                                        : cat.slug === 'poetry'
                                        ? <CausticCanvas className='absolute inset-0 w-full h-full' />
                                        : <div className='absolute inset-0 bg-surface' />
                                    }
                                    <div className='absolute inset-0 pointer-events-none' style={{ boxShadow: 'inset 0 0 12px 4px hsla(0, 0%, 100%, 0.18)' }} />
                                    <div className='absolute inset-0 pointer-events-none' style={{
                                        borderRadius: '0 0 15% 15%',
                                        boxShadow: '0 0 0 9999px var(--color-bg)',
                                    }} />
                                    <div className='absolute pointer-events-none' style={{
                                        inset: '0 0 -1px 0',
                                        borderRadius: '0 0 15% 15%',
                                        boxShadow: 'inset 0 -60px 40px -10px var(--color-bg)',
                                    }} />
                                </div>
                                <div className='px-4 pb-4 -mt-4 relative'>
                                    <h2 className='text-accent-light text-xl mb-2'>{cat.label}</h2>
                                    <p className='text-text-muted text-xs'>
                                        {getPostsByTag(cat.tag).length} {getPostsByTag(cat.tag).length === 1 ? 'post' : 'posts'}
                                    </p>
                                </div>
                            </div>
                        </Tiltable>
                    </Link>
                ))}
            </div>
        </>
    )
}
