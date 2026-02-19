import { useRef, useEffect } from 'react'
import LSystem from 'lindenmayer'

function LSystemCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const iterations = 5
    const stepMultiplier = 1
    const radiusRatio = 0.25
    const lineWidthMultiplier = 0.2
    const baseSpeed = 0.000003
    const initialDir = 64 * Math.random() * (Math.PI / 180)
    const firstRender = useRef(true)

    // reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // generate the L-system string once
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

        function draw(initialDir: number) {
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const dpr = window.devicePixelRatio || 1
            const rect = canvas!.getBoundingClientRect()
            const w = rect.width
            const h = rect.height

            canvas!.width = w * dpr
            canvas!.height = h * dpr
            ctx.scale(dpr, dpr)

            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
            const step = rootFontSize * stepMultiplier
            const lineWidth = rootFontSize * lineWidthMultiplier

            performance.mark('draw-start')

            // first pass with step=1 to get raw bounding box
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

            const offsetX = w / 2 - (minX + rawW / 2) * step
            const offsetY = h / 2 - (minY + rawH / 2) * step

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

            // draw
            ctx.clearRect(0, 0, w, h)
            ctx.beginPath()
            ctx.moveTo(points[0].x, points[0].y)
            const radius = step * radiusRatio

            for (let i = 1; i < points.length - 1; i++) {
                if (points[i].turnAhead) {
                    ctx.arcTo(
                        points[i].x, points[i].y,
                        points[i + 1].x, points[i + 1].y,
                        radius
                    )
                } else {
                    ctx.lineTo(points[i].x, points[i].y)
                }
            }
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)

            const styles = getComputedStyle(canvas)
            ctx.strokeStyle = styles.getPropertyValue('--color-surface').trim()
            ctx.lineWidth = lineWidth
            ctx.lineJoin = 'round'
            ctx.lineCap = 'round'
            ctx.stroke()

            performance.mark('draw-end')
            performance.measure('L-system draw', 'draw-start', 'draw-end')
            if (firstRender.current) {
                console.log('Gosper curve: draw in ' + performance.getEntriesByName('L-system draw')[0].duration + 'ms')
                firstRender.current = false
            }
        }
        
        // animation variables
        let animationId: number
        let currentDir = initialDir
        let lastTime = 0

        function animate(time: number) {
            const dt = time - lastTime
            lastTime = time
            currentDir += baseSpeed * dt
            draw(currentDir)
            animationId = requestAnimationFrame(animate)
        }

        let observer

        if (prefersReducedMotion) {
            observer = new ResizeObserver(() => draw(currentDir))
            observer.observe(canvas)
        } else {
            observer = new ResizeObserver(() => {})
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
            className="absolute inset-0 w-full h-full"
        />
    )
}

export default LSystemCanvas
