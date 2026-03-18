export type PostMeta = {
    title: string
    date: string
    slug: string
    tags: string[]
    description?: string
    credit?: string
}

type MDXComponent = React.ComponentType<{ components?: Record<string, React.ComponentType> }>

type PostModule = {
    default: MDXComponent
    frontmatter: Record<string, unknown>
}

const modules = import.meta.glob<PostModule>('../posts/*.mdx', { eager: true })

export const posts: (PostMeta & { Component: MDXComponent })[] = Object.entries(modules)
    .map(([path, mod]) => {
        const slug = path.split('/').pop()!.replace(/\.mdx$/, '')
        const fm = mod.frontmatter ?? {}
        return {
            title: typeof fm.title === 'string' ? fm.title : slug,
            date: typeof fm.date === 'string' ? fm.date : '',
            slug,
            tags: Array.isArray(fm.tags) ? fm.tags as string[] : [],
            description: typeof fm.description === 'string' ? fm.description : undefined,
            credit: typeof fm.credit === 'string' ? fm.credit : undefined,
            Component: mod.default,
        }
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1)) // dates must be YYYY-MM-DD for string sort

export function getPostBySlug(slug: string) {
    return posts.find(p => p.slug === slug)
}

export const categories = [
    { slug: 'essays', label: 'Essays', tag: 'essay' },
    { slug: 'poetry', label: 'Poetry', tag: 'poetry' },
    { slug: 'music', label: 'Music', tag: 'music' },
] as const

export type Category = (typeof categories)[number]

export function getCategoryBySlug(slug: string) {
    return categories.find(c => c.slug === slug)
}

export function getPostsByTag(tag: string) {
    return posts.filter(p => p.tags.includes(tag))
}
