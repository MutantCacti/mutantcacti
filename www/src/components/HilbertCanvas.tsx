import { useRef, useEffect } from 'react'
import LSystem from 'lindenmayer'

type HilbertCanvasProps = {
    className?: string
    rotation?: number
    iterations?: number
    strokeMultiplier?: number
}

const GRADIENT_BANDS = [
    { h: 230, s: 40, l: 20, aScale: 0.6,                           // deep indigo — shadow, tension
      pos: (t: number) => 0.95 + 0.04 * Math.sin(t * 0.15),
      spread: (t: number) => 0.55 + 0.15 * Math.sin(t * 0.4),
      xPos: (t: number) => 0.05 * Math.sin(t * 0.1) },
    { h: 170, s: 40, l: 28, aScale: 1.4,                           // deep teal — bridge to site accent
      pos: (t: number) => 0.66 + 0.06 * Math.sin(t * 0.19 + 1),
      spread: (t: number) => 0.65 + 0.2 * Math.sin(t * 0.6 + 1),
      xPos: (t: number) => 0.05 * Math.sin(t * 0.14 + 1) },
    { h: 35, s: 55, l: 38, aScale: 0.8,                            // amber — thin warmth
      pos: (t: number) => 0.33 + 0.08 * Math.sin(t * 0.12 + 2.5),
      spread: (t: number) => 0.5 + 0.35 * Math.sin(t * 0.3 + 2.5),
      xPos: (t: number) => -0.3 + 0.1 * Math.sin(t * 0.18 + 2) },
    { h: 48, s: 42, l: 42, aScale: 1.2,                            // gold — emergence
      pos: (t: number) => 0.05 + 0.04 * Math.sin(t * 0.22 + 4),
      spread: (t: number) => 0.28 + 0.14 * Math.sin(t * 0.8 + 4),
      xPos: (t: number) => -0.3 + 0.12 * Math.sin(t * 0.25 + 3.5) },
]

function generateNoise(): HTMLCanvasElement {
    const size = 128
    const c = document.createElement('canvas')
    c.width = size
    c.height = size
    const ctx = c.getContext('2d')!
    const img = ctx.createImageData(size, size)
    for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255
        img.data[i] = v
        img.data[i + 1] = v
        img.data[i + 2] = v
        img.data[i + 3] = 25
    }
    ctx.putImageData(img, 0, 0)
    return c
}

const GRADIENT_PACE = 10
const GRADIENT_PACE_HOVER = 25

function drawGradients(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, alpha: number) {
    // saturation breathes on a slow sine — the whole field intensifies and retreats
    const breathe = 0.85 + 0.15 * Math.sin(time * 0.7)

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0; i < GRADIENT_BANDS.length; i++) {
        const band = GRADIENT_BANDS[i]
        const centerY = h * (1 - band.pos(time))
        const spread = h * 0.5 * band.spread(time)

        // slight tilt per band + horizontal drift
        const xShift = w * ((i - 1.5) * 0.12 + band.xPos(time))
        const grad = ctx.createLinearGradient(
            xShift, centerY - spread,
            w - xShift, centerY + spread
        )

        const sat = band.s * breathe
        const a = Math.min(alpha * band.aScale, 1)
        grad.addColorStop(0, `hsla(${band.h}, ${sat}%, ${band.l}%, 0)`)
        grad.addColorStop(0.5, `hsla(${band.h}, ${sat}%, ${band.l}%, ${a})`)
        grad.addColorStop(1, `hsla(${band.h}, ${sat}%, ${band.l}%, 0)`)

        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
    }

    ctx.restore()
}

