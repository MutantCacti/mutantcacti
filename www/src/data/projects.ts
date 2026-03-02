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
import caretakerCanyon from '../assets/images/caretaker-canyon.jpg'
import caretakerArcaneEgg from '../assets/images/caretaker-arcane-egg.jpg'
import caretakerOceanPlane from '../assets/images/caretaker-ocean-plane.jpg'
import caretakerGateway from '../assets/images/caretaker-gateway.jpg'
import caretakerPillars from '../assets/images/caretaker-pillars.jpg'
import caretakerEnemies from '../assets/images/caretaker-enemies.jpg'
import caretakerCreatures from '../assets/images/caretaker-creatures.jpg'
import caretakerPlatforms from '../assets/images/caretaker-platforms.jpg'
import caretakerBlenderEgg from '../assets/images/caretaker-blender-egg.png'
import caretakerBlenderRock from '../assets/images/caretaker-blender-rock.png'
import caretakerBlenderLevel from '../assets/images/caretaker-blender-level.png'

export type ProjectImage = {
    src: string
    alt: string
}

export type ProjectVideo = {
    youtubeId: string
    title: string
    alt: string
}

export type Project = {
    title: string
    description: string
    tags: string[]
    images?: ProjectImage[]
    videos?: ProjectVideo[]
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
        title: 'Caretaker',
        description: "Solo-built 3D platformer engine featuring 9-state movement mechanics, a combat and arena system, and a core 'shift' mechanic allowing traversal between 7 overlapping planes of reality for combination puzzle and parkour gameplay.",
        tags: ['Unity', 'C#', 'HLSL', 'Blender'],
        images: [
            { src: caretakerGateway, alt: 'Watercolour and ink concept art of a spiderlike cosmic being weaving threads of light inside of a universe, miniature compared to its size' },
            { src: caretakerCanyon, alt: 'Watercolour concept art of a desert canyon landscape with rock formations and caves' },
            { src: caretakerArcaneEgg, alt: 'Ink concept art of arcane egg designs with variable straight, spiral, atomic, and tree patterns' },
            { src: caretakerOceanPlane, alt: 'Watercolour concept art of the ocean plane with tropical, alien, and shadow island themes' },
            { src: caretakerPillars, alt: 'Ink sketches of pillar and ruins architecture concepts with player scale reference' },
            { src: caretakerEnemies, alt: 'Ink sketches of mechanical enemy designs, structures, and transport constructs' },
            { src: caretakerCreatures, alt: 'Ink sketches of bird-like Foulk creatures, floating altitude islands, and crystals' },
            { src: caretakerPlatforms, alt: 'Ink sketches of organic mushroom platforms, rattle staircases, and twisted tree formations' },
            { src: caretakerBlenderEgg, alt: 'Blender viewport showing a stylised egg model with procedural shader material' },
            { src: caretakerBlenderRock, alt: 'Blender viewport showing a geometric rock base 3D model' },
            { src: caretakerBlenderLevel, alt: 'Blender viewport showing the full test level blockout layout from above' },
        ],
        videos: [
            { youtubeId: 'he8ICyA8iz4', title: 'Caretaker animated storyboard', alt: 'Animated storyboard introducing the Caretaker story' },
            { youtubeId: 'MIz3qVXEH5U', title: 'Caretaker gameplay demo', alt: 'Gameplay demo showing movement, shifting, and combat mechanics' },
        ],
        repoUrl: 'https://github.com/MutantCacti/Caretaker/',
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
