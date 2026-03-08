import { useRef, useEffect } from 'react'
import LSystem from 'lindenmayer'

// ── Config ─────────────────────────────────────────────────────
const PARALLAX_RATE = 0.08     // 0 = fixed, 1 = scrolls with content
const VIGNETTE_SOLID = 0.92    // fraction of inscribed radius fully opaque
const MAX_ITERATIONS = 6       // hard ceiling on L-system depth
const MAX_OFFSCREEN_PX = 5120  // cap offscreen dimension (device px)

function GosperCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // ── Curve parameters ───────────────────────────────────────
    const stepMultiplier = 1
    const radiusRatio = 0.25
    const lineWidthMultiplier = 0.161
    const baseSpeed = 0.000003
    const initialDir = 64 * Math.random() * (Math.PI / 180)
    let lastBakeTime = 0

    // ── Reduced motion ─────────────────────────────────────────
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── L-system config ────────────────────────────────────────
    const productions = {
        'A': 'A-B--B+A++AA+B-',
        'B': '+A-BB--B-A++A+B',
    }
    const angle = 60 * (Math.PI / 180)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let offscreen: HTMLCanvasElement | null = null
        let logicalSize = 0
        let cachedN = 0
        let cachedResult = ''

        // ── Bake curve to offscreen texture ────────────────────
        function bakeTexture() {
            performance.mark('bake-start')
            const dpr = window.devicePixelRatio || 1
            const rect = canvas!.getBoundingClientRect()
            const w = rect.width
            const h = rect.height

            canvas!.width = w * dpr
            canvas!.height = h * dpr
            ctx!.scale(dpr, dpr)

            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
            const step = rootFontSize * stepMultiplier
            const lineWidth = rootFontSize * lineWidthMultiplier

            // ── Derive canvas size from inscribed-circle constraint ──
            // The vignette makes coverage a circle. For full parallax,
            // every viewport corner must stay inside that circle at
            // maximum scroll. The curve extent caps how large we can go.
            const diag = Math.sqrt(w * w + h * h)
            const curveExtent = step * Math.pow(7, MAX_ITERATIONS / 2)
            let size: number

            if (PARALLAX_RATE > 0) {
                const maxScroll = Math.max(
                    document.documentElement.scrollHeight - h, 0
                )
                const maxOffset = maxScroll * PARALLAX_RATE
                const effectiveR = Math.sqrt(
                    (w / 2) ** 2 + (h / 2 + maxOffset) ** 2
                )
                size = Math.ceil(
                    Math.min(2 * effectiveR / VIGNETTE_SOLID, curveExtent)
                )
            } else {
                size = Math.ceil(diag)
            }
            size = Math.max(size, Math.ceil(diag / VIGNETTE_SOLID))
            logicalSize = size

            // ── Derive iteration count ───────────────────────────
            const n = Math.max(
                3,
                Math.min(
                    MAX_ITERATIONS,
                    Math.ceil(2 * Math.log(size / step) / Math.log(7))
                )
            )

            if (n !== cachedN) {
                const lsys = new LSystem({ axiom: 'A', productions })
                cachedResult = lsys.iterate(n)
                cachedN = n
            }
            const result = cachedResult

            // first pass: bounding box with step=1
            let x = 0, y = 0, dir = initialDir
            let minX = 0, minY = 0, maxX = 0, maxY = 0

            for (const ch of result) {
                if (ch === 'A' || ch === 'B') {
                    x += Math.cos(dir)
                    y += Math.sin(dir)
                    minX = Math.min(minX, x)
                    minY = Math.min(minY, y)
                    maxX = Math.max(maxX, x)
                    maxY = Math.max(maxY, y)
                } else if (ch === '+') {
                    dir -= angle
                } else if (ch === '-') {
                    dir += angle
                }
            }

            const rawW = maxX - minX
            const rawH = maxY - minY

            const offsetX = size / 2 - (minX + rawW / 2) * step
            const offsetY = size / 2 - (minY + rawH / 2) * step

            // second pass: collect vertices
            x = 0; y = 0; dir = initialDir
            const points: { x: number; y: number; turnAhead: boolean }[] = []
            const chars = [...result]

            for (let i = 0; i < chars.length; i++) {
                const ch = chars[i]
                if (ch === 'A' || ch === 'B') {
                    let willTurn = false
                    for (let j = i + 1; j < chars.length; j++) {
                        if (chars[j] === '+' || chars[j] === '-') { willTurn = true; break }
                        if (chars[j] === 'A' || chars[j] === 'B') { break }
                    }
                    x += Math.cos(dir) * step
                    y += Math.sin(dir) * step
                    points.push({ x: x + offsetX, y: y + offsetY, turnAhead: willTurn })
                } else if (ch === '+') {
                    dir -= angle
                } else if (ch === '-') {
                    dir += angle
                }
            }

            // draw to offscreen canvas
            const offDpr = Math.min(dpr, MAX_OFFSCREEN_PX / size)
            offscreen = document.createElement('canvas')
            offscreen.width = Math.ceil(size * offDpr)
            offscreen.height = Math.ceil(size * offDpr)
            const offCtx = offscreen.getContext('2d')!
            offCtx.scale(offDpr, offDpr)

            offCtx.beginPath()
            offCtx.moveTo(points[0].x, points[0].y)
            const radius = step * radiusRatio

            for (let i = 1; i < points.length - 1; i++) {
                if (points[i].turnAhead) {
                    offCtx.arcTo(
                        points[i].x, points[i].y,
                        points[i + 1].x, points[i + 1].y,
                        radius
                    )
                } else {
                    offCtx.lineTo(points[i].x, points[i].y)
                }
            }
            offCtx.lineTo(points[points.length - 1].x, points[points.length - 1].y)

            const styles = getComputedStyle(canvas!)
            offCtx.strokeStyle = styles.getPropertyValue('--color-surface').trim()
            offCtx.lineWidth = lineWidth
            offCtx.lineJoin = 'round'
            offCtx.lineCap = 'round'
            offCtx.stroke()

            // Radial vignette: fade to transparent so coverage is a circle,
            // invariant under rotation. No hard square edge to sweep through.
            const inscribedR = size / 2
            const solidR = inscribedR * VIGNETTE_SOLID
            offCtx.globalCompositeOperation = 'destination-in'
            const grad = offCtx.createRadialGradient(
                size / 2, size / 2, solidR,
                size / 2, size / 2, inscribedR,
            )
            grad.addColorStop(0, 'rgba(255,255,255,1)')
            grad.addColorStop(1, 'rgba(255,255,255,0)')
            offCtx.fillStyle = grad
            offCtx.fillRect(0, 0, size, size)

            performance.mark('bake-end')
            performance.measure('Gosper bake', 'bake-start', 'bake-end')
            lastBakeTime = performance.getEntriesByName('Gosper bake').at(-1)!.duration
        }

        // ── Render ─────────────────────────────────────────────
        function render(rotation: number, scrollOffset: number = 0) {
            if (!offscreen || !logicalSize) return
            const dpr = window.devicePixelRatio || 1
            const rect = canvas!.getBoundingClientRect()
            const w = rect.width
            const h = rect.height
            const s = logicalSize

            // Vignette makes coverage a circle of radius effectiveR,
            // invariant under rotation. Clamp offset so every viewport
            // corner stays inside that circle.
            const effectiveR = s * VIGNETTE_SOLID / 2
            const halfW = w / 2
            const halfH = h / 2
            const maxOffset = effectiveR > halfW
                ? Math.max(Math.sqrt(effectiveR * effectiveR - halfW * halfW) - halfH, 0)
                : 0
            const clamped = Math.max(-maxOffset, Math.min(maxOffset, scrollOffset))

            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx!.clearRect(0, 0, w, h)

            ctx!.translate(w / 2, h / 2 - clamped)
            ctx!.rotate(rotation)
            ctx!.drawImage(offscreen, -s / 2, -s / 2, s, s)
            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        // ── Init ───────────────────────────────────────────────
        bakeTexture()

        // ── Animation loop ─────────────────────────────────────
        let animationId: number
        let currentDir = 0
        let lastTime = 0
        function animate(time: number) {
            const dt = time - lastTime
            lastTime = time
            currentDir += baseSpeed * dt
            render(currentDir, window.scrollY * PARALLAX_RATE)
            animationId = requestAnimationFrame(animate)
        }

        // ── Resize handling ────────────────────────────────────
        function debounce(fn: () => void, ms: number) {
            let timeout: number
            return () => {
                clearTimeout(timeout)
                timeout = window.setTimeout(fn, ms)
            }
        }

        const debouncedBake = debounce(() => {
            bakeTexture()
            if (prefersReducedMotion) render(0)
        }, 30)

        const observer = new ResizeObserver(() => {
            if (lastBakeTime < 10) {
                bakeTexture()
                if (prefersReducedMotion) render(0)
            } else {
                debouncedBake()
            }
        })
        observer.observe(canvas)

        // Rebake when content height changes (route navigation)
        const bodyObserver = new ResizeObserver(debouncedBake)
        bodyObserver.observe(document.body)

        // ── Start ──────────────────────────────────────────────
        if (prefersReducedMotion) {
            render(0)
        } else {
            animationId = requestAnimationFrame(animate)
        }

        return () => {
            cancelAnimationFrame(animationId)
            observer.disconnect()
            bodyObserver.disconnect()
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            role='img'
            aria-label='Animated Gosper curve background'
            id='gosper-bg'
            className='fixed inset-0 w-full h-full'
        />
    )
}

export default GosperCanvas
