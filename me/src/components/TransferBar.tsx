import { useEffect, useRef } from 'react'
import TextInput from './TextInput'
import PasteButton from './PasteButton'
import UploadButton from './UploadButton'
import DownloadButton from './DownloadButton'
import useTransferStore from '../stores/TransferStore'

// Generated parametrically: r(t) = R/3 + 2R/3 * t², θ(t) = 2πt
// Quadratic expansion gives 90° angle at junction (dr/dθ = 0 at start)
const LOGO_PATH = "M 28.00,16.00 L 27.93,17.25 L 27.74,18.49 L 27.41,19.71 L 26.96,20.88 L 26.39,22.00 L 25.71,23.05 L 24.92,24.03 L 24.03,24.92 L 23.05,25.71 L 22.00,26.39 L 20.88,26.96 L 19.71,27.41 L 18.49,27.74 L 17.25,27.93 L 16.00,28.00 L 14.75,27.93 L 13.51,27.74 L 12.29,27.41 L 11.12,26.96 L 10.00,26.39 L 8.95,25.71 L 7.97,24.92 L 7.08,24.03 L 6.29,23.05 L 5.61,22.00 L 5.04,20.88 L 4.59,19.71 L 4.26,18.49 L 4.07,17.25 L 4.00,16.00 L 4.07,14.75 L 4.26,13.51 L 4.59,12.29 L 5.04,11.12 L 5.61,10.00 L 6.29,8.95 L 7.08,7.97 L 7.97,7.08 L 8.95,6.29 L 10.00,5.61 L 11.12,5.04 L 12.29,4.59 L 13.51,4.26 L 14.75,4.07 L 16.00,4.00 L 17.25,4.07 L 18.49,4.26 L 19.71,4.59 L 20.88,5.04 L 22.00,5.61 L 23.05,6.29 L 24.03,7.08 L 24.92,7.97 L 25.71,8.95 L 26.39,10.00 L 26.96,11.12 L 27.41,12.29 L 27.74,13.51 L 27.93,14.75 L 28.00,16.00 L 20.00,16.00 L 20.00,15.88 L 19.98,15.57 L 19.94,15.26 L 19.87,14.95 L 19.79,14.65 L 19.68,14.35 L 19.55,14.06 L 19.40,13.78 L 19.24,13.51 L 19.05,13.25 L 18.84,13.01 L 18.61,12.78 L 18.37,12.56 L 18.11,12.36 L 17.83,12.17 L 17.54,12.01 L 17.24,11.86 L 16.92,11.74 L 16.59,11.63 L 16.25,11.56 L 15.90,11.50 L 15.54,11.47 L 15.18,11.47 L 14.82,11.49 L 14.45,11.54 L 14.08,11.62 L 13.71,11.73 L 13.35,11.86 L 13.00,12.03 L 12.65,12.22 L 12.31,12.44 L 11.98,12.69 L 11.67,12.97 L 11.38,13.28 L 11.11,13.61 L 10.86,13.97 L 10.63,14.35 L 10.43,14.75 L 10.25,15.18 L 10.11,15.62 L 10.00,16.09 L 9.92,16.56 L 9.89,17.05 L 9.88,17.56 L 9.92,18.06 L 10.00,18.58 L 10.12,19.09 L 10.28,19.60 L 10.48,20.11 L 10.73,20.61 L 11.02,21.09 L 11.35,21.56 L 11.72,22.01 L 12.14,22.44 L 12.59,22.84 L 13.08,23.21 L 13.62,23.55 L 14.18,23.85 L 14.78,24.11 L 15.40,24.33 L 16.06,24.50 L 16.73,24.62 L 17.43,24.69 L 18.14,24.70 L 18.86,24.66 L 19.59,24.56 L 20.33,24.40 L 21.05,24.17 L 21.78,23.89 L 22.49,23.55 L 23.18,23.14 L 23.85,22.67 L 24.49,22.14 L 25.10,21.55 L 25.67,20.91 L 26.20,20.21 L 26.67,19.46 L 27.10,18.66 L 27.46,17.82 L 27.76,16.93 L 28.00,16.01 Z"

