## CRT Rendering the MandelbrotCanvas

![A side by side comparison of the top of Princess Peach's blond, crowned head in a normal point-filtered pixel style and a CRT monitor emulation style](design/rpg_compare.png)

For the Music category card on Blog.

## Add an <Image/> MDX component for posts

## Make Audio stateful in Layout/NavBar so that navigating around the site keeps tracks playing.

## Find the original notebook with Video and get the more accurate date

## Implement lightweight data collection for A/B testing

Build a simple analytics/event system that can track user interactions for A/B experiments. First candidate: whether a back-to-category link on Blog:category pages (redundant with nav) improves navigation UX or just adds clutter. Needs: event logging, variant assignment, and a way to review results.

## Firefox mobile: Projects page freezes on scroll

IntersectionObserver and decoding="async" helped but didn't fully resolve. Firefox decodes images on the main thread during scroll. May need to downscale images for mobile or explore will-change/content-visibility once browser support improves.

## Chrome mobile: Blog canvas FPS drop on scroll

Minor frame drops when scrolling past Hilbert/Mandelbrot/Caustic category card canvases. Not severe but noticeable on high-refresh-rate devices.

## Scale properly to 500% zoom

## Add fr-fr ? translation

## Add comments to the blog

Making the backend should be taken seriously and paired with future ideas like A/B testing to ensure extensibility.

## Add upvotes to the blog

For example prompt at the bottom of the blog: "Did you like this post? Please give it a vote to help sort the blog better for other visitors."

## Full project pages

Content heavy addition--add full pages with description, reflection, technical details of projects in Projects.

## Add [Dragon Attack](https://scratch.mit.edu/projects/142487281) scratch post 

## Ask for feedback

- Should the back link on Blog:category be there?
- Should the Blog Canvasses have alt texts?
- Should gallery thumbnails use <button>s with `aria-current`, or a `role="listbox"` with `role="option"` buttons and `aria-selected`
- Is the screen reader pattern in GalleryModal accessible? How can it be better?
