import accessibubbleLanding from '../assets/images/accessibubble-screenshot-2.png'
import accessibubbleAudit from '../assets/images/accessibubble-screenshot-1.png'
import rotateFrames from '../assets/images/rotateai-1.png'
import rotateValidation from '../assets/images/rotateai-2.png'

export type ProjectImage = {
    src: string
    alt: string
}

export type Project = {
    title: string
    description: string
    tags: string[]
    images?: ProjectImage[]
    repoUrl?: string
    featured: boolean
}

export const projects: Project[] = [
    {
        title: 'Accessibubble',
        description: 'Free online accessibility checker that crowdsources user testing data through public reviews and NLP.',
        tags: ['Accessibility', 'NLP', 'Full-Stack'],
        images: [
            { src: accessibubbleLanding, alt: 'Accessibubble landing page with search bar and recent audit results' },
            { src: accessibubbleAudit, alt: 'Accessibubble audit results showing accessibility score and violations' },
        ],
        featured: true,
    },
    {
        title: 'AI Rotate',
        description: 'Research project using hybrid ML and deterministic algorithms to correct the orientation of sensor tags on free-ranging whales. My role: deploying the inference pipeline onto embedded hardware with power-efficient duty cycling.',
        tags: ['TFLite Micro', 'C', 'STM32', 'Python'],
        images: [
            { src: rotateFrames, alt: 'Diagram showing coordinate frame transformations from Earth frame to whale frame to tag frame' },
            { src: rotateValidation, alt: 'Depth and whale-frame acceleration plots with surface validation intervals highlighted' },
        ],
        featured: true,
    },
]
