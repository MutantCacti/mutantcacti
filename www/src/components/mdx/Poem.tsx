import type { ReactNode, ReactElement } from 'react'

type PoemProps = {
    children: ReactNode
    lineHeight?: number
    letterSpacing?: number   // in em
    wordSpacing?: number     // in em
    stanzaGap?: string
}

export default function Poem({
    children,
    lineHeight = 2.1,
    letterSpacing = 0.04,
    wordSpacing = 0.03,
    stanzaGap = '1.5em',
}: PoemProps) {
    const raw = extractText(children).trim()
    const stanzas = raw.split(/\n{2,}/)

    return (
        <div
            className='not-prose text-sm sm:text-lg text-accent-subtle'
            style={{
                lineHeight,
                letterSpacing: `${letterSpacing}em`,
                wordSpacing: `${wordSpacing}em`,
            }}
        >
            {stanzas.map((stanza, i) => (
                <p key={i} style={{ marginBottom: i < stanzas.length - 1 ? stanzaGap : 0 }}>
                    {stanza.split('\n').map((line, j, arr) => (
                        <span key={j}>
                            {line}
                            {j < arr.length - 1 && <br />}
                        </span>
                    ))}
                </p>
            ))}
        </div>
    )
}

function extractText(node: ReactNode): string {
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (node == null || typeof node === 'boolean') return ''
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (typeof node === 'object' && 'props' in node) {
        const el = node as ReactElement<{ children?: ReactNode }>
        return extractText(el.props.children)
    }
    return ''
}
