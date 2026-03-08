# v1.0 Release Requirements

## Content
- [ ] At least 1 post in Essays
- [x] At least 3 posts in Poetry
- [ ] At least 3 posts in Music

## Bug Fixes
- [x] Mobile overscroll background break (background-color on html element)
- [x] Music canvas has rectangular pixels on mobile (RENDER_SCALE applied to both axes)
- [x] Gallery videos no volume keybind (native YouTube embed, close button, suppress nav during video)
- [X] Clicking and dragging BlogPosts does the same thing
- [x] Clicking and dragging Tiltables in Blog triggers pickup/drag animation (onDragStart preventDefault)
- [x] MandelbrotCanvas green tint (green suppression post-processing)
- [x] HilbertCanvas green tint (band hue 170 → 200)

## Refactor
- [x] Extract MediaItem type out of GalleryModal.tsx

## Add
- [x] Rotation prop for MandelbrotCanvas
- [x] Saturation bands rotate with MandelbrotCanvas rotation
- [x] MandelbrotCanvas hover detects parent container
- [x] Basic default SEO meta tags
- [x] 404 page
- [x] Feedback link above copyright in Layout (mailto)
- [x] MDX links open in new tab (a override in mdxComponents)

## Testing
- [x] Accessibility code review
- [ ] Mobile audit
- [ ] Keyboard audit
- [ ] Screen reader audit

## Post-release
- Blog canvas performance audits
- Make mobile Blog canvasses nicer
- CRT rendering for MandelbrotCanvas (see TODO.md)
- Significantly more Blog posts