export default function HilbertCanvas({ className, rotation = 0, iterations = 6, strokeMultiplier = 0.1 }: HilbertCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const radiusRatio = 0.25
        const angle = 90 * (Math.PI / 180)
        const rotRad = rotation * (Math.PI / 180)
        const leadInDir = rotRad + angle // start 90° CCW so F+ restores to rotRad

        const lsys = new LSystem({
            axiom: 'A',
            productions: {
                'A': '-BF+AFA+FB-',
                'B': '+AF-BFB-FA+',
            },
        })
        // strip A/B markers and collapse cancelling turn pairs (+-/-+)
        let result = lsys.iterate(iterations).replace(/[AB]/g, '')
        let prev = ''
        while (result !== prev) {
            prev = result
            result = result.replace(/\+-|-\+/g, '')
        }

        // bounding box with step=1 (excludes lead-in)
        let bx = 0, by = 0, bd = rotRad
        let minX = 0, minY = 0, maxX = 0, maxY = 0
        for (const ch of result) {
            if (ch === 'F') {
                bx += Math.cos(bd)
                by += Math.sin(bd)
                minX = Math.min(minX, bx)
                minY = Math.min(minY, by)
                maxX = Math.max(maxX, bx)
                maxY = Math.max(maxY, by)
            } else if (ch === '+') {
                bd -= angle
            } else if (ch === '-') {
                bd += angle
            }
        }
        const rawW = maxX - minX
        const rawH = maxY - minY
        if (rawW === 0 || rawH === 0) return

        // lead-in: start one step perpendicular, walk into curve start
        result = 'F+' + result

        let tile: HTMLCanvasElement | null = null
        let tileSize = 0
        let tileStride = 0
        let outset = 0
        let animId = 0
        let scratch: HTMLCanvasElement | null = null
        let scratchCtx: CanvasRenderingContext2D | null = null
        let gradBuf: HTMLCanvasElement | null = null
        let gradBufCtx: CanvasRenderingContext2D | null = null
        let noiseBuf: HTMLCanvasElement | null = null
        let dpr = 1
        let canvasW = 0
        let canvasH = 0
        let grainAlpha = 0.08
        const noiseCanvas = generateNoise()

        function bakeTile() {
            dpr = window.devicePixelRatio || 1
            grainAlpha = parseFloat(getComputedStyle(canvas!).getPropertyValue('--grain-opacity')) || 0.08
            canvasW = canvas!.offsetWidth
            canvasH = canvas!.offsetHeight
            if (canvasW === 0 || canvasH === 0) return

            canvas!.width = canvasW * dpr
            canvas!.height = canvasH * dpr

            // square tile sized to canvas width, outset by stroke width
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
            const lineWidth = rootFontSize * strokeMultiplier
            outset = lineWidth / 2
            tileSize = canvasW + lineWidth
            const step = Math.min(canvasW / rawW, canvasW / rawH)
            tileStride = canvasW + step
            const leadOffX = Math.cos(leadInDir) * step
            const leadOffY = Math.sin(leadInDir) * step
            const ox = outset + canvasW / 2 - (minX + rawW / 2) * step - leadOffX
            const oy = outset + canvasW / 2 - (minY + rawH / 2) * step - leadOffY

            // collect vertices
            let x = 0, y = 0, dir = leadInDir
            const points: { x: number; y: number; turnAhead: boolean }[] = []
            const chars = [...result]
            for (let i = 0; i < chars.length; i++) {
                const ch = chars[i]
                if (ch === 'F') {
                    let willTurn = false
                    for (let j = i + 1; j < chars.length; j++) {
                        if (chars[j] === '+' || chars[j] === '-') { willTurn = true; break }
                        if (chars[j] === 'F') { break }
                    }
                    x += Math.cos(dir) * step
                    y += Math.sin(dir) * step
                    points.push({ x: x + ox, y: y + oy, turnAhead: willTurn })
                } else if (ch === '+') {
                    dir -= angle
                } else if (ch === '-') {
                    dir += angle
                }
            }
            if (points.length === 0) return

            // render curve to offscreen tile (white stroke for alpha mask)
            tile = document.createElement('canvas')
            tile.width = tileSize * dpr
            tile.height = tileSize * dpr
            const tctx = tile.getContext('2d')!
            tctx.scale(dpr, dpr)

            tctx.beginPath()
            tctx.moveTo(points[0].x, points[0].y)
            const radius = step * radiusRatio
            for (let i = 1; i < points.length - 1; i++) {
                if (points[i].turnAhead) {
                    tctx.arcTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, radius)
                } else {
                    tctx.lineTo(points[i].x, points[i].y)
                }
            }
            tctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)

            tctx.strokeStyle = '#fff'
            tctx.lineWidth = lineWidth
            tctx.lineJoin = 'round'
            tctx.lineCap = 'round'
            tctx.stroke()

            // create/resize offscreen buffers
            scratch = document.createElement('canvas')
            scratch.width = canvasW * dpr
            scratch.height = canvasH * dpr
            scratchCtx = scratch.getContext('2d')!

            gradBuf = document.createElement('canvas')
            gradBuf.width = canvasW * dpr
            gradBuf.height = canvasH * dpr
            gradBufCtx = gradBuf.getContext('2d')!

            // pre-bake full-size noise overlay (no DPR — grain doesn't need retina)
            noiseBuf = document.createElement('canvas')
            noiseBuf.width = canvasW
            noiseBuf.height = canvasH
            const noiseCtx = noiseBuf.getContext('2d')!
            for (let nx = 0; nx < canvasW; nx += 128) {
                for (let ny = 0; ny < canvasH; ny += 128) {
                    noiseCtx.drawImage(noiseCanvas, nx, ny)
                }
            }
        }

        let scrollOffset = 0
        let scrollVelocity = 0
        let gradientTime = 0
        let lastTime = performance.now()

        const baseForce = 0.00002
        const hoverForce = 0.00012
        const drag = 0.003
        const card = canvas.closest('.overflow-hidden') ?? canvas
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

        // hover state via events instead of per-frame :hover polling
        let hovering = false
        function onMouseEnter() { hovering = true }
        function onMouseLeave() { hovering = false }
        card.addEventListener('mouseenter', onMouseEnter)
        card.addEventListener('mouseleave', onMouseLeave)

        // pause animation when off-screen
        let visible = true
        const visObserver = new IntersectionObserver(
            ([entry]) => {
                const wasVisible = visible
                visible = entry.isIntersecting
                if (visible && !wasVisible) {
                    // reset timing to avoid dt spike on resume
                    lastTime = performance.now()
                }
            },
            { threshold: 0 }
        )
        visObserver.observe(canvas)

        function animate() {
            animId = requestAnimationFrame(animate)

            if (!visible || !tile || tileSize === 0 || !scratch || !scratchCtx || !gradBuf || !gradBufCtx || !noiseBuf) return

            const now = performance.now()
            const dt = now - lastTime
            lastTime = now

            const prefersReduced = reducedMotion.matches
            if (!prefersReduced) {
                const force = hovering ? hoverForce : baseForce
                scrollVelocity += force * dt
                scrollVelocity *= (1 - drag * dt)
            }
            scrollOffset = (scrollOffset + scrollVelocity * dt) % tileStride

            const pace = hovering ? GRADIENT_PACE_HOVER : GRADIENT_PACE
            gradientTime += dt * 0.0001 * pace

            // use cached canvasW/canvasH instead of offsetWidth/offsetHeight
            const w = canvasW
            const h = canvasH
            const rows = Math.ceil(h / tileStride) + 2

            // 0. Draw gradients once to gradBuf at curve alpha
            gradBufCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
            gradBufCtx.clearRect(0, 0, w, h)
            drawGradients(gradBufCtx, w, h, gradientTime, 0.75)

            // 1. Blit gradients to scratch (full opacity — curve intensity)
            scratchCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
            scratchCtx.clearRect(0, 0, w, h)
            scratchCtx.drawImage(gradBuf, 0, 0, gradBuf.width, gradBuf.height, 0, 0, w, h)

            // 2. Build combined mask on main canvas (temporary)
            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx!.clearRect(0, 0, w, h)
            for (let row = -1; row < rows; row++) {
                ctx!.drawImage(tile,
                    0, 0, tile.width, tile.height,
                    -outset, row * tileStride - scrollOffset - outset, tileSize, tileSize
                )
            }

            // 3. Single destination-in with the combined mask
            scratchCtx.globalCompositeOperation = 'destination-in'
            scratchCtx.setTransform(1, 0, 0, 1, 0, 0)
            scratchCtx.drawImage(canvas!, 0, 0)
            scratchCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
            scratchCtx.globalCompositeOperation = 'source-over'

            // 4. Clear main canvas and draw background (gradBuf at reduced alpha)
            ctx!.clearRect(0, 0, w, h)
            ctx!.globalAlpha = 0.4
            ctx!.drawImage(gradBuf, 0, 0, gradBuf.width, gradBuf.height, 0, 0, w, h)
            ctx!.globalAlpha = 1.0

            // 5. Composite scratch onto main canvas
            ctx!.drawImage(scratch, 0, 0, scratch.width, scratch.height, 0, 0, w, h)

            // 6. Grain overlay (single pre-baked image)
            ctx!.save()
            ctx!.globalCompositeOperation = 'overlay'
            ctx!.globalAlpha = grainAlpha
            ctx!.drawImage(noiseBuf, 0, 0, w, h)
            ctx!.restore()
        }

        bakeTile()
        animId = requestAnimationFrame(animate)

        const observer = new ResizeObserver(() => bakeTile())
        observer.observe(canvas)

        return () => {
            cancelAnimationFrame(animId)
            observer.disconnect()
            visObserver.disconnect()
            card.removeEventListener('mouseenter', onMouseEnter)
            card.removeEventListener('mouseleave', onMouseLeave)
        }
    }, [])

    return <canvas ref={canvasRef} className={`hilbert ${className ?? ''}`} />
}
