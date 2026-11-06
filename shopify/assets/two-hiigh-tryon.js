/* ==========================================================================
   TWO HIIGH — scroll try-on carousel
   Shopify asset: two-hiigh-tryon.js — used by sections/two-hiigh-tryon.liquid.
   Drives every [data-jc] section on the page. No libraries needed.
   ========================================================================== */
(function () {
  "use strict";

  var SMOOTHING = 0.09;     // higher = snappier, lower = softer
  var WHEEL_LOCK_MS = 650;  // one jacket per wheel/trackpad gesture
  var GESTURE_GAP_MS = 180; // wheel events closer together than this count as one gesture
  var SNAP_DELAY_MS = 140;  // scrolling counts as stopped after this long without movement
  var SNAP_COMMIT = 0.15;   // past this share of the way, snapping finishes the move instead of going back
  var FRONT_FADE = 0.12;    // last part of a slide, where his hands come in front of the piece
  var REST_ZONE = 0.05;     // scroll slack around each piece before it starts to move

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad(n) { return String(n).padStart(2, "0"); }

  function init(section) {
    if (section.jcReady) return;      // never wire the same section twice
    section.jcReady = true;
    var labelPrefix = section.getAttribute("data-jc-label") || "Piece";
    var items = [].slice.call(section.querySelectorAll(".jc__item"));
    var bodies = [].slice.call(section.querySelectorAll(".jc__body"));
    var front = section.querySelector(".jc__front");
    var label = section.querySelector(".jc__label");
    var num = section.querySelector(".jc__current");
    var N = items.length;
    if (!N) return;                   // nothing to show yet

    var currentIndex = 0;
    var currentPosition = 0;
    var targetPosition = 0;
    var wheelLocked = false;
    var lastWheelTime = 0;
    var gestureStartedPinned = false;
    var gestureMoved = false;      // this wheel/trackpad gesture has already changed the piece

    // How far the page can scroll while this section is pinned
    function scrollLength() { return Math.max(1, section.offsetHeight - window.innerHeight); }
    function sectionTop() { return section.getBoundingClientRect().top + window.scrollY; }
    function scrollForIndex(i) { return sectionTop() + (N > 1 ? i / (N - 1) : 0) * scrollLength(); }

    function positionFromScroll() {
      var p = clamp(-section.getBoundingClientRect().top / scrollLength(), 0, 1);
      return p * (N - 1);
    }

    // True while the stage is stuck to the screen
    function isPinned() {
      var r = section.getBoundingClientRect();
      return r.top <= 1 && r.bottom >= window.innerHeight - 1;
    }

    function render(position) {
      var active = clamp(Math.round(position), 0, N - 1);
      label.textContent = labelPrefix + " " + pad(active + 1);
      num.textContent = pad(active + 1);

      // Distance between pieces; on narrow screens keep the side ones peeking in
      var spacing = Math.min(window.innerHeight * 0.5, 380, window.innerWidth * 0.62);

      var nearest = 1;          // how far the closest piece is from sitting on him

      items.forEach(function (item, index) {
        var diff = index - position;
        var d = Math.abs(diff);
        // how far the piece is from sitting on him: 0 while worn, 1 at the side slot
        var away = d <= 1 ? clamp((d - REST_ZONE) / (1 - REST_ZONE), 0, 1) : d;
        if (away < nearest) nearest = away;
        var x, scale, opacity;

        if (d > 2.2) {
          opacity = 0;
          x = diff > 0 ? 900 : -900;
          scale = 0.5;
        } else {
          x = (diff < 0 ? -1 : 1) * away * spacing;
          scale = 1 - Math.min(away, 2) * 0.18;
          // solid while on or near him, lighter while waiting at the side
          opacity = Math.max(1 - 0.55 * clamp((away - 0.25) / 0.75, 0, 1) - 0.55 * Math.max(away - 1, 0), 0);
        }

        item.style.transform = "translate(calc(-50% + " + x + "px),-50%) scale(" + scale + ")";
        item.style.opacity = opacity;
        item.style.zIndex = 30 - Math.round(Math.min(d, 2) * 10);

        // The piece keeps its as-worn shape everywhere, so it lands pixel-for-pixel on
        // his body. --jc-away (0 on him, 1 at the side) drives the side shadow in CSS.
        item.style.setProperty("--jc-away", Math.min(away, 1).toFixed(3));
      });

      // His forearms and hands go in front of a piece only once it has landed on him.
      // While a piece is sliding it stays on top, so no arm floats over it.
      if (front) front.style.opacity = clamp(1 - nearest / FRONT_FADE, 0, 1);

      // His body under the pieces. Normally there is one body image and it never
      // changes. If a body image is given per piece, the current one stays solid
      // and the next fades in over it.
      if (bodies.length > 1) {
        var base = clamp(Math.floor(position), 0, N - 1);
        bodies.forEach(function (body, index) {
          body.style.opacity = index === base ? 1 : index === base + 1 ? clamp(position - base, 0, 1) : 0;
        });
      }
    }

    function animate() {
      if (!section.isConnected) return;   // section was removed (e.g. re-rendered in a theme editor)
      var difference = targetPosition - currentPosition;
      currentPosition += difference * SMOOTHING;
      if (Math.abs(difference) < 0.001) currentPosition = targetPosition;
      render(currentPosition);
      requestAnimationFrame(animate);
    }

    function goToJacket(index) {
      index = clamp(index, 0, N - 1);
      currentIndex = index;
      targetPosition = index;
      window.scrollTo({ top: scrollForIndex(index), behavior: "smooth" });
    }

    window.addEventListener("wheel", function (event) {
      if (!section.isConnected) return;
      // A pause of more than GESTURE_GAP_MS between wheel events starts a new gesture
      var now = performance.now();
      var newGesture = now - lastWheelTime > GESTURE_GAP_MS;
      lastWheelTime = now;

      var pinned = isPinned();
      if (newGesture) { gestureStartedPinned = pinned; gestureMoved = false; }
      if (!pinned) { gestureStartedPinned = false; return; }

      // One piece per gesture: a long swipe keeps sending events after the move is
      // done, and those must not nudge the page or carry on to the piece after
      if (gestureMoved) { event.preventDefault(); return; }

      if (Math.abs(event.deltaY) < 8) return;

      if (wheelLocked) { event.preventDefault(); return; }

      var next = event.deltaY > 0 ? currentIndex + 1 : currentIndex - 1;
      // Past the first/last jacket: let the page scroll normally
      if (next < 0 || next > N - 1) return;

      // Arrived here mid-gesture (e.g. scrolling up out of the next section with
      // trackpad momentum): hold on this jacket instead of skipping ahead
      if (!gestureStartedPinned) { event.preventDefault(); return; }

      event.preventDefault();
      wheelLocked = true;
      gestureMoved = true;
      goToJacket(next);
      setTimeout(function () { wheelLocked = false; scheduleSnap(); }, WHEEL_LOCK_MS);
    }, { passive: false });

    // When scrolling stops between two pieces (touch, scrollbar, a small trackpad
    // nudge), finish the move so a piece always ends up fully on him.
    var snapTimer = null;
    var touching = false;
    var lastScrollPosition = null;
    var scrollDirection = 1;

    function snapToPiece() {
      snapTimer = null;
      if (!section.isConnected) return;
      if (touching || wheelLocked || !isPinned()) return;
      var position = positionFromScroll();
      if (Math.abs(position - Math.round(position)) < 0.01) return;      // already on a piece
      var lo = Math.floor(position), part = position - lo;
      // carry on in the direction of travel once the move is clearly under way
      var index = scrollDirection > 0 ? (part > SNAP_COMMIT ? lo + 1 : lo)
                                      : (part < 1 - SNAP_COMMIT ? lo : lo + 1);
      goToJacket(index);
    }

    function scheduleSnap() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToPiece, SNAP_DELAY_MS);
    }

    window.addEventListener("scroll", function () {
      if (!section.isConnected) return;
      var position = positionFromScroll();
      if (lastScrollPosition !== null && Math.abs(position - lastScrollPosition) > 0.0005) {
        scrollDirection = position > lastScrollPosition ? 1 : -1;
      }
      lastScrollPosition = position;
      if (wheelLocked) return;
      currentPosition = targetPosition = position;
      currentIndex = Math.round(position);
      render(position);
      scheduleSnap();
    }, { passive: true });

    window.addEventListener("touchstart", function () { touching = true; clearTimeout(snapTimer); }, { passive: true });
    window.addEventListener("touchend", function () { touching = false; scheduleSnap(); }, { passive: true });
    window.addEventListener("touchcancel", function () { touching = false; scheduleSnap(); }, { passive: true });

    // Shopify theme editor: clicking a piece in the sidebar shows that piece
    section.addEventListener("shopify:block:select", function (event) {
      var index = items.indexOf(event.target);
      if (index >= 0) goToJacket(index);
    });

    window.addEventListener("resize", function () {
      if (!section.isConnected) return;
      currentPosition = targetPosition = positionFromScroll();
      currentIndex = Math.round(currentPosition);
      render(currentPosition);
    });

    currentPosition = targetPosition = positionFromScroll();
    currentIndex = Math.round(currentPosition);
    render(currentPosition);
    requestAnimationFrame(animate);
  }

  function boot(root) {
    var sections = (root && root.querySelectorAll ? root : document).querySelectorAll("[data-jc]");
    for (var i = 0; i < sections.length; i++) init(sections[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { boot(); });
  else boot();

  // Shopify theme editor: a section that is added or re-rendered needs wiring up again
  document.addEventListener("shopify:section:load", function (event) { boot(event.target); });
})();
