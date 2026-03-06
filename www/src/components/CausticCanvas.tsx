import { useRef, useEffect } from 'react'

type WaveConfig = {
    angle: number      // direction the wave travels (radians)
    frequency: number  // spatial frequency
    amplitude: number  // how much the wave deflects the flow
    speed: number      // temporal frequency
    phase: number      // initial phase offset
}

type FlowFn = (x: number, y: number, t: number) => [number, number]

// --- Configurable constants ---

const PARTICLE_COUNT = 100
const PARTICLE_LIFESPAN = 3200     // ms before respawn
const TRAIL_LENGTH = 20            // positions retained per particle
const BLOB_RADIUS = 12              // influence radius in field pixels
const TIME_SCALE = 0.05             // simulation speed (normal)
const TIME_SCALE_HOVER = 0.2      // simulation speed (hover)
const FLOW_SPEED = 2.0             // global multiplier on flow magnitude
const WAVE_GLOBAL_AMP = 1.5        // global multiplier on wave deflection
// contour bands: each line sweeps from one boundary to the next
const CONTOUR_BOUNDS = [0.2, 1.0, 1.6, 2.8, 4.0] // N+1 boundaries → N sweeping lines
const CONTOUR_CYCLE_SPEED = 2.0    // cycles per second (in simulation time)
const CONTOUR_ALPHA = 0.5          // peak opacity — particle contours
const CONTOUR_WIDTH = 3.0          // line width in CSS px

// --- Layer 2: density-driven hue shift ---
const HUE_SHIFT = 0                // degrees — no hue rotation, just intensity shift
const HUE_SHIFT_SAT_BOOST = 5.0   // saturation multiplier for shifted layer (>1 = more vivid)
const HUE_SHIFT_LIT_DROP = 0.8    // lightness multiplier for shifted layer (<1 = darker)
const HUE_SHIFT_STRENGTH = 1      // max alpha of shifted layer in empty areas
const INVERSION_SENSITIVITY = 0.8  // how quickly density suppresses the shift

// --- Colour system ---

const GRADIENT_ALPHA = 1        // global alpha for gradient fills
const BAND_WARP_AMP = 10        // max warp displacement in CSS px
const BAND_COL_WIDTH = 1        // column width for warped rendering (px)
const GRADIENT_DRIFT_SPEED = 0.02  // vertical drift rate from flow
const GRADIENT_WARP_SPEED = 0.5    // warp phase accumulation rate from flow

// Each band: h, s, l (HSL colour), alpha (0-1), pos (0=top, 1=bottom), width (fraction of canvas height), sharpness (0=diffuse, 1=hard), warpPhase (radians)
const GRADIENT_BANDS = [
    { h: 175, s: 35, l: 40, alpha: 0.5, pos: 0.85, width: 0.8, sharpness: 0, warpPhase: 0, warpFreq: 0.06 },       // deep turquoise — low, wide, diffuse
    { h: 35,  s: 55, l: 55, alpha: 0.35, pos: 0.6, width: 0.25, sharpness: 0.1, warpPhase: -0.2, warpFreq: 0.04 },  // amber thread — thin, tight
    { h: 160, s: 65, l: 70, alpha: 0.2, pos: 0.45, width: 0.4, sharpness: 0.1, warpPhase: 1.0, warpFreq: 0.02 },    // lighter turquoise
    { h: 350, s: 70, l: 80, alpha: 0.3, pos: 0.25, width: 0.4, sharpness: 0, warpPhase: 0.0, warpFreq: 0.03 },      // rose-white
    { h: 190, s: 50, l: 60, alpha: 0.3, pos: 0.1, width: 0.4, sharpness: 0, warpPhase: 3.0, warpFreq: 0.01 },      // light cyan
]

