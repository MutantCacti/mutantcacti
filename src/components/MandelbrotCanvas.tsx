import { useRef, useEffect } from 'react'

// ── Fractal target ──────────────────────────────────────────────
const CENTER_RE = -1.401155       // Antenna tip (period-doubling accumulation)
const CENTER_IM = 0
const ROTATION = Math.PI / 2     // Antenna points downward on screen
const MAX_ITER = 160

// ── Zoom ────────────────────────────────────────────────────────
const RADIUS_START = 0.002        // View half-height in complex units (close)
const RADIUS_MAX = 3.0            // Reset zoom when set is too small to see
const ZOOM_RATE = 0.015           // Exponential zoom-out per compute frame
const COMPUTE_FPS = 0.5           // Mandelbrot generation rate (idle)
const HOVER_COMPUTE_FPS = 30       // Mandelbrot generation rate (hovered)
const RENDER_SCALE = 0.2

// ── Colour palette ──────────────────────────────────────────────
const INSIDE_RGB: [number, number, number] = [2, 4, 24]
const PALETTE_SPEED = 2.5         // Colour cycles across iteration range
const PALETTE_OFFSET = 0.65       // Phase offset
// Per-channel: [base, amplitude, phase]
const CH_R: [number, number, number] = [100, 155, 0]
const CH_G: [number, number, number] = [4, 12, Math.PI]
const CH_B: [number, number, number] = [100, 155, 100]
const EMA_DECAY = 0.92            // Blend weight for previous frame (0 = no trail, 1 = frozen)

// ── Saturation bands ────────────────────────────────────────────
const SAT_INTENSITY = 0.6              // Max desaturation (0 = none, 1 = full grayscale)
const SAT_SCALE = 3.0                  // Pattern frequency (higher = more bands)
const SAT_DRIFT: [number, number] = [0.0, -0.5]  // Pattern scroll per second (x, y); negative y = upward
const SAT_SHAPE = (t: number) => 0.5 + 0.5 * Math.sin(t)  // Transition function (0–1)

// ── Green suppression ──────────────────────────────────────────
const GREEN_SUPPRESS = 1.0          // How much green excess to redirect to blue (0 = none, 1 = all)

const TWO_PI = Math.PI * 2

type Props = { className?: string; rotation?: number }

