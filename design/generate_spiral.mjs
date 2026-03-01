// Generates a tapered golden spiral SVG as a filled shape
// Usage: node design/generate_spiral.mjs > www/public/favicon.svg

const DEG2RAD = Math.PI / 180

// Spiral geometry: 6 quarter-circle arcs with golden ratio radii
// Each arc sweeps -90° (counterclockwise)
const arcs = [
    { cx: 37.2, cy: 20.4, r: 3.1,  startAngle: 270, endAngle: 180 },
    { cx: 39.1, cy: 20.4, r: 5.0,  startAngle: 180, endAngle: 90 },
    { cx: 39.1, cy: 17.3, r: 8.1,  startAngle: 90,  endAngle: 0 },
    { cx: 34.1, cy: 17.3, r: 13.1, startAngle: 0,   endAngle: -90 },
    { cx: 34.1, cy: 25.4, r: 21.2, startAngle: 270, endAngle: 180 },
    { cx: 47.2, cy: 25.4, r: 34.4, startAngle: 180, endAngle: 90 },
]

// Tunables
const samplesPerArc = 200
const minWidth = 1.6   // width at the thin (inner) end
const maxWidth = 8.0   // width at the thick (outer) end

// Sample points along the spiral center line with analytical tangents
const points = []
const totalSamples = arcs.length * samplesPerArc

for (let arcIdx = 0; arcIdx < arcs.length; arcIdx++) {
    const arc = arcs[arcIdx]
    const startSample = (arcIdx === 0) ? 0 : 1
    for (let s = startSample; s <= samplesPerArc; s++) {
        const t = s / samplesPerArc
        const angleDeg = arc.startAngle + t * (arc.endAngle - arc.startAngle)
        const angle = angleDeg * DEG2RAD
        const x = arc.cx + arc.r * Math.cos(angle)
        const y = arc.cy + arc.r * Math.sin(angle)
        const globalT = (arcIdx * samplesPerArc + s) / totalSamples

        // Normal: radial direction pointing away from arc center
        const nx = Math.cos(angle)
        const ny = Math.sin(angle)

        points.push({ x, y, t: globalT, nx, ny })
    }
}

// Compute offset edges
const outerEdge = []
const innerEdge = []

for (let i = 0; i < points.length; i++) {
    const halfWidth = (minWidth + (maxWidth - minWidth) * points[i].t) / 2
    const { x, y, nx, ny } = points[i]

    outerEdge.push({ x: x + nx * halfWidth, y: y + ny * halfWidth })
    innerEdge.push({ x: x - nx * halfWidth, y: y - ny * halfWidth })
}

// Build SVG path: outer edge forward, round end cap, inner edge backward, round start cap
const r = (x) => x.toFixed(4)

// Outer edge
let d = `M ${r(outerEdge[0].x)} ${r(outerEdge[0].y)}`
for (let i = 1; i < outerEdge.length; i++) {
    d += ` L ${r(outerEdge[i].x)} ${r(outerEdge[i].y)}`
}

// Round cap at thick end (sweep=0 to bulge outward)
const endRadius = (minWidth + (maxWidth - minWidth) * 1.0) / 2
d += ` A ${r(endRadius)} ${r(endRadius)} 0 0 0 ${r(innerEdge[innerEdge.length - 1].x)} ${r(innerEdge[innerEdge.length - 1].y)}`

// Inner edge (reversed)
for (let i = innerEdge.length - 2; i >= 0; i--) {
    d += ` L ${r(innerEdge[i].x)} ${r(innerEdge[i].y)}`
}

// Round cap at thin end (sweep=0 to bulge outward)
const startRadius = minWidth / 2
d += ` A ${r(startRadius)} ${r(startRadius)} 0 0 0 ${r(outerEdge[0].x)} ${r(outerEdge[0].y)}`

d += ' Z'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="${d}" fill="#23a67a"/>
</svg>`

process.stdout.write(svg)
