// Parametric logo generator for melogo
// r(t) = R/3 + 2R/3 * t²  (quadratic expansion → 90° at junction)
// θ(t) = 2πt

const R = 12, d = R / 3, cx = 16, cy = 16

// Outer circle - clockwise in SVG
const N_circ = 60
const circPts = []
for (let i = 0; i <= N_circ; i++) {
    const θ = 2 * Math.PI * i / N_circ
    circPts.push([cx + R * Math.cos(θ), cy + R * Math.sin(θ)])
}

// Spiral - counterclockwise in SVG
// Quadratic ensures dr/dθ = 0 at start → tangent perpendicular to radius → ~90° at junction
const N_spiral = 80
const θ0 = 0.03   // tiny angular gap at junction
const θ1 = 2 * Math.PI - 0.001
const spiralPts = []

for (let i = 0; i <= N_spiral; i++) {
    const t = i / N_spiral
    const θ = θ0 + (θ1 - θ0) * t
    const r = d + (R - d) * t * t
    spiralPts.push([cx + r * Math.cos(θ), cy - r * Math.sin(θ)])
}

// Build path: outer circle → line to junction → spiral → Z
let path = `M ${circPts[0][0].toFixed(2)},${circPts[0][1].toFixed(2)}`
for (let i = 1; i < circPts.length; i++) {
    path += ` L ${circPts[i][0].toFixed(2)},${circPts[i][1].toFixed(2)}`
}
path += ` L ${(cx + d).toFixed(2)},${cy.toFixed(2)}`
for (const [x, y] of spiralPts) {
    path += ` L ${x.toFixed(2)},${y.toFixed(2)}`
}
path += ' Z'

console.log(path)

// Verification
const s0 = spiralPts[0], s1 = spiralPts[1]
const spiralDir = [s1[0] - s0[0], s1[1] - s0[1]]
const dot = spiralDir[0] // dot with [1, 0]
const mag = Math.sqrt(spiralDir[0] ** 2 + spiralDir[1] ** 2)
const angle = Math.acos(dot / mag) * 180 / Math.PI
console.error(`Junction angle: ${angle.toFixed(1)}°`)
console.error(`Min distance from center: ${d.toFixed(2)}`)
