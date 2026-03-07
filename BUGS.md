# Known Bugs

## Mobile Overscroll Background Break

On mobile, scrolling to the top or bottom of the page temporarily overflows into the outside of the normal viewport, revealing a white background behind the gosper curve.

## Gallery videos no volume keybind

Youtube nocookie embeds scroll on [Up, Down]. The volume keybind is disabled. 

## MediaItem could be refactored out of GalleryModal.tsx

GalleryModal owns all navigation state, focus management (saves/restores document.activeElement), body scroll lock, keyboard/touch/wheel handling. ProjectCard tracks open boolean — no more previewIndex, refs, or handlers. MediaItem type is exported from GalleryModal for reuse.

## 