import { useRef, useState, useEffect } from 'react'
import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'

export default function Projects() {
    const [activeIndex, setActiveIndex] = useState(0)
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement)
                        if (idx !== -1) setActiveIndex(idx)
                    }
                }
            },
            { rootMargin: '-50% 0px -50% 0px' },
        )

        for (const el of cardRefs.current) {
            if (el) observer.observe(el)
        }

        let wasAtBottom = false
        function onScroll() {
            const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 50
            if (atBottom) {
                wasAtBottom = true
                setActiveIndex(projects.length - 1)
            } else if (wasAtBottom) {
                wasAtBottom = false
                const center = window.innerHeight / 2
                let closest = 0
                let minDist = Infinity
                for (let i = 0; i < cardRefs.current.length; i++) {
                    const el = cardRefs.current[i]
                    if (!el) continue
                    const rect = el.getBoundingClientRect()
                    const dist = Math.abs(rect.top + rect.height / 2 - center)
                    if (dist < minDist) { minDist = dist; closest = i }
                }
                setActiveIndex(closest)
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true })

        return () => {
            observer.disconnect()
            window.removeEventListener('scroll', onScroll)
        }
    }, [])

    function scrollTo(index: number) {
        cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    const featured = projects.filter(p => p.featured)
    const solo = projects.filter(p => !p.featured)

    return (
        <div className='w-full relative'>
            <h1 className='sr-only'>Projects</h1>
            <div className='flex flex-col gap-4'>
                {featured.map((project, i) => (
                    <div
                        key={project.title}
                        ref={el => { cardRefs.current[i] = el }}
                    >
                        <ProjectCard {...project} />
                    </div>
                ))}
                {solo.length > 0 && (
                    <>
                        <h2 className='text-text text-xl mt-4'>Solo Projects</h2>
                        {solo.map((project, i) => {
                            const idx = featured.length + i
                            return (
                                <div
                                    key={project.title}
                                    ref={el => { cardRefs.current[idx] = el }}
                                >
                                    <ProjectCard {...project} />
                                </div>
                            )
                        })}
                    </>
                )}
            </div>
            {projects.length > 1 && (
                <nav
                    className='hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 flex-col gap-3 items-center'
                    aria-label='Project navigation'
                >
                    {projects.map((project, i) => (
                        <button
                            key={project.title}
                            tabIndex={-1}
                            onClick={() => scrollTo(i)}
                            aria-label={`Go to ${project.title}`}
                            aria-current={i === activeIndex ? 'true' : undefined}
                            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${i === activeIndex ? 'bg-accent-light scale-125' : 'bg-border hover:bg-text-muted'}`}
                        />
                    ))}
                </nav>
            )}
        </div>
    )
}