// Per-band contour colours [h, s, l]
const CONTOUR_BAND_COLOURS: [number, number, number][] = [
    [175, 40, 55],   // turquoise
    [30, 15, 80],    // warm white
    [350, 25, 70],   // rose
    [40, 50, 60],    // gold/amber
]

const WAVES: WaveConfig[] = [
    { angle: 0.2,  frequency: 3,  amplitude: 0.5, speed: 1.0, phase: 0 },
    { angle: 0.7,  frequency: 5,  amplitude: 0.35, speed: 1.3, phase: 1.2 },
    { angle: -0.3, frequency: 4,  amplitude: 0.4,  speed: 0.7, phase: 2.5 },
    { angle: 1.2,  frequency: 2.5, amplitude: 0.25, speed: 0.9, phase: 3.8 },
]

// Radial inward toward top-center
const FLOW_SINK = { x: 0.5, y: -1.5 }
const DEFAULT_FLOW: FlowFn = (x, y, _t) => {
    const dx = FLOW_SINK.x - x
    const dy = FLOW_SINK.y - y
    const len = Math.sqrt(dx * dx + dy * dy) || 0.001
    return [dx / len, dy / len]
}

type CausticCanvasProps = {
    className?: string
    flow?: FlowFn
    waves?: WaveConfig[]
}

type Particle = {
    x: number
    y: number
    age: number
    maxAge: number
    trail: Float32Array  // interleaved [x0, y0, x1, y1, ...]
    trailLen: number
}

function drawGradients(
    ctx: CanvasRenderingContext2D,
    w: number, h: number,
    globalAlpha: number,
    time: number,
    drift: number,
    hueOffset: number = 0,
    satMul: number = 1,
    litMul: number = 1,
) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0; i < GRADIENT_BANDS.length; i++) {
        const band = GRADIENT_BANDS[i]

        // flow at band center → vertical drift (accumulates from 0 via drift)
        const fdy = FLOW_SINK.y - band.pos
        const fdLen = Math.sqrt((FLOW_SINK.x - 0.5) ** 2 + fdy * fdy) || 0.001
        const baseCenterY = h * (band.pos + (fdy / fdLen) * drift * GRADIENT_DRIFT_SPEED)
        const halfH = h * 0.5 * band.width

        const hue = (band.h + hueOffset + 360) % 360
        const sat = Math.min(100, band.s * satMul)
        const lit = Math.min(100, band.l * litMul)
        const a = Math.min(globalAlpha * band.alpha, 1)
        const edge = Math.max(0.001, 0.5 * (1 - band.sharpness))
        const c0 = `hsla(${hue}, ${sat}%, ${lit}%, 0)`
        const c1 = `hsla(${hue}, ${sat}%, ${lit}%, ${a})`

        for (let cx = 0; cx < w; cx += BAND_COL_WIDTH) {
            const colW = Math.min(BAND_COL_WIDTH, w - cx)
            const nx = cx + colW * 0.5
            const normX = nx / w

            // flow at this column → warp phase accumulates with flow direction
            const cdx = FLOW_SINK.x - normX
            const cdy = FLOW_SINK.y - band.pos
            const cLen = Math.sqrt(cdx * cdx + cdy * cdy) || 0.001
            const colFlowX = cdx / cLen

            const p = band.warpPhase + colFlowX * drift * GRADIENT_WARP_SPEED
            const f = band.warpFreq
            const dy = (Math.sin(nx * f + p) * 0.6
                      + Math.sin(nx * f * 0.37 + p * 0.7 + 1.7) * 0.4) * BAND_WARP_AMP

            const centerY = baseCenterY + dy
            const grad = ctx.createLinearGradient(0, centerY - halfH, 0, centerY + halfH)
            grad.addColorStop(0, c0)
            grad.addColorStop(edge, c1)
            grad.addColorStop(1 - edge, c1)
            grad.addColorStop(1, c0)

            ctx.fillStyle = grad
            ctx.fillRect(cx, 0, colW, h)
        }
    }

    ctx.restore()
}

