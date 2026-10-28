# TOO HIGH: scroll "jacket zip" animation

Plain HTML, CSS and JS with **no libraries and no Shopify**. It works on any website.

## What it does (scrolling down opens the jacket, scrolling up closes it)

1. At the top, the jacket is closed: the hands nearly meet and **TWO HIIGH** shows through the gap on black.
2. As you scroll down, the hands pull apart and the black fades away to reveal the video.
3. **TWO HIIGH** fades out and the jacket halves slide off the sides.
4. The video plays with the tagline "No fixed direction. Just your own."

The section stays pinned on screen for about 4 screen-heights of scrolling, then the page carries on.

## Files

```
toohigh-scroll/            ← copy this whole folder to your website
  toohigh-scroll.css
  toohigh-scroll.js
  section.html             ← the HTML to paste into your page
  assets/
    hero.mp4               (your video, web-optimised: 2.8 MB, no audio)
    hero-poster.jpg        (shown while the video loads)
    left.webp, right.webp  (jacket halves)
index.html                 ← demo page; open it to see the animation
```

## Moving it to the computer your website is on

1. Zip the `toohigh-scroll` folder (right-click → *Compress to ZIP*) and move it to the other computer by USB, Google Drive, email or WeTransfer.
2. Unzip it inside your website project, in the same folder as the page that gets the animation.
3. Add these three things to that page:

**In `<head>`:**
```html
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet">
<link rel="stylesheet" href="toohigh-scroll/toohigh-scroll.css">
```

**In the body, where the section should appear:** paste everything from `toohigh-scroll/section.html`.

**Just before `</body>`:**
```html
<script src="toohigh-scroll/toohigh-scroll.js"></script>
```

If the folder ends up somewhere else (for example `/assets/toohigh-scroll/`), change the paths in those three places and the `src=` paths in the pasted HTML to match.

### If your site is built with…

- **WordPress:** upload the folder to your theme (or the Media Library). Paste the section into a *Custom HTML* block and add the CSS/JS links in the theme header and footer, or with a plugin like *WPCode*. Use the full URLs of the uploaded files in the `src=` attributes.
- **Webflow / Wix / Framer:** upload `hero.mp4`, `hero-poster.jpg`, `left.webp` and `right.webp` to the site's assets. Paste the section into an *Embed* element and replace the `src=` paths with the asset URLs. Put the CSS inside `<style>…</style>` in the page's head code, and the JS inside `<script>…</script>` in its footer code.
- **React / Next.js:** put `assets/` in `public/toohigh-scroll/assets/`, import the CSS, render the section's markup as JSX (`class` → `className`), and load the JS once after mount, for example with `<Script src="/toohigh-scroll/toohigh-scroll.js" />` in Next.js.

## Customising

| Want to change | Where |
|---|---|
| The big word | `<h2 class="th-scroll__brand">TWO HIIGH</h2>` |
| The tagline | `<p class="th-scroll__tagline">…</p>` |
| How long the scroll lasts | `--th-length: 400vh;` in the CSS (bigger = slower) |
| Font | `--th-font` in the CSS |
| When each step happens | the `T = { … }` timeline at the top of the JS |
| How tightly the hands close | `gap = W * 0.14 …` in the JS (smaller number = tighter) |
| Smoothness | `SMOOTHING` in the JS (lower = floatier) |

## Common problems

- **The section doesn't stick or pin:** a parent element probably has `overflow: hidden` or `overflow: auto`, which breaks `position: sticky`. Remove it from the section's parent elements.
- **The video doesn't autoplay on iPhone:** keep the `muted` and `playsinline` attributes.
- **Images or video don't show:** a path is wrong. Open the browser's DevTools (F12) → *Console* and look for 404 errors.
- **Testing locally:** opening `index.html` by double-clicking works. If the video doesn't load, run a small local server in the folder instead:

```bash
python -m http.server 5173
```