const LOGO_MASK = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='${LOGO_PATH}' fill='black'/></svg>`
)}")`

const SPEED_MAX = 240    // deg/s at full speed
const RAMP_UP = 0.4      // seconds to reach full speed
const RAMP_DOWN = 0.8    // seconds to coast to stop

function MeLogo({ className, fill, glow }: { className?: string; fill: string; glow?: boolean }) {
    const ref = useRef<HTMLDivElement>(null)
    const state = useRef({ angle: 0, t: 0, last: 0 })

    useEffect(() => {
        const s = state.current
        s.last = 0
        let raf: number
        function tick(now: number) {
            const dt = s.last ? (now - s.last) / 1000 : 0
            s.last = now

            if (glow) {
                s.t = Math.min(s.t + dt / RAMP_UP, 1)
            } else {
                s.t = Math.max(s.t - dt / RAMP_DOWN, 0)
            }

            const speed = SPEED_MAX * Math.sin(s.t * Math.PI / 2)
            s.angle = (s.angle + speed * dt) % 360
            if (ref.current) {
                ref.current.style.transform = `rotate(${s.angle}deg)`
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [glow])

    return (
        <div
            ref={ref}
            className={`${glow ? 'logo-glow' : ''} ${className ?? ''}`}
            style={{
                maskImage: LOGO_MASK,
                WebkitMaskImage: LOGO_MASK,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                backgroundColor: glow ? undefined : fill,
                transition: 'background-color 0.3s ease',
            }}
        />
    )
}

export default function TransferBar() {
    const { fetch, activity, statusText, selected } = useTransferStore()
    const loading = !!activity

    const statusLabel = activity || (selected.length > 0 ? `${selected.length} selected` : statusText)

    return (
        <>
            {/* Desktop */}
            <div className="hidden sm:inline-flex items-center gap-3 select-none">
                <div className="inline-flex items-center gap-2 px-1 py-1 rounded-xl
                                bg-surface border border-border/30"
                     style={{ boxShadow: '0 0 20px 8px rgba(0, 0, 0, 0.2)' }}>
                    <TextInput />
                    <UploadButton />
                    <DownloadButton />
                </div>
                <div className={`inline-flex items-center gap-3 transition-opacity ${loading ? 'opacity-90' : 'opacity-60 hover:opacity-90'}`}>
                    <button
                        onClick={() => fetch()}
                        className="cursor-pointer transition-all rounded-full hover-glow p-1 hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
                        title="Refresh"
                    >
                        <MeLogo
                            className="h-8 w-8"
                            fill="var(--color-accent)"
                            glow={loading}
                        />
                    </button>
                    <span className="text-xs text-accent whitespace-nowrap">
                        {statusLabel}
                    </span>
                </div>
            </div>

            {/* Mobile */}
            <div className="sm:hidden flex flex-col items-center gap-3 select-none">
                <div className={`inline-flex items-center gap-3 transition-opacity ${loading ? 'opacity-90' : 'opacity-60 hover:opacity-90'}`}>
                    <button
                        onClick={() => fetch()}
                        className="cursor-pointer transition-all rounded-full hover-glow p-1"
                        title="Refresh"
                    >
                        <MeLogo
                            className="h-10 w-10"
                            fill="var(--color-accent)"
                            glow={loading}
                        />
                    </button>
                    <span className="text-xs text-accent whitespace-nowrap">
                        {statusLabel}
                    </span>
                </div>
                <div className="inline-flex items-center gap-2 px-1 py-1 rounded-xl
                                bg-surface border border-border/30"
                     style={{ boxShadow: '0 0 20px 8px rgba(0, 0, 0, 0.2)' }}>
                    <PasteButton />
                    <UploadButton />
                    <DownloadButton />
                </div>
            </div>
        </>
    )
}
