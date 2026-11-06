/* ==========================================================================
   TWO HIIGH — "The Jacket Collection" scroll carousel
   Drives every [data-jc] section on the page. No libraries needed.
   ========================================================================== */
(function () {
  "use strict";

  var SMOOTHING = 0.09;     // higher = snappier, lower = softer
  var WHEEL_LOCK_MS = 650;  // one jacket per wheel/trackpad gesture
  var GESTURE_GAP_MS = 180; // wheel events closer together than this count as one gesture
  var WORN_FADE = 0.14;     // last part of the slide, where the flat piece turns into the worn photo

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad(n) { return String(n).padStart(2, "0"); }

  function init(section) {
    var items = [].slice.call(section.querySelectorAll(".jc__item"));
    var looks = [].slice.call(section.querySelectorAll(".jc__look"));
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

    var direction = 1;       // 1 = scrolling to the next piece, -1 = back to the previous one
    var lastPosition = null;

    function render(position) {
      if (lastPosition !== null && Math.abs(position - lastPosition) > 0.0005) {
        direction = position > lastPosition ? 1 : -1;
      }
      lastPosition = position;

      var active = clamp(Math.round(position), 0, N - 1);
      label.textContent = "Piece " + pad(active + 1);
      num.textContent = pad(active + 1);

      // Between two pieces: he keeps wearing the one we're leaving while the flat
      // garment we're heading to slides in and lands on him; only then does the
      // photo of him wearing it take over.
      var lo = Math.floor(position), hi = Math.ceil(position);
      var moving = hi !== lo;
      var incoming = moving ? (direction > 0 ? hi : lo) : -1;
      var worn = moving ? (direction > 0 ? lo : hi) : active;
      var t = moving ? 1 - Math.abs(incoming - position) : 0;   // 0 = at the side, 1 = landed

      // Distance between pieces; on narrow screens keep the side ones peeking in
      var spacing = Math.min(window.innerHeight * 0.5, 380, window.innerWidth * 0.62);

      items.forEach(function (item, index) {
        var diff = index - position;
        var x, scale, opacity, z;

        if (Math.abs(diff) > 2.2) {
          opacity = 0;
          x = diff > 0 ? 900 : -900;
          scale = 0.5;
          z = 1;
        } else {
          var d = Math.min(Math.abs(diff), 2);
          x = diff * spacing;
          scale = 1 - d * 0.18;
          z = 30 - Math.round(Math.abs(diff) * 10);
          if (index === incoming) {
            // fully visible on its way in; hands over to the worn photo as it lands
            opacity = Math.min(1, 0.45 + t * 1.6) * clamp((1 - t) / WORN_FADE, 0, 1);
            z = 40;
          } else {
            // waiting at the side; hidden while it's the piece he is wearing
            opacity = Math.max(1 - d * 0.55, 0) * clamp((d - 0.5) / 0.5, 0, 1);
          }
        }

        item.style.transform = "translate(calc(-50% + " + x + "px),-50%) scale(" + scale + ")";
        item.style.opacity = opacity;
        item.style.zIndex = z;
      });

      looks.forEach(function (look, index) {
        var isIncoming = index === incoming;
        look.style.opacity = index === worn ? 1 : isIncoming ? clamp((t - (1 - WORN_FADE)) / WORN_FADE, 0, 1) : 0;
        look.style.zIndex = isIncoming ? 2 : 1;
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
      setTimeout(function () { wheelLocked = false; }, WHEEL_LOCK_MS);
    }, { passive: false });

    window.addEventListener("scroll", function () {
      if (wheelLocked) return;
      var position = positionFromScroll();
      currentPosition = targetPosition = position;
      currentIndex = Math.round(position);
      render(position);
    }, { passive: true });

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