function sampleWaves(waves: WaveConfig[], x: number, y: number, t: number): [number, number] {
    let dx = 0, dy = 0
    for (let i = 0; i < waves.length; i++) {
        const w = waves[i]
        const proj = x * Math.cos(w.angle) + y * Math.sin(w.angle)
        const v = Math.sin(proj * w.frequency - t * w.speed + w.phase) * w.amplitude
        // deflect perpendicular to wave direction
        dx += -Math.sin(w.angle) * v
        dy += Math.cos(w.angle) * v
    }
    return [dx * WAVE_GLOBAL_AMP, dy * WAVE_GLOBAL_AMP]
}

// Marching squares segment table: for each case, array of [edgeA, edgeB] pairs
// Edge encoding: 0=top, 1=right, 2=bottom, 3=left
const MS_SEGMENTS: readonly (readonly [number, number][])[] = [
    /* 0*/ [], /* 1*/ [[3,2]], /* 2*/ [[2,1]], /* 3*/ [[3,1]],
    /* 4*/ [[0,1]], /* 5*/ [[0,3],[2,1]], /* 6*/ [[0,2]], /* 7*/ [[0,3]],
    /* 8*/ [[0,3]], /* 9*/ [[0,2]], /*10*/ [[0,1],[3,2]], /*11*/ [[0,1]],
    /*12*/ [[3,1]], /*13*/ [[2,1]], /*14*/ [[3,2]], /*15*/ [],
]

