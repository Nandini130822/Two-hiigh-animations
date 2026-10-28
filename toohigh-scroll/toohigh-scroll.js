/* ==========================================================================
   TOO HIGH — scroll "jacket zip" hero
   Drives every [data-th-scroll] section on the page. No libraries needed.
   ========================================================================== */
(function () {
  "use strict";

  // Aspect ratio (width / height) of left.webp & right.webp — 885 x 1084
  var HALF_RATIO = 885 / 1084;

  // Timeline: 0 = jacket fully open (end of the section), 1 = fully closed (top).
  // Scrolling down runs it from 1 to 0, so read each step backwards.
  var T = {
    taglineOut: [0.0, 0.15],   // tagline (visible only when open)
    slide:      [0.05, 0.95],  // jacket halves: off-screen (0) to closed (1); the last 5% is a
                               // short hold on the closed jacket before the section above returns
    brandIn:    [0.12, 0.35],  // brand word behind the jacket
    darken:     [0.35, 0.90]   // video to black
  };

  var SMOOTHING = 0.08; // 0..1 — lower = floatier, 1 = instant

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, r) { return clamp((p - r[0]) / (r[1] - r[0])); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  // Moves from the first scroll at the closed end without rushing the close on the way up
  function easeSlide(t) { return 0.5 * t + 0.5 * t * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function init(section) {
    var video   = section.querySelector(".th-scroll__video");
    var shade   = section.querySelector(".th-scroll__shade");
    var tagline = section.querySelector(".th-scroll__tagline");
    var brand   = section.querySelector(".th-scroll__brand");
    var left    = section.querySelector(".th-scroll__half--left");
    var right   = section.querySelector(".th-scroll__half--right");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var sticky  = section.querySelector(".th-scroll__sticky");

    var W = 0, H = 0, w = 0, gap = 0, pinTop = 0;
    var target = 0, current = 0, ticking = false;

    function measure() {
      var box = sticky.getBoundingClientRect();
      W = box.width;
      H = box.height;
      pinTop = parseFloat(getComputedStyle(sticky).top) || 0;
      // Each half: 1.25x screen height, and always wide enough to reach the screen edge
      w = Math.max(H * 1.25 * HALF_RATIO, W * 0.64);
      // Half the gap between the two image edges when closed. The knuckles sit ~9%
      // inside each image's inner edge; this puts them ~36% / 64% across the screen.
      gap = W * 0.14 - w * 0.09;
      left.style.width = right.style.width = w + "px";
      section.classList.add("is-ready");
    }

    function readScroll() {
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - H;
      var scrolled = total > 0 ? clamp((pinTop - rect.top) / total) : 0;
      // Starts closed at the top; scrolling down opens the jacket
      target = 1 - scrolled;
    }

    function render(p) {
      var s = easeSlide(range(p, T.slide));
      var b = easeOut(range(p, T.brandIn));

      var leftX  = lerp(-w - 10, W / 2 - gap - w, s);
      var rightX = lerp(W + 10, W / 2 + gap, s);
      left.style.transform  = "translate3d(" + leftX + "px,-50%,0)";
      right.style.transform = "translate3d(" + rightX + "px,-50%,0)";

      tagline.style.opacity = 1 - range(p, T.taglineOut);
      brand.style.opacity = b;
      brand.style.transform = "translate(-50%,-50%) scale(" + lerp(1.12, 1, b) + ")";
      shade.style.opacity = range(p, T.darken);
    }

    function tick() {
      current += (target - current) * SMOOTHING;
      if (Math.abs(target - current) < 0.0005) current = target;
      render(current);
      if (current !== target) requestAnimationFrame(tick);
      else ticking = false;
    }

    function onScroll() {
      readScroll();
      if (!ticking) { ticking = true; requestAnimationFrame(tick); }
    }

    function onResize() { measure(); readScroll(); current = target; render(current); }

    measure();
    if (reduced) { render(1); return; }
    readScroll();
    current = target;
    render(current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Scrolling up: don't let the page leave the top of this section until the
    // jacket has finished closing (the animation trails the scroll slightly)
    function shouldHoldUpward() {
      // Still pinned (not already scrolled back down past the section top)
      var stillPinned = section.getBoundingClientRect().top <= pinTop + 1;
      // In the short closed hold at the top of the section
      var inClosedZone = target >= T.slide[1];
      var notClosedYet = current < T.slide[1];
      return stillPinned && inClosedZone && notClosedYet;
    }

    window.addEventListener("wheel", function (event) {
      if (event.deltaY < 0 && shouldHoldUpward()) event.preventDefault();
    }, { passive: false });

    var touchY = null;
    window.addEventListener("touchstart", function (event) {
      touchY = event.touches[0].clientY;
    }, { passive: true });
    window.addEventListener("touchmove", function (event) {
      if (touchY === null) return;
      var y = event.touches[0].clientY;
      var scrollingUp = y > touchY; // finger moving down = page scrolling up
      touchY = y;
      if (scrollingUp && shouldHoldUpward()) event.preventDefault();
    }, { passive: false });

    // Pause the video when the section is off-screen (saves battery)
    if (video && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { var pr = video.play(); if (pr) pr.catch(function () {}); }
        else video.pause();
      }).observe(section);
    }
  }

  function boot() {
    var sections = document.querySelectorAll("[data-th-scroll]");
    for (var i = 0; i < sections.length; i++) init(sections[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
