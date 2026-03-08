import { useRef, useEffect } from 'react'
import LSystem from 'lindenmayer'

// ── Config ─────────────────────────────────────────────────────
const PARALLAX_RATE = 0.08 // 0 = fixed, 1 = scrolls with content

function GosperCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // ── Curve parameters ───────────────────────────────────────
    const iterations = 6
    const stepMultiplier = 1
    const radiusRatio = 0.25
    const lineWidthMultiplier = 0.161
    const baseSpeed = 0.000003
    const initialDir = 64 * Math.random() * (Math.PI / 180)
    let lastBakeTime = 0

    // ── Reduced motion ─────────────────────────────────────────
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── L-system generation ────────────────────────────────────
    const lsys = new LSystem({
        axiom: 'A',
        productions: {
            'A': 'A-B--B+A++AA+B-',
            'B': '+A-BB--B-A++A+B',
        },
    })
    const result = lsys.iterate(iterations)
    const angle = 60 * (Math.PI / 180)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let offscreen: HTMLCanvasElement | null = null

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

            // offscreen must cover the visible area at any rotation
            const diag = Math.ceil(Math.sqrt(w * w + h * h))
            const size = PARALLAX_RATE > 0 ? Math.ceil(diag * 1.4) : diag

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
            offscreen = document.createElement('canvas')
            offscreen.width = size * dpr
            offscreen.height = size * dpr
            const offCtx = offscreen.getContext('2d')!
            offCtx.scale(dpr, dpr)

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

            performance.mark('bake-end')
            performance.measure('Gosper bake', 'bake-start', 'bake-end')
            lastBakeTime = performance.getEntriesByName('Gosper bake').at(-1)!.duration
        }

        // ── Render ─────────────────────────────────────────────
        function render(rotation: number, scrollOffset: number = 0) {
            if (!offscreen) return
            const dpr = window.devicePixelRatio || 1
            const rect = canvas!.getBoundingClientRect()
            const w = rect.width
            const h = rect.height
            const s = offscreen.width / dpr

            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx!.clearRect(0, 0, w, h)

            ctx!.translate(w / 2, h / 2 - scrollOffset)
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

        // ── Start ──────────────────────────────────────────────
        if (prefersReducedMotion) {
            render(0)
        } else {
            animationId = requestAnimationFrame(animate)
        }

        return () => {
            cancelAnimationFrame(animationId)
            observer.disconnect()
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
