import React from 'react'
import YouTube from './YouTube'
import Credit from './Credit'
import Poem from './Poem'

export const mdxComponents = {
    YouTube,
    Credit,
    Poem,
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a {...props} target='_blank' rel='noopener noreferrer' />
    ),
}