export default function MandelbrotCanvas({ className, rotation = ROTATION }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
        const cosR = Math.cos(rotation)
        const sinR = Math.sin(rotation)
        const pixelSize = Math.max(1, Math.round(1 / RENDER_SCALE))

        let w = 0
        let h = 0
        let rw = 0
        let rh = 0
        let oc: HTMLCanvasElement | null = null
        let octx: CanvasRenderingContext2D | null = null
        let img: ImageData | null = null
        let d: Uint8ClampedArray | null = null
        let raw: Float32Array | null = null
        let accum: Float32Array | null = null
        let pixelCount = 0

        let radius = RADIUS_START
        let lastCompute = 0
        let currentFPS = COMPUTE_FPS
        let hovered = false
        let prevTime = 0
        let satTime = 0
        let rafId: number
        let needsInitialCompute = true

        function resize() {
            w = canvas!.clientWidth
            h = canvas!.clientHeight
            if (!w || !h) return
            canvas!.width = w
            canvas!.height = h

            rw = Math.max(1, Math.ceil(w / pixelSize))
            rh = Math.max(1, Math.ceil(h / pixelSize))

            oc = document.createElement('canvas')
            oc.width = rw
            oc.height = rh
            octx = oc.getContext('2d')!
            img = octx.createImageData(rw, rh)
            d = img.data

            raw = new Float32Array(rw * rh * 3)
            accum = new Float32Array(rw * rh * 3)
            pixelCount = rw * rh * 3
            needsInitialCompute = true
        }

        // Detect hover on the nearest positioned ancestor (e.g. the hero banner)
        const hoverTarget = canvas.offsetParent as HTMLElement ?? canvas
        function onEnter() { hovered = true }
        function onLeave() { hovered = false }
        hoverTarget.addEventListener('mouseenter', onEnter)
        hoverTarget.addEventListener('mouseleave', onLeave)

        function compute() {
            if (!raw) return
            const step = (radius * 2) / rh

            for (let py = 0; py < rh; py++) {
                for (let px = 0; px < rw; px++) {
                    const dx = (px + 0.5 - rw / 2) * step
                    const dy = (py + 0.5 - rh / 2) * step
                    const re = CENTER_RE + dx * cosR - dy * sinR
                    const im = CENTER_IM + dx * sinR + dy * cosR

                    let zr = 0, zi = 0, i = 0
                    while (i < MAX_ITER && zr * zr + zi * zi < 4) {
                        const tmp = zr * zr - zi * zi + re
                        zi = 2 * zr * zi + im
                        zr = tmp
                        i++
                    }

                    const ai = (py * rw + px) * 3
                    if (i === MAX_ITER) {
                        raw[ai] = INSIDE_RGB[0]; raw[ai + 1] = INSIDE_RGB[1]; raw[ai + 2] = INSIDE_RGB[2]
                    } else {
                        const smooth = i + 1 - Math.log2(Math.log2(zr * zr + zi * zi))
                        const p = TWO_PI * (smooth / MAX_ITER * PALETTE_SPEED + PALETTE_OFFSET)
                        raw[ai]     = CH_R[0] + CH_R[1] * Math.sin(p + CH_R[2])
                        raw[ai + 1] = CH_G[0] + CH_G[1] * Math.sin(p + CH_G[2])
                        raw[ai + 2] = CH_B[0] + CH_B[1] * Math.sin(p + CH_B[2])
                    }
                }
            }

            radius *= 1 + ZOOM_RATE
            if (radius > RADIUS_MAX) radius = RADIUS_START
        }

        function tick(time: number) {
            rafId = requestAnimationFrame(tick)
            if (!raw || !accum || !d || !img || !octx || !oc) return
            if (reducedMotion.matches) return

            if (needsInitialCompute) {
                compute()
                accum.set(raw)
                needsInitialCompute = false
                lastCompute = time
            }

            const rawDt = prevTime ? time - prevTime : 16
            prevTime = time
            satTime += rawDt * 0.001

            // Smoothly interpolate compute rate toward target (exponential ease)
            const targetFPS = hovered ? HOVER_COMPUTE_FPS : COMPUTE_FPS
            currentFPS += (targetFPS - currentFPS) * (1 - Math.exp(-rawDt * 0.002))

            // Compute new Mandelbrot frame on schedule
            if (time - lastCompute >= 1000 / currentFPS) {
                lastCompute = time
                compute()
            }

            // Blend accumulator toward latest raw frame every display frame
            const fresh = 1 - EMA_DECAY
            for (let j = 0; j < pixelCount; j++) {
                accum[j] = accum[j] * EMA_DECAY + raw[j] * fresh
            }

            // Write accumulator to ImageData
            for (let p = 0; p < rw * rh; p++) {
                const ai = p * 3
                const off = p * 4
                d[off]     = accum[ai]
                d[off + 1] = accum[ai + 1]
                d[off + 2] = accum[ai + 2]
                d[off + 3] = 255
            }

            // Saturation band post-processing (rotated with fractal)
            for (let p = 0; p < rw * rh; p++) {
                const px = p % rw
                const py = (p - px) / rw
                // Centre-relative normalised coords, rotated by the fractal rotation
                const cx = px / rw - 0.5
                const cy = py / rh - 0.5
                const nx = cx * cosR - cy * sinR + 0.5
                const ny = cx * sinR + cy * cosR + 0.5
                const t = TWO_PI * SAT_SCALE * (ny + SAT_DRIFT[1] * satTime)
                        + TWO_PI * SAT_SCALE * (nx + SAT_DRIFT[0] * satTime)
                const sat = SAT_INTENSITY * SAT_SHAPE(t)
                const off = p * 4
                const r = d[off], g = d[off + 1], b = d[off + 2]
                const lum = 0.299 * r + 0.587 * g + 0.114 * b
                const keep = 1 - sat
                d[off]     = lum + (r - lum) * keep
                d[off + 1] = lum + (g - lum) * keep
                d[off + 2] = lum + (b - lum) * keep
            }

            // Green suppression: redirect green excess into blue
            for (let p = 0; p < rw * rh; p++) {
                const off = p * 4
                const g = d[off + 1]
                const floor = Math.max(d[off], d[off + 2])
                if (g > floor) {
                    const excess = (g - floor) * GREEN_SUPPRESS
                    d[off + 1] = g - excess
                    d[off + 2] = d[off + 2] + excess
                }
            }

            octx.putImageData(img, 0, 0)
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(oc, 0, 0, w, h)
        }

        resize()
        rafId = requestAnimationFrame(tick)

        const resizeObs = new ResizeObserver(() => resize())
        resizeObs.observe(canvas)

        return () => {
            cancelAnimationFrame(rafId)
            resizeObs.disconnect()
            hoverTarget.removeEventListener('mouseenter', onEnter)
            hoverTarget.removeEventListener('mouseleave', onLeave)
        }
    }, [rotation])

    return <canvas ref={canvasRef} aria-hidden='true' className={className} style={{ touchAction: 'pan-y' }} />
}