function traceAndDrawContours(
    ctx: CanvasRenderingContext2D,
    field: Float32Array,
    fieldW: number, fieldH: number,
    fScale: number,
    iso: number,
    caseBuf: Uint8Array,
    visitBuf: Uint8Array,
    fwdBuf: Float32Array,
    bwdBuf: Float32Array,
) {
    const cw = fieldW - 1
    const ch = fieldH - 1

    for (let cy = 0; cy < ch; cy++) {
        const row = cy * fieldW
        for (let cx = 0; cx < cw; cx++) {
            const tl = field[row + cx], tr = field[row + cx + 1]
            const bl = field[row + fieldW + cx], br = field[row + fieldW + cx + 1]
            caseBuf[cy * cw + cx] = (tl >= iso ? 8 : 0) | (tr >= iso ? 4 : 0)
                | (br >= iso ? 2 : 0) | (bl >= iso ? 1 : 0)
        }
    }
    visitBuf.fill(0)

    function writeEdge(buf: Float32Array, cx: number, cy: number, edge: number, off: number): number {
        const row = cy * fieldW
        const tl = field[row + cx], tr = field[row + cx + 1]
        const bl = field[row + fieldW + cx], br = field[row + fieldW + cx + 1]
        switch (edge) {
            case 0: { const t = (iso - tl) / (tr - tl); buf[off] = cx * fScale + t * fScale; buf[off + 1] = cy * fScale; break }
            case 1: { const t = (iso - tr) / (br - tr); buf[off] = (cx + 1) * fScale; buf[off + 1] = cy * fScale + t * fScale; break }
            case 2: { const t = (iso - bl) / (br - bl); buf[off] = cx * fScale + t * fScale; buf[off + 1] = (cy + 1) * fScale; break }
            case 3: { const t = (iso - tl) / (bl - tl); buf[off] = cx * fScale; buf[off + 1] = cy * fScale + t * fScale; break }
        }
        return off + 2
    }

    function trace(
        buf: Float32Array,
        startCx: number, startCy: number,
        cx: number, cy: number, exitEdge: number,
        off: number,
    ): [number, boolean] {
        let curCx = cx, curCy = cy, curExit = exitEdge
        for (;;) {
            let nx: number, ny: number, nEntry: number
            switch (curExit) {
                case 0: if (curCy === 0) return [off, false]; nx = curCx; ny = curCy - 1; nEntry = 2; break
                case 1: if (curCx >= cw - 1) return [off, false]; nx = curCx + 1; ny = curCy; nEntry = 3; break
                case 2: if (curCy >= ch - 1) return [off, false]; nx = curCx; ny = curCy + 1; nEntry = 0; break
                case 3: if (curCx === 0) return [off, false]; nx = curCx - 1; ny = curCy; nEntry = 1; break
                default: return [off, false]
            }
            if (nx === startCx && ny === startCy) return [off, true]

            const ni = ny * cw + nx
            const segs = MS_SEGMENTS[caseBuf[ni]]
            let found = false
            for (let si = 0; si < segs.length; si++) {
                if (visitBuf[ni * 2 + si]) continue
                const [eA, eB] = segs[si]
                let nExit: number
                if (eA === nEntry) nExit = eB
                else if (eB === nEntry) nExit = eA
                else continue
                visitBuf[ni * 2 + si] = 1
                off = writeEdge(buf, nx, ny, nExit, off)
                curCx = nx; curCy = ny; curExit = nExit
                found = true
                break
            }
            if (!found) return [off, false]
        }
    }

    // helper: read x from the logical polyline (bwd reversed + fwd)
    function px(bwdCount: number, i: number): number {
        if (i < bwdCount) return bwdBuf[(bwdCount - 1 - i) * 2]
        return fwdBuf[(i - bwdCount) * 2]
    }
    function py(bwdCount: number, i: number): number {
        if (i < bwdCount) return bwdBuf[(bwdCount - 1 - i) * 2 + 1]
        return fwdBuf[(i - bwdCount) * 2 + 1]
    }

    for (let cy = 0; cy < ch; cy++) {
        for (let cx = 0; cx < cw; cx++) {
            const ci = cy * cw + cx
            const segs = MS_SEGMENTS[caseBuf[ci]]

            for (let si = 0; si < segs.length; si++) {
                if (visitBuf[ci * 2 + si]) continue
                visitBuf[ci * 2 + si] = 1

                const [eA, eB] = segs[si]

                // fwdBuf: [ptA, ptB, fwd...]
                writeEdge(fwdBuf, cx, cy, eA, 0)
                writeEdge(fwdBuf, cx, cy, eB, 2)
                const [fwdEnd, closed] = trace(fwdBuf, cx, cy, cx, cy, eB, 4)
                const fwdCount = fwdEnd / 2 // total points in fwdBuf

                let bwdCount = 0
                if (!closed) {
                    // bwdBuf: backward trace (stored outward, read in reverse)
                    const [bwdEnd] = trace(bwdBuf, cx, cy, cx, cy, eA, 0)
                    bwdCount = bwdEnd / 2
                }

                const n = bwdCount + fwdCount
                if (n < 2) continue

                if (n === 2) {
                    ctx.moveTo(px(bwdCount,0), py(bwdCount,0))
                    ctx.lineTo(px(bwdCount,1), py(bwdCount,1))
                    continue
                }

                if (closed) {
                    // all points in fwdBuf, bwdCount=0, so px/py just reads fwdBuf
                    const lx = fwdBuf[(n - 1) * 2], ly = fwdBuf[(n - 1) * 2 + 1]
                    ctx.moveTo((lx + fwdBuf[0]) / 2, (ly + fwdBuf[1]) / 2)
                    for (let i = 0; i < n; i++) {
                        const j = (i + 1) % n
                        const ix = fwdBuf[i * 2], iy = fwdBuf[i * 2 + 1]
                        const jx = fwdBuf[j * 2], jy = fwdBuf[j * 2 + 1]
                        ctx.quadraticCurveTo(ix, iy, (ix + jx) / 2, (iy + jy) / 2)
                    }
                } else {
                    const x0 = px(bwdCount,0), y0 = py(bwdCount,0)
                    const x1 = px(bwdCount,1), y1 = py(bwdCount,1)
                    ctx.moveTo(x0, y0)
                    ctx.lineTo((x0 + x1) / 2, (y0 + y1) / 2)
                    for (let i = 1; i < n - 1; i++) {
                        const xi = px(bwdCount,i), yi = py(bwdCount,i)
                        const xn = px(bwdCount,i + 1), yn = py(bwdCount,i + 1)
                        ctx.quadraticCurveTo(xi, yi, (xi + xn) / 2, (yi + yn) / 2)
                    }
                    const xe = px(bwdCount,n - 1), ye = py(bwdCount,n - 1)
                    ctx.lineTo(xe, ye)
                }
            }
        }
    }
}

