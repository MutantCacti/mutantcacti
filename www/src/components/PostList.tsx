import { Link } from 'react-router-dom'
import type { posts } from '../data/posts'
import { getCategoryBySlug } from '../data/posts'
import Card from './Card'
import TimeAge from './TimeAge'
import CreditPills from './CreditPills'

export default function PostList({ categorySlug, filteredPosts }: { categorySlug: string, filteredPosts: typeof posts }) {
    if (filteredPosts.length === 0) {
        return <p className='text-text-muted text-center'>No posts yet.</p>
    }

    return (
        <div className='flex flex-col gap-5 w-full'>
            {filteredPosts.map(post => (
                <Link key={post.slug} to={`/blog/${categorySlug}/${post.slug}`} state={{ from: `/blog/${categorySlug}`, label: getCategoryBySlug(categorySlug)?.label ?? 'Blog' }} draggable={false} className='group'>
                    <Card className='w-full'>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                            <h2 className='text-accent-light text-xl group-hover:underline decoration-accent-light underline-offset-2'>{post.title}</h2>
                            <TimeAge date={post.date} className='text-text-muted text-sm' />
                        </div>
                        {post.credit && <CreditPills credit={post.credit} />}
                        {post.description && (
                            <p className='text-text mt-2'>{post.description}</p>
                        )}
                    </Card>
                </Link>
            ))}
        </div>
    )
}
