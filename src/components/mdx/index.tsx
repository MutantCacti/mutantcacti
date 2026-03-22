import React from 'react'
import YouTube from './YouTube'
import Audio from './Audio'
import Credit from './Credit'
import Poem from './Poem'

export const mdxComponents = {
    YouTube,
    Audio,
    Credit,
    Poem,
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a {...props} target='_blank' rel='noopener noreferrer' />
    ),
}
