# TWO HIIGH: scroll animations

Two scroll animations that sit one after the other on the page. They're plain HTML, CSS and JS with **no libraries and no Shopify**, so they work on any website. All text uses the site font, **Boogaloo**.

1. **Jacket Collection carousel** (`jacket-carousel/`): the model sits in the middle and each scroll step swaps to the next jacket (01 → 05). After Jacket 05, the page scrolls on normally.
2. **Jacket zip** (`toohigh-scroll/`): it starts with the jacket closed and **TWO HIIGH** showing on black. Scrolling down opens the jacket to reveal the video and the tagline "No fixed direction. Just your own." Scrolling up closes it again.

Each section stays pinned on screen while it plays: about 5 screen-heights of scrolling for the carousel and 5 for the jacket zip.

## Files

```
jacket-carousel/           ← animation 1
  jacket-carousel.css
  jacket-carousel.js
  section.html             ← HTML to paste into your page
  assets/  model.webp, jacket1–5.webp
toohigh-scroll/            ← animation 2
  toohigh-scroll.css
  toohigh-scroll.js
  section.html             ← HTML to paste into your page
  assets/  hero.mp4, hero-poster.jpg, left.webp, right.webp
index.html                 ← demo page with both, plus the site nav
```

## Adding them to your website

1. Copy both folders into your website project, next to the page that gets the animations.
2. Add these to that page:

**In `<head>`:**
```html
<link href="https://fonts.googleapis.com/css2?family=Boogaloo&display=swap" rel="stylesheet">
<link rel="stylesheet" href="jacket-carousel/jacket-carousel.css">
<link rel="stylesheet" href="toohigh-scroll/toohigh-scroll.css">
```

**In the body:** paste `jacket-carousel/section.html`, then `toohigh-scroll/section.html` right below it.

**Just before `</body>`:**
```html
<script src="jacket-carousel/jacket-carousel.js"></script>
<script src="toohigh-scroll/toohigh-scroll.js"></script>
```

If the folders end up somewhere else (for example `/assets/`), change these paths and the `src=` paths in the pasted HTML to match.

### If your site is built with…

- **WordPress:** upload the folders to your theme (or the Media Library). Paste each section into a *Custom HTML* block and add the CSS/JS links in the theme header and footer, or with a plugin like *WPCode*. Use the full URLs of the uploaded files in the `src=` attributes.
- **Webflow / Wix / Framer:** upload the images and video to the site's assets. Paste each section into an *Embed* element and replace the `src=` paths with the asset URLs. Put the CSS inside `<style>…</style>` in the page's head code, and the JS inside `<script>…</script>` in its footer code.
- **React / Next.js:** put both `assets/` folders under `public/`, import the CSS, render each section's markup as JSX (`class` → `className`), and load the JS once after mount, for example with `<Script src="…" />` in Next.js.

## Customising

| Want to change | Where |
|---|---|
| Big word in the jacket zip | `<h2 class="th-scroll__brand">TWO HIIGH</h2>` |
| Jacket-zip tagline | `<p class="th-scroll__tagline">…</p>` |
| Jacket-zip speed | `--th-length: 600vh;` in `toohigh-scroll.css` (bigger = slower) |
| Carousel scroll length | `--jc-length: 600vh;` in `jacket-carousel.css` |
| Header height the carousel leaves room for | `--jc-top: 64px;` in `jacket-carousel.css` |
| Header height the jacket zip pins below | `--th-top: 64px;` in `toohigh-scroll.css` (56px on phones and tablets; set both to `0` if your site has no fixed header) |
| Font | `--th-font` in `toohigh-scroll.css` and `font-family` on `.jc` in `jacket-carousel.css` |
| When each jacket-zip step happens | the `T = { … }` timeline at the top of `toohigh-scroll.js` |
| How tightly the hands close | `gap = W * 0.14 …` in `toohigh-scroll.js` (smaller number = tighter) |
| Smoothness | `SMOOTHING` at the top of either JS file (lower = floatier) |

## Common problems

- **A section doesn't stick or pin:** a parent element probably has `overflow: hidden` or `overflow: auto`, which breaks `position: sticky`. Remove it from the section's parent elements.
- **The video doesn't autoplay on iPhone:** keep the `muted` and `playsinline` attributes.
- **Images or video don't show:** a path is wrong. Open the browser's DevTools (F12) → *Console* and look for 404 errors.
- **Testing locally:** opening `index.html` by double-clicking works. If the video doesn't load, run a small local server in the folder instead:

```bash
python -m http.server 5173
```
