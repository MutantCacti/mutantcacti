import type { ReactNode, HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode
}

export default function Card({ children, className, ...rest }: CardProps) {
    return (
        <div
            className={`bg-bg/90 backdrop-blur-[6px] border border-border rounded-lg p-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 ${className ?? ''}`}
            {...rest}
        >
            {children}
        </div>
    )
}
