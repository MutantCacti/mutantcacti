import { useRef } from 'react'
import type { ReactNode, HTMLAttributes } from 'react'

type TiltableProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode
    maxAngle?: number
    perspective?: number
}

export default function Tiltable({ children, maxAngle = 15, perspective = 600, className, style, ...rest }: TiltableProps) {
    const innerRef = useRef<HTMLDivElement>(null)
    const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    function handleMove(e: React.MouseEvent) {
        const el = innerRef.current
        if (!el || reducedMotion.current) return
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        el.style.transition = 'none'
        el.style.transform = `rotateX(${-y * maxAngle}deg) rotateY(${x * maxAngle}deg)`
    }

    function handleLeave() {
        const el = innerRef.current
        if (!el) return
        el.style.transition = 'transform 0.3s ease-out'
        el.style.transform = ''
    }

    return (
        <div
            className={className}
            style={{ perspective: `${perspective}px`, ...style }}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            {...rest}
        >
            <div ref={innerRef} className="w-full h-full">
                {children}
            </div>
        </div>
    )
}
