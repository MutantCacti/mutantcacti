import accessibubbleLanding from '../assets/images/accessibubble-screenshot-2.png'
import accessibubbleAudit from '../assets/images/accessibubble-screenshot-1.png'
import rotateFrames from '../assets/images/rotateai-1.png'
import rotateValidation from '../assets/images/rotateai-2.png'
import cinnamonConceptArt1 from '../assets/images/cinnamon-concept-art-1.jpg'
import cinnamonConceptArt2 from '../assets/images/cinnamon-concept-art-2.jpg'
import cinnamonConceptArt3 from '../assets/images/cinnamon-concept-art-3.jpg'
import cinnamonCouplingBefore from '../assets/images/cinnamon-coupling-before.png'
import cinnamonCouplingAfter from '../assets/images/cinnamon-coupling-after.png'
import cinnamonGameplay from '../assets/images/cinnamon-gameplay.png'
import cinnamonInitFlow from '../assets/images/cinnamon-init-flow.png'
import cinnamonMusic from '../assets/images/cinnamon-music.png'

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
        title: 'AI Rotate',
        description: 'Research project using hybrid ML and deterministic algorithms to correct the orientation of sensor tags on free-ranging whales. My role: deploying the inference pipeline onto embedded hardware with power-efficient duty cycling.',
        tags: ['TFLite Micro', 'C', 'STM32', 'Python'],
        images: [
            { src: rotateFrames, alt: 'Diagram showing coordinate frame transformations from Earth frame to whale frame to tag frame' },
            { src: rotateValidation, alt: 'Depth and whale-frame acceleration plots with surface validation intervals highlighted' },
        ],
        featured: true,
    },
    {
        title: 'Accessibubble',
        description: "Free online accessibility checker that crowdsources user testing data through public reviews and NLP. I organise a team of 18 and am the project's largest contributor.",
        tags: ['Accessibility', 'NLP', 'Full-Stack'],
        images: [
            { src: accessibubbleLanding, alt: 'Accessibubble landing page with search bar and recent audit results' },
            { src: accessibubbleAudit, alt: 'Accessibubble audit results showing accessibility score and violations' },
        ],
        featured: true,
    },
    {
        title: 'Cinnamon',
        description: 'Top-down exploration and dialogue game set in a magic candy kingdom, built by a two-person team. My role: art design, music composition, and story, with contributions to engine architecture.',
        tags: ['Unity', 'C#', 'REAPER', 'Game Design'],
        images: [
            { src: cinnamonConceptArt1, alt: 'Concept art of a frog character, coral formations, mushrooms, and small creatures' },
            { src: cinnamonGameplay, alt: 'Top-down gameplay screenshot with character, terrain, and dialogue box' },
            { src: cinnamonConceptArt2, alt: 'Ink sketches of candy-making equipment: ovens, cauldrons, lollipops, and sweets' },
            { src: cinnamonConceptArt3, alt: 'Ink sketches of gummy bears, a cinnamon roll, treasure chest, and flora' },
            { src: cinnamonCouplingBefore, alt: 'Architecture diagram showing tightly coupled manager dependencies' },
            { src: cinnamonCouplingAfter, alt: 'Refactored architecture with central event system decoupling all managers' },
            { src: cinnamonInitFlow, alt: 'Control flow diagram of game initialization and scene loading sequence' },
            { src: cinnamonMusic, alt: 'Music composition in REAPER DAW and MuseScore with MIDI tracks and orchestral score' },
        ],
        featured: true,
    },
]
