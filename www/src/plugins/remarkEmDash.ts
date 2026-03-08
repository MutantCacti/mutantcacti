import { visit } from 'unist-util-visit'
import type { Root, Text } from 'mdast'

export default function remarkEmDash() {
    return (tree: Root) => {
        visit(tree, 'text', (node: Text) => {
            node.value = node.value.replace(/---/g, '\u2014')
        })
    }
}
