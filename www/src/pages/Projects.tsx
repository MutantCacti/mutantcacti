import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'

export default function Projects() {
    const featured = projects.filter(p => p.featured)

    return (
        <div className="w-full flex flex-col gap-4">
            {featured.map(project => (
                <ProjectCard key={project.title} {...project} />
            ))}
        </div>
    )
}
