/* AID teaser bubble + auto-open schedule (v3, 2026-07-22):
   teaser at 10s next to the closed launcher, auto-open never before 20s.
   Pages with the data-aid-widget-boost snippet keep that snippet's own 20s
   opener; this block only auto-opens on pages without it. Clicking the
   teaser or the launcher opens the chat immediately. */
(function () {
  var WID = '54722168';
  var BUBBLE_ID = 'ultra-fast-widget-bubble-' + WID;
  var OPEN_KEY = 'aidWidgetAutoOpened';
  var LEGACY_KEY = 'aidDemoWidgetAutoOpened';
  var TEASER_KEY = 'aidTeaserShown';
  var TEASER_AT = 10; /* seconds, the old auto-open moment */
  var OPEN_AT = 20;   /* seconds, minimum auto-open delay */
  var hasBoost = !!document.querySelector('script[data-aid-widget-boost]');
  function bubble() { return document.getElementById(BUBBLE_ID); }
  function isOpen() {
    var c = document.getElementById('ultra-fast-widget-container-' + WID);
    return !!(c && getComputedStyle(c).display !== 'none');
  }
  function alreadyOpened() {
    try { return !!(sessionStorage.getItem(OPEN_KEY) || sessionStorage.getItem(LEGACY_KEY)); } catch (e) { return false; }
  }
  var teaser = null;
  var userTouched = false;
  document.addEventListener('click', function (e) {
    if (e.isTrusted && e.target && e.target.closest && e.target.closest('#' + BUBBLE_ID)) {
      userTouched = true;
      hideTeaser();
    }
  }, true);
  function hideTeaser() {
    if (!teaser) return;
    var t = teaser;
    teaser = null;
    t.style.opacity = '0';
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 450);
  }
  function openChat() {
    hideTeaser();
    var b = bubble();
    if (b && !isOpen()) b.click();
  }
  function showTeaser() {
    if (teaser || userTouched || isOpen() || alreadyOpened()) return;
    try {
      if (sessionStorage.getItem(TEASER_KEY)) return;
      sessionStorage.setItem(TEASER_KEY, '1');
    } catch (e) {}
    var d = document.createElement('div');
    d.setAttribute('data-aid-teaser', '');
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.style.cssText = 'position:fixed;right:20px;bottom:98px;z-index:999998;max-width:250px;background:#141419;color:#F4F4F5;padding:13px 32px 13px 16px;border-radius:16px;border:1px solid rgba(201,168,76,.45);box-shadow:0 12px 28px rgba(0,0,0,.5);font:500 14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;cursor:pointer;opacity:0;transform:translateY(10px);transition:opacity .5s ease,transform .5s ease;';
    var txt = document.createElement('p');
    txt.style.cssText = 'margin:0;';
    txt.textContent = 'Free demo, your Agent talks and speaks! 🎙️';
    var x = document.createElement('button');
    x.type = 'button';
    x.setAttribute('aria-label', 'Dismiss');
    x.textContent = '×';
    x.style.cssText = 'position:absolute;top:2px;right:6px;background:transparent;border:none;color:rgba(244,244,245,.55);font-size:18px;line-height:1;cursor:pointer;padding:2px 4px;';
    x.addEventListener('click', function (e) { e.stopPropagation(); hideTeaser(); });
    var arrow = document.createElement('span');
    arrow.style.cssText = 'position:absolute;bottom:-7px;right:26px;width:12px;height:12px;background:#141419;border-right:1px solid rgba(201,168,76,.45);border-bottom:1px solid rgba(201,168,76,.45);transform:rotate(45deg);';
    d.appendChild(txt);
    d.appendChild(x);
    d.appendChild(arrow);
    d.addEventListener('click', function (e) { if (e.target === x) return; e.stopPropagation(); openChat(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChat(); } });
    document.body.appendChild(d);
    teaser = d;
    requestAnimationFrame(function () { d.style.opacity = '1'; d.style.transform = 'translateY(0)'; });
  }
  var ticks = 0;
  var timer = setInterval(function () {
    ticks += 1;
    if (isOpen()) {
      hideTeaser();
      if (hasBoost || ticks >= OPEN_AT) clearInterval(timer);
      return;
    }
    var b = bubble();
    if (b && ticks >= TEASER_AT) showTeaser();
    if (!hasBoost && b && ticks >= OPEN_AT) {
      clearInterval(timer);
      hideTeaser();
      var guard = alreadyOpened();
      try { sessionStorage.setItem(LEGACY_KEY, '1'); } catch (e) {}
      if (!guard && !userTouched && !isOpen()) b.click();
    }
    if (ticks > 60) clearInterval(timer);
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