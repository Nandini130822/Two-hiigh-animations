/* ==========================================================================
   TWO HIIGH — "The Jacket Collection" scroll carousel
   Drives every [data-jc] section on the page. No libraries needed.
   ========================================================================== */
(function () {
  "use strict";

  var SMOOTHING = 0.09;     // higher = snappier, lower = softer
  var WHEEL_LOCK_MS = 650;  // one jacket per wheel/trackpad gesture

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad(n) { return String(n).padStart(2, "0"); }

  function init(section) {
    var items = [].slice.call(section.querySelectorAll(".jc__item"));
    var label = section.querySelector(".jc__label");
    var num = section.querySelector(".jc__current");
    var N = items.length;

    var currentIndex = 0;
    var currentPosition = 0;
    var targetPosition = 0;
    var wheelLocked = false;

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
      label.textContent = "Jacket " + pad(active + 1);
      num.textContent = pad(active + 1);

      // Distance between jackets; on narrow screens keep the side ones peeking in
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
          opacity = 1 - d * 0.55;
          z = 30 - Math.round(Math.abs(diff) * 10);
        }

        item.style.transform = "translate(calc(-50% + " + x + "px),-50%) scale(" + scale + ")";
        item.style.opacity = opacity;
        item.style.zIndex = z;
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
      if (Math.abs(event.deltaY) < 8) return;
      // Only take over the wheel while this section is on screen and pinned
      if (!isPinned()) return;

      if (wheelLocked) { event.preventDefault(); return; }

      var next = event.deltaY > 0 ? currentIndex + 1 : currentIndex - 1;
      // Past the first/last jacket: let the page scroll normally
      if (next < 0 || next > N - 1) return;

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
