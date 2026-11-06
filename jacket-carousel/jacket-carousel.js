/* ==========================================================================
   TWO HIIGH — "The Jacket Collection" scroll carousel
   Drives every [data-jc] section on the page. No libraries needed.
   ========================================================================== */
(function () {
  "use strict";

  var SMOOTHING = 0.09;     // higher = snappier, lower = softer
  var WHEEL_LOCK_MS = 650;  // one jacket per wheel/trackpad gesture
  var GESTURE_GAP_MS = 180; // wheel events closer together than this count as one gesture
  var SNAP_DELAY_MS = 140;  // scrolling counts as stopped after this long without movement
  var SNAP_COMMIT = 0.15;   // past this share of the way, snapping finishes the move instead of going back
  var REST_ZONE = 0.05;     // scroll slack around each piece before it starts to move
  var WORN_FROM = 0.75;     // closer to him than this, the piece morphs to its worn shape...
  var WORN_BLEND = 0.35;    // ...over this much of the slide

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad(n) { return String(n).padStart(2, "0"); }

  function init(section) {
    var items = [].slice.call(section.querySelectorAll(".jc__item"));
    var bodies = [].slice.call(section.querySelectorAll(".jc__body"));
    var wornImgs = items.map(function (item) { return item.querySelector(".jc__worn"); });
    var flatImgs = items.map(function (item) { return item.querySelector(".jc__flat"); });
    var label = section.querySelector(".jc__label");
    var num = section.querySelector(".jc__current");
    var N = items.length;

    var currentIndex = 0;
    var currentPosition = 0;
    var targetPosition = 0;
    var wheelLocked = false;
    var lastWheelTime = 0;
    var gestureStartedPinned = false;

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
      label.textContent = "Piece " + pad(active + 1);
      num.textContent = pad(active + 1);

      // Distance between pieces; on narrow screens keep the side ones peeking in
      var spacing = Math.min(window.innerHeight * 0.5, 380, window.innerWidth * 0.62);

      items.forEach(function (item, index) {
        var diff = index - position;
        var d = Math.abs(diff);
        // how far the piece is from sitting on him: 0 while worn, 1 at the side slot
        var away = d <= 1 ? clamp((d - REST_ZONE) / (1 - REST_ZONE), 0, 1) : d;
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

        // Near him the piece is in its worn shape (cut from his photo), so it lands
        // pixel-for-pixel on his body; out at the side it is the flat product shot.
        var worn = clamp((WORN_FROM - away) / WORN_BLEND, 0, 1);
        wornImgs[index].style.opacity = worn;
        flatImgs[index].style.opacity = 1 - worn;
      });

      // His body under the pieces: the current one stays solid, the next fades in over it
      var base = clamp(Math.floor(position), 0, N - 1);
      bodies.forEach(function (body, index) {
        body.style.opacity = index === base ? 1 : index === base + 1 ? clamp(position - base, 0, 1) : 0;
      });
    }

    function animate() {
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
      // A pause of more than GESTURE_GAP_MS between wheel events starts a new gesture
      var now = performance.now();
      var newGesture = now - lastWheelTime > GESTURE_GAP_MS;
      lastWheelTime = now;

      var pinned = isPinned();
      if (newGesture) gestureStartedPinned = pinned;
      if (!pinned) { gestureStartedPinned = false; return; }

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
      if (wheelLocked) return;
      var position = positionFromScroll();
      if (lastScrollPosition !== null && Math.abs(position - lastScrollPosition) > 0.0005) {
        scrollDirection = position > lastScrollPosition ? 1 : -1;
      }
      lastScrollPosition = position;
      currentPosition = targetPosition = position;
      currentIndex = Math.round(position);
      render(position);
      scheduleSnap();
    }, { passive: true });

    window.addEventListener("touchstart", function () { touching = true; clearTimeout(snapTimer); }, { passive: true });
    window.addEventListener("touchend", function () { touching = false; scheduleSnap(); }, { passive: true });
    window.addEventListener("touchcancel", function () { touching = false; scheduleSnap(); }, { passive: true });

    window.addEventListener("resize", function () {
      currentPosition = targetPosition = positionFromScroll();
      currentIndex = Math.round(currentPosition);
      render(currentPosition);
    });

    currentPosition = targetPosition = positionFromScroll();
    currentIndex = Math.round(currentPosition);
    render(currentPosition);
    requestAnimationFrame(animate);
  }

  function boot() {
    var sections = document.querySelectorAll("[data-jc]");
    for (var i = 0; i < sections.length; i++) init(sections[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
