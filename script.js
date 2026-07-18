(function () {
  var BUBBLE_ID = 'ultra-fast-widget-bubble-54722168';
  var KEY = 'aidDemoWidgetAutoOpened';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var userTouched = false;
  document.addEventListener('click', function (e) {
    if (e.isTrusted && e.target && e.target.closest && e.target.closest('#' + BUBBLE_ID)) { userTouched = true; }
  }, true);
  var tries = 0;
  var t = setInterval(function () {
    tries += 1;
    var b = document.getElementById(BUBBLE_ID);
    if (b && tries >= 7) {
      clearInterval(t);
      if (!userTouched) { b.click(); }
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    }
    if (tries > 30) { clearInterval(t); }
  }, 1000);
})();

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Grain SVG filter injected into <defs> once ── */
  (function() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
    svg.innerHTML = '<defs><filter id="page-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter></defs>';
    document.body.insertBefore(svg, document.body.firstChild);
  })();

  /* ── SMS sequencer ── */
  var thread = document.getElementById('thread');
  var replayBtn = document.getElementById('replay-btn');
  var b1 = document.getElementById('b1');
  var b2 = document.getElementById('b2');
  var b3 = document.getElementById('b3');
  var b4 = document.getElementById('b4');
  var t1 = document.getElementById('typing1');
  var t2 = document.getElementById('typing2');

  var smsTimers = [];
  var smsRunning = false;

  function clearSmsTimers() {
    smsTimers.forEach(function(id) { clearTimeout(id); });
    smsTimers = [];
  }

  function resetThread() {
    clearSmsTimers();
    smsRunning = false;
    [b1,b2,b3,b4].forEach(function(b) {
      b.classList.remove('show');
      b.style.opacity = '0';
      b.style.transform = 'translateY(10px) scale(.98)';
    });
    [t1,t2].forEach(function(t) { t.classList.remove('show'); });
    replayBtn.classList.remove('spin');
  }

  function playThread() {
    if (smsRunning) return;
    resetThread();
    smsRunning = true;

    if (prefersReduced.matches) {
      // static fallback: show all immediately
      [b1,b2,b3,b4].forEach(function(b) { b.classList.add('show'); });
      smsRunning = false;
      return;
    }

    var seq = [
      { el: b1, t: 400 },
      { el: t1, t: 1100, show: true },
      { el: t1, t: 2400, show: false },
      { el: b2, t: 2500 },
      { el: b3, t: 4200 },
      { el: t2, t: 5000, show: true },
      { el: t2, t: 6100, show: false },
      { el: b4, t: 6200 },
    ];

    seq.forEach(function(s) {
      var id = setTimeout(function() {
        if (s.show === false) { s.el.classList.remove('show'); }
        else { s.el.classList.add('show'); }
        if (s.el === b4) {
          smsRunning = false;
          // scroll to bottom of thread
          if (thread.scrollHeight > thread.clientHeight) {
            thread.scrollTop = thread.scrollHeight;
          }
        }
      }, s.t);
      smsTimers.push(id);
    });
  }

  replayBtn.addEventListener('click', function() {
    replayBtn.classList.add('spin');
    setTimeout(function() { replayBtn.classList.remove('spin'); }, 520);
    resetThread();
    setTimeout(playThread, 100);
  });

  // IntersectionObserver: re-arm on every scroll entry
  var demoPanel = document.getElementById('demo-panel');
  var demoInView = false;
  var demoObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting && !demoInView) {
        demoInView = true;
        setTimeout(playThread, 300);
      } else if (!e.isIntersecting) {
        demoInView = false;
        clearSmsTimers();
        smsRunning = false;
      }
    });
  }, { threshold: 0.25 });
  demoObserver.observe(demoPanel);

  // prefers-reduced-motion: change listener
  prefersReduced.addEventListener('change', function() {
    if (prefersReduced.matches) {
      clearSmsTimers();
      [b1,b2,b3,b4].forEach(function(b) { b.classList.add('show'); });
      [t1,t2].forEach(function(t) { t.classList.remove('show'); });
      smsRunning = false;
    }
  });

  /* ── Stat counter ── */
  var statEl = document.getElementById('stat-number');
  var statReplayBtn = document.getElementById('stat-replay');
  var countTarget = 5000;
  var countRaf = null;
  var countRun = 0; // generation token

  function formatStat(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function runCount(generation) {
    if (countRaf) { cancelAnimationFrame(countRaf); countRaf = null; }
    if (prefersReduced.matches) {
      statEl.textContent = formatStat(countTarget);
      return;
    }
    var start = null;
    var duration = 2000;
    function step(ts) {
      if (generation !== countRun) return; // superseded run
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // easeOutQuart
      var ease = 1 - Math.pow(1 - progress, 4);
      statEl.textContent = formatStat(ease * countTarget);
      if (progress < 1) { countRaf = requestAnimationFrame(step); }
      else { statEl.textContent = formatStat(countTarget); countRaf = null; }
    }
    countRaf = requestAnimationFrame(step);
  }

  function startCount() {
    countRun += 1;
    statEl.textContent = '0';
    runCount(countRun);
  }

  statReplayBtn.addEventListener('click', function() {
    statReplayBtn.classList.add('spin');
    setTimeout(function() { statReplayBtn.classList.remove('spin'); }, 480);
    startCount();
  });

  var statObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { startCount(); }
      else { if (countRaf) { cancelAnimationFrame(countRaf); countRaf = null; } }
    });
  }, { threshold: 0.3 });
  statObserver.observe(statEl.closest('.stat-block'));

  prefersReduced.addEventListener('change', function() {
    if (prefersReduced.matches) {
      if (countRaf) { cancelAnimationFrame(countRaf); countRaf = null; }
      statEl.textContent = formatStat(countTarget);
    }
  });

  /* ── Scroll reveal ── */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          // one-time reveal
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function(el) { revealObserver.observe(el); });
  }

  /* ── Sticky CTA bar: hide when real CTA panel in view ── */
  var stickyCta = document.getElementById('sticky-cta');
  var ctaPanelSection = document.getElementById('cta-panel-section');
  if (stickyCta && ctaPanelSection) {
    var ctaObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { stickyCta.classList.add('hidden'); }
        else { stickyCta.classList.remove('hidden'); }
      });
    }, { threshold: 0.1 });
    ctaObserver.observe(ctaPanelSection);
  }

})();