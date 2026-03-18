export type MediaItem =
    | { type: 'image'; src: string; alt: string; credit?: string }
    | { type: 'video'; youtubeId: string; title: string; alt: string; credit?: string; footnote?: string }