function spawnParticle(w: number, h: number, scatter = false): Particle {
    let x: number, y: number
    if (scatter) {
        x = Math.random() * w
        y = Math.random() * h
    } else {
        // respawn along edges, weighted toward bottom and sides
        const edge = Math.random()
        if (edge < 0.5) {
            // bottom edge
            x = Math.random() * w
            y = h + Math.random() * 10
        } else if (edge < 0.75) {
            // left edge
            x = -Math.random() * 10
            y = Math.random() * h
        } else {
            // right edge
            x = w + Math.random() * 10
            y = Math.random() * h
        }
    }
    return {
        x, y,
        age: 0,
        maxAge: PARTICLE_LIFESPAN + Math.random() * 1200 - 600,
        trail: new Float32Array(TRAIL_LENGTH * 2),
        trailLen: 0,
    }
}

export default function CausticCanvas({ className, flow = DEFAULT_FLOW, waves = WAVES }: CausticCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animId = 0
        let dpr = 1
        let canvasW = 0
        let canvasH = 0
        let particles: Particle[] = []
        let time = Math.random() * 1000
        let driftAccum = 0             // separate accumulator for gradient drift (starts at 0)
        let lastTime = performance.now()
        let currentPace = TIME_SCALE   // smoothly interpolated pace

        // field at reduced resolution
        const FIELD_SCALE = 3 // 1 field pixel = 3x3 CSS pixels
        let fieldW = 0
        let fieldH = 0
        let field: Float32Array | null = null
        let shiftBuf: HTMLCanvasElement | null = null
        let shiftCtx: CanvasRenderingContext2D | null = null
        let maskBuf: HTMLCanvasElement | null = null
        let maskCtx: CanvasRenderingContext2D | null = null
        let maskImgData: ImageData | null = null
        let caseBuf: Uint8Array | null = null
        let visitBuf: Uint8Array | null = null
        let fwdBuf: Float32Array | null = null
        let bwdBuf: Float32Array | null = null
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
        const card = canvas.closest('.overflow-hidden') ?? canvas

        let hovering = false
        function onMouseEnter() { hovering = true }
        function onMouseLeave() { hovering = false }
        card.addEventListener('mouseenter', onMouseEnter)
        card.addEventListener('mouseleave', onMouseLeave)

        let visible = true
        const visObserver = new IntersectionObserver(
            ([entry]) => {
                const wasVisible = visible
                visible = entry.isIntersecting
                if (visible && !wasVisible) lastTime = performance.now()
            },
            { threshold: 0 }
        )
        visObserver.observe(canvas)

        function resize() {
            dpr = window.devicePixelRatio || 1
            canvasW = canvas!.offsetWidth
            canvasH = canvas!.offsetHeight
            if (canvasW === 0 || canvasH === 0) return

            canvas!.width = canvasW * dpr
            canvas!.height = canvasH * dpr

            fieldW = Math.ceil(canvasW / FIELD_SCALE)
            fieldH = Math.ceil(canvasH / FIELD_SCALE)
            field = new Float32Array(fieldW * fieldH)

            shiftBuf = document.createElement('canvas')
            shiftBuf.width = canvasW * dpr
            shiftBuf.height = canvasH * dpr
            shiftCtx = shiftBuf.getContext('2d')!

            maskBuf = document.createElement('canvas')
            maskBuf.width = fieldW
            maskBuf.height = fieldH
            maskCtx = maskBuf.getContext('2d')!
            maskImgData = maskCtx.createImageData(fieldW, fieldH)

            const cellCount = (fieldW - 1) * (fieldH - 1)
            caseBuf = new Uint8Array(cellCount)
            visitBuf = new Uint8Array(cellCount * 2)
            const bufSize = cellCount * 2
            fwdBuf = new Float32Array(bufSize)
            bwdBuf = new Float32Array(bufSize)

            // initial population scattered across canvas with staggered ages
            particles = []
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const p = spawnParticle(canvasW, canvasH, true)
                p.age = Math.floor(Math.random() * p.maxAge)
                particles.push(p)
            }
        }

        function animate() {
            animId = requestAnimationFrame(animate)
            if (!visible || canvasW === 0 || !field || !shiftBuf || !shiftCtx || !maskBuf || !maskCtx || !maskImgData) return

            const now = performance.now()
            const rawDt = Math.min(now - lastTime, 100)
            lastTime = now

            if (reducedMotion.matches) return

            // smoothly interpolate pace toward target (exponential ease)
            const targetPace = hovering ? TIME_SCALE_HOVER : TIME_SCALE
            currentPace += (targetPace - currentPace) * (1 - Math.exp(-rawDt * 0.002))
            const dt = rawDt * currentPace
            time += dt * 0.001
            driftAccum += dt * 0.001

            const w = canvasW
            const h = canvasH
            const invW = 1 / w
            const invH = 1 / h

            // step particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]
                p.age += dt

                if (p.age >= p.maxAge || p.x < -30 || p.x > w + 30 || p.y < -30 || p.y > h + 30) {
                    particles[i] = spawnParticle(w, h)
                    continue
                }

                // push current position into trail
                if (p.trailLen < TRAIL_LENGTH) {
                    p.trail[p.trailLen * 2] = p.x
                    p.trail[p.trailLen * 2 + 1] = p.y
                    p.trailLen++
                } else {
                    p.trail.copyWithin(0, 2)
                    p.trail[(TRAIL_LENGTH - 1) * 2] = p.x
                    p.trail[(TRAIL_LENGTH - 1) * 2 + 1] = p.y
                }

                const nx = p.x * invW
                const ny = p.y * invH
                const [fx, fy] = flow(nx, ny, time)
                const [wx, wy] = sampleWaves(waves, nx * 6, ny * 6, time)

                const step = FLOW_SPEED * dt * 0.06
                p.x += (fx + wx) * step
                p.y += (fy + wy) * step
            }

            // accumulate density field
            field.fill(0)
            const fScale = FIELD_SCALE
            const bR = BLOB_RADIUS
            const bR2 = bR * bR

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]
                const lifeFrac = p.age / p.maxAge
                const alpha = lifeFrac < 0.15 ? lifeFrac / 0.15
                    : lifeFrac > 0.75 ? (1 - lifeFrac) / 0.25
                    : 1.0

                // stamp current position only (trail creates temporal smear via persistence)
                const fx = p.x / fScale
                const fy = p.y / fScale

                const minX = Math.max(0, Math.floor(fx - bR))
                const maxX = Math.min(fieldW - 1, Math.ceil(fx + bR))
                const minY = Math.max(0, Math.floor(fy - bR))
                const maxY = Math.min(fieldH - 1, Math.ceil(fy + bR))

                for (let y = minY; y <= maxY; y++) {
                    const dy = y - fy
                    const dy2 = dy * dy
                    const row = y * fieldW
                    for (let x = minX; x <= maxX; x++) {
                        const dx = x - fx
                        const d2 = dx * dx + dy2
                        if (d2 < bR2) {
                            const f = 1 - d2 / bR2
                            field[row + x] += f * f * alpha
                        }
                    }
                }
            }

            // === LAYER 1: Gradient Atmosphere ===

            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx!.clearRect(0, 0, w, h)
            drawGradients(ctx!, w, h, GRADIENT_ALPHA, time, driftAccum)

            // === LAYER 2: Density-inverted hue shift ===
            // Where particles are absent, the gradient shifts toward its complement.
            // Where particles concentrate, the normal gradient shows through.

            // Build inverted density mask at field resolution
            const maskData = maskImgData!.data
            for (let i = 0; i < field.length; i++) {
                // exponential decay: 1.0 at zero density, drops fast with particles
                const blend = Math.exp(-field[i] * INVERSION_SENSITIVITY)
                const a = Math.floor(blend * HUE_SHIFT_STRENGTH * 255)
                maskData[i * 4] = 255
                maskData[i * 4 + 1] = 255
                maskData[i * 4 + 2] = 255
                maskData[i * 4 + 3] = a
            }
            maskCtx!.putImageData(maskImgData!, 0, 0)

            // Draw hue-shifted gradients to shift buffer (boosted saturation, dropped lightness)
            shiftCtx!.setTransform(dpr, 0, 0, dpr, 0, 0)
            shiftCtx!.clearRect(0, 0, w, h)
            drawGradients(shiftCtx!, w, h, GRADIENT_ALPHA, time, driftAccum, HUE_SHIFT, HUE_SHIFT_SAT_BOOST, HUE_SHIFT_LIT_DROP)

            // Carve contour lines out of the shifted layer (destination-out)
            // The contours become absence — the original gradient showing through the complement
            shiftCtx!.globalCompositeOperation = 'destination-out'
            shiftCtx!.lineWidth = CONTOUR_WIDTH
            shiftCtx!.lineCap = 'round'

            const numBands = CONTOUR_BOUNDS.length - 1

            for (let li = 0; li < numBands; li++) {
                const cycle = (time * CONTOUR_CYCLE_SPEED + li / numBands) % 1
                const iso = CONTOUR_BOUNDS[li] + cycle * (CONTOUR_BOUNDS[li + 1] - CONTOUR_BOUNDS[li])
                const fade = Math.sin(cycle * Math.PI)

                shiftCtx!.strokeStyle = `rgba(255, 255, 255, ${CONTOUR_ALPHA * fade})`
                shiftCtx!.beginPath()
                traceAndDrawContours(shiftCtx!, field, fieldW, fieldH, fScale, iso, caseBuf!, visitBuf!, fwdBuf!, bwdBuf!)
                shiftCtx!.stroke()
            }

            shiftCtx!.globalCompositeOperation = 'source-over'

            // Mask with inverted density (bilinear upscale from field resolution)
            shiftCtx!.globalCompositeOperation = 'destination-in'
            shiftCtx!.setTransform(1, 0, 0, 1, 0, 0)
            shiftCtx!.imageSmoothingEnabled = true
            shiftCtx!.drawImage(maskBuf!, 0, 0, fieldW, fieldH, 0, 0, shiftBuf!.width, shiftBuf!.height)
            shiftCtx!.globalCompositeOperation = 'source-over'

            // Composite shifted layer onto main canvas
            ctx!.drawImage(shiftBuf!, 0, 0, shiftBuf!.width, shiftBuf!.height, 0, 0, w, h)
        }

        resize()
        animId = requestAnimationFrame(animate)

        const resizeObs = new ResizeObserver(() => resize())
        resizeObs.observe(canvas)

        return () => {
            cancelAnimationFrame(animId)
            resizeObs.disconnect()
            visObserver.disconnect()
            card.removeEventListener('mouseenter', onMouseEnter)
            card.removeEventListener('mouseleave', onMouseLeave)
        }
    }, [])

    return <canvas ref={canvasRef} className={className ?? ''} />
}
