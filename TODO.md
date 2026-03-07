## MediaItem could be refactored out of GalleryModal.tsx

GalleryModal owns all navigation state, focus management (saves/restores document.activeElement), body scroll lock, keyboard/touch/wheel handling. ProjectCard tracks open boolean — no more previewIndex, refs, or handlers. MediaItem type is exported from GalleryModal for reuse.


## CRT Rendering the MandelbrotCanvas

![A side by side comparison of the top of Princess Peach's blond, crowned head in a normal point-filtered pixel style and a CRT monitor emulation style](design/rpg_compare.png)

For the Music category card on Blog.

## Add alt text to MDX Youtube components

## Add credit to BlogPosts

## Write a music player component.

This should be made stateful in Layout so that navigating around the site keeps tracks playing.

## Find the original notebook with Video and get the more accurate date

## Add a back to blog link to the top of BlogPosts that don't go to the main blog page but to the blog:category they came from.

## Add a "Recent Posts" section below the category cards in Blog

## Make the gradient around titles of the Blog:category header banners larger

## Add a heading to the non-featured posts in Profile

Use <h2 className='text-text text-xl mb-4'>Solo Projects</h2>

## Implement lightweight data collection for A/B testing

Build a simple analytics/event system that can track user interactions for A/B experiments. First candidate: whether a back-to-category link on Blog:category pages (redundant with nav) improves navigation UX or just adds clutter. Needs: event logging, variant assignment, and a way to review results.

## Update the Gallery play SVG to be more equilateral

## Make gallery footnotes look better

## Scale properly to 500% zoom
