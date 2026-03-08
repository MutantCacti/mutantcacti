import accessibubbleLanding from '../assets/images/accessibubble-screenshot-2.webp'
import accessibubbleAudit from '../assets/images/accessibubble-screenshot-1.webp'
import rotateFrames from '../assets/images/rotateai-1.webp'
import rotateValidation from '../assets/images/rotateai-2.webp'
import cinnamonFrog from '../assets/images/cinnamon-frog.webp'
import cinnamonSprites from '../assets/images/cinnamon-sprites.webp'
import cinnamonSprites2 from '../assets/images/cinnamon-sprites-2.webp'
import cinnamonCouplingBefore from '../assets/images/cinnamon-coupling-before.webp'
import cinnamonCouplingAfter from '../assets/images/cinnamon-coupling-after.webp'
import cinnamonGameplay from '../assets/images/cinnamon-gameplay.webp'
import cinnamonInitFlow from '../assets/images/cinnamon-init-flow.webp'
import cinnamonMusic from '../assets/images/cinnamon-music.webp'
import caretakerCaretaker from '../assets/images/caretaker-caretaker.webp'
import caretakerCanyon from '../assets/images/caretaker-canyon.webp'
import caretakerOceans from '../assets/images/caretaker-oceans.webp'
import caretakerPillars from '../assets/images/caretaker-pillars.webp'
import caretakerConstruct from '../assets/images/caretaker-construct.webp'
import caretakerFoulkAltitude from '../assets/images/caretaker-foulk-altitude.webp'
import caretakerMushrooms from '../assets/images/caretaker-mushrooms.webp'
import caretakerBlenderEgg from '../assets/images/caretaker-blender-egg.webp'
import caretakerBlenderRock from '../assets/images/caretaker-blender-rock.webp'
import caretakerBlenderLevel from '../assets/images/caretaker-blender-level.webp'
import mlqlGraph from '../assets/images/mlql-1.webp'
import mlqlCode from '../assets/images/mlql-2.webp'
import edutrackerStudent from '../assets/images/edutracker-student.webp'
import edutrackerStudents from '../assets/images/edutracker-students.webp'
import edutrackerAssessments from '../assets/images/edutracker-assessments.webp'

export type ProjectImage = {
    src: string
    alt: string
    credit?: string
}

export type ProjectVideo = {
    youtubeId: string
    title: string
    alt: string
    credit?: string
    footnote?: string
}

export type Project = {
    title: string
    year: string
    description: string
    tags: string[]
    images?: ProjectImage[]
    videos?: ProjectVideo[]
    repoUrl?: string
    credit?: string
    featured: boolean
}

export const projects: Project[] = [
    {
        title: 'AI Rotate',
        year: '2026',
        description: 'Research project using hybrid ML and deterministic algorithms to correct the orientation of sensor tags on free-ranging whales. I will deploy Han Yin\'s inference pipeline onto embedded hardware with power-efficient duty cycling.',
        tags: ['TFLite Micro', 'C', 'STM32', 'Python'],
        credit: 'Dr Juan Ye, Prof Patrick Miller, George Sato, Han Yin',
        images: [
            { src: rotateFrames, alt: 'Diagram showing coordinate frame transformations from Earth frame to whale frame to tag frame' },
            { src: rotateValidation, alt: 'Depth and whale-frame acceleration plots with surface validation intervals highlighted' },
        ],
        featured: true,
    },
    {
        title: 'Accessibubble',
        year: '2025–',
        description: 'Free online accessibility checker that crowdsources user testing data through public reviews and NLP.',
        tags: ['Accessibility', 'NLP', 'Full-Stack'],
        credit: 'ac516, ajp34, as696, ep247, eb379, gg89, irv1, kc237, ky39, mm586, pm272, pt76, rh265, wf27, teym1, tfb6, vh46, zlt1',
        images: [
            { src: accessibubbleLanding, alt: 'Accessibubble landing page with search bar and recent audit results', credit: '@teym1, Thomas Yonaha-McCoy' },
            { src: accessibubbleAudit, alt: 'Accessibubble audit results showing accessibility score and violations', credit: '@teym1, Thomas Yonaha-McCoy, Claude Opus 4.5:4.6' },
        ],
        featured: true,
    },
    {
        title: 'Caretaker',
        year: '2024',
        description: "Solo-built 3D platformer engine featuring 9-state movement mechanics, a combat and arena system, and a core 'shift' mechanic allowing traversal between 7 overlapping planes of reality for combination puzzle and parkour gameplay.",
        tags: ['Unity', 'C#', 'HLSL', 'Blender'],
        credit: '@KingLavaCactus, Toby Davies',
        images: [
            { src: caretakerCaretaker, alt: 'Watercolour and ink concept art of a spiderlike cosmic being weaving threads of light inside of a universe, miniature compared to its size' },
            { src: caretakerCanyon, alt: 'Watercolour concept art of a desert canyon landscape with rock formations and caves' },
            { src: caretakerOceans, alt: 'Watercolour concept art of the ocean plane with tropical, alien, and shadow island themes' },
            { src: caretakerBlenderRock, alt: 'Blender viewport showing a geometric rock base 3D model' },
            { src: caretakerBlenderLevel, alt: 'Blender viewport showing the full test level blockout layout from above', credit: '@KingLavaCactus, Toby Davies' },
            { src: caretakerBlenderEgg, alt: 'Blender viewport showing a stylised egg model with procedural shader material' },
            { src: caretakerPillars, alt: 'Ink sketches of pillar and ruins architecture concepts with player scale reference' },
            { src: caretakerConstruct, alt: 'Ink sketches of mechanical enemy designs, structures, and transport constructs' },
            { src: caretakerFoulkAltitude, alt: 'Ink sketches of bird-like Foulk creatures, floating altitude islands, and crystals' },
            { src: caretakerMushrooms, alt: 'Ink sketches of organic mushroom platforms, rattle staircases, and twisted tree formations' },
        ],
        videos: [
            { youtubeId: 'he8ICyA8iz4', title: 'Caretaker animated storyboard', alt: 'Animated storyboard introducing the Caretaker story', footnote: "I still wish I'd animated the weaving clip at the end." },
            { youtubeId: 'MIz3qVXEH5U', title: 'Caretaker gameplay demo', alt: 'Gameplay demo showing movement, shifting, and combat mechanics' },
        ],
        repoUrl: 'https://github.com/MutantCacti/Caretaker/',
        featured: true,
    },
    {
        title: 'Cinnamon',
        year: '2025–',
        description: 'Top-down exploration and dialogue game set in a magic candy kingdom, built by a two-person team. My role: art design, music composition, and story, with contributions to engine architecture.',
        tags: ['REAPER', 'Musescore', 'Game Design'],
        credit: '@KingLavaCactus, BerryBitStudio',
        images: [
            { src: cinnamonFrog, alt: 'Concept art of a frog character, coral formations, mushrooms, and small creatures' },
            { src: cinnamonGameplay, alt: 'Top-down gameplay screenshot with character, terrain, and dialogue box', credit: '@KingLavaCactus, BerryBitStudio' },
            { src: cinnamonMusic, alt: 'Music composition in REAPER DAW and MuseScore with MIDI tracks and orchestral score' },
            { src: cinnamonSprites, alt: 'Ink sketches of candy-making equipment: ovens, cauldrons, lollipops, and sweets' },
            { src: cinnamonSprites2, alt: 'Ink sketches of gummy bears, a cinnamon roll, treasure chest, and flora' },
            { src: cinnamonCouplingBefore, alt: 'Architecture diagram showing tightly coupled manager dependencies', credit: '@KingLavaCactus, BerryBitStudio' },
            { src: cinnamonCouplingAfter, alt: 'Refactored architecture with central event system decoupling all managers', credit: '@KingLavaCactus, BerryBitStudio' },
            { src: cinnamonInitFlow, alt: 'Control flow diagram of game initialization and scene loading sequence', credit: '@KingLavaCactus, BerryBitStudio' },
        ],
        featured: true,
    },
    {
        title: 'city',
        year: '2025–',
        description: 'Generational simulator for LLM societies in a social media-like environment. Agents interact autonomously across generations via context inheritance, enabling ethnographic study of emergent behaviour without human intervention.',
        tags: ['Python', 'LLM', 'Simulation'],
        repoUrl: 'https://github.com/MutantCacti/city',
        featured: false,
    },
    {
        title: 'mlql',
        year: '2026',
        description: 'Graph-based cellular automata simulator with evolutionary rule learning. Nodes evolve through configurable transformation rules, with an evolutionary algorithm to discover optimal rule sets.',
        tags: ['C', 'Python', 'Simulation'],
        images: [
            { src: mlqlGraph, alt: 'Graph simulation at step 37 with directed node network and oscillating cell and edge count plots' },
            { src: mlqlCode, alt: 'VS Code editor showing mlql task scoring code with project file structure' },
        ],
        repoUrl: 'https://github.com/MutantCacti/mlql',
        featured: false,
    },
    {
        title: 'kwami',
        year: '2025',
        description: 'Keylogger with integrated data exfiltration via disguised HTTP headers, developed during a security internship at Orange Cyberdefense.',
        tags: ['C', 'Python', 'Security'],
        featured: false,
    },
    {
        title: 'EduTracker',
        year: '2023',
        description: 'School assessment platform with role-based interfaces for students, teachers, and admins. Automatically generates PDF assessments from question banks and tracks per-student performance over time to target learning gaps.',
        tags: ['PHP', 'SQL', 'Full-Stack'],
        credit: 'Mr Peter Wynd',
        images: [
            { src: edutrackerStudent, alt: 'Teacher view of individual student performance with score chart and assessment history' },
            { src: edutrackerStudents, alt: 'Teacher view of class student list with recent scores, averages, and best topics' },
            { src: edutrackerAssessments, alt: 'Teacher view of assessment list with scores, dates, and completion status' },
        ],
        repoUrl: 'https://github.com/MutantCacti/edutracker',
        featured: false,
    },
    {
        title: 'grav2d',
        year: '2022',
        description: '3D gravity simulator rendered in 2D. Create solar systems by spawning planets that respond to gravitational forces, with adjustable simulation speed and camera controls.',
        tags: ['Unity', 'C#', 'Physics'],
        repoUrl: 'https://github.com/MutantCacti/grav2d',
        featured: false,
    },
]
