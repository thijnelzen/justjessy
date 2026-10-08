/* Homepagina: willekeurige foto's, roze slangetje en wisselende foto's */
(function () {
  var slots = document.querySelectorAll('.slot');
  if (!slots.length) return;

  // img-map: homepagina foto's en de Clicky foto's
  var pool = ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.jpg','10.jpg','11.jpg','clicky-1.jpg','clicky-2.jpg','clicky-3.jpg','clicky-4.jpg','clicky-5.jpg'];
  for (var i = pool.length - 1; i > 0; i--) { // Fisher-Yates shuffle
    var j = Math.floor(Math.random() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t;
  }
  // de eerste vier staan in beeld, de rest wacht; zo komt nooit dezelfde foto twee keer voor
  var shown = pool.slice(0, slots.length), waiting = pool.slice(slots.length);
  slots.forEach(function (s, k) { s.querySelector('img').src = 'img/' + shown[k]; });

  function swap(k) {
    if (!waiting.length) return;
    var img = slots[k].querySelector('img');
    var idx = Math.floor(Math.random() * waiting.length), next = waiting[idx];
    var pre = new Image();
    pre.onload = function () {
      // pas na het laden wisselen, en pas dan de oude foto terug in de wachtrij zetten
      waiting.splice(waiting.indexOf(next), 1);
      var old = shown[k]; shown[k] = next;
      img.style.opacity = 0;
      setTimeout(function () { img.src = 'img/' + next; img.style.opacity = 1; waiting.push(old); }, 1400); // langzaam uitfaden, dan de nieuwe foto langzaam inladen
    };
    pre.src = 'img/' + next;
  }

  var svg = document.getElementById('snake');
  var path = svg.querySelector('path');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  // punten rond een foto, met willekeurige afstand en kronkel
  function route(r) {
    var pad = rnd(14, 34), x = r.left - pad, y = r.top - pad, w = r.width + pad * 2, h = r.height + pad * 2;
    var pts = [], n = Math.round(rnd(14, 22)), dir = Math.random() < .5 ? 1 : -1, start = Math.random();
    var turns = rnd(.9, 1.6); // soms meer dan een rondje
    for (var i = 0; i <= n; i++) {
      var p = ((start + dir * turns * i / n) % 1 + 1) % 1, per = 2 * (w + h), d = p * per, px, py;
      if (d < w) { px = x + d; py = y; } else if (d < w + h) { px = x + w; py = y + d - w; }
      else if (d < 2 * w + h) { px = x + w - (d - w - h); py = y + h; } else { px = x; py = y + h - (d - 2 * w - h); }
      var wob = rnd(-pad * .9, pad * 1.2) + Math.sin(i * rnd(.6, 1.4)) * 10;
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2, vx = px - cx, vy = py - cy, len = Math.hypot(vx, vy) || 1;
      pts.push([px + vx / len * wob, py + vy / len * wob]);
    }
    // vloeiende lijn via Catmull-Rom naar bezier
    var d2 = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var k = 0; k < pts.length - 1; k++) {
      var p0 = pts[k - 1] || pts[k], p1 = pts[k], p2 = pts[k + 1], p3 = pts[k + 2] || p2;
      d2 += 'C' + (p1[0] + (p2[0] - p0[0]) / 6) + ',' + (p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
            (p2[0] - (p3[0] - p1[0]) / 6) + ',' + (p2[1] - (p3[1] - p1[1]) / 6) + ' ' + p2[0] + ',' + p2[1];
    }
    return d2;
  }

  function swim() {
    var k = Math.floor(Math.random() * slots.length);
    var el = slots[k].querySelector('img');
    path.setAttribute('d', route(el.getBoundingClientRect()));
    var len = path.getTotalLength(), seg = len * rnd(.12, .28), dur = rnd(2800, 5200);
    path.style.strokeWidth = rnd(3, 7);
    path.style.strokeDasharray = seg + ' ' + (len + seg);
    setTimeout(function () { swap(k); }, dur * .35); // halverwege komt er een andere foto
    path.animate(
      [{ strokeDashoffset: seg, opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .85 }, { strokeDashoffset: -len, opacity: 0 }],
      { duration: dur, easing: 'ease-in-out', fill: 'both' }
    ).onfinish = function () { setTimeout(swim, rnd(1200, 6000)); };
  }
  if (!reduce) setTimeout(swim, rnd(1200, 3000));
})();

/* Work en About: foto's worden zichtbaar tijdens het scrollen */
(function () {
  var imgs = document.querySelectorAll('.fade');
  if (!imgs.length) return;
  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    imgs.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      var o = (vh * .95 - top) / (vh * .5); // 0 net onder in beeld, 1 als de foto halverwege komt
      el.style.opacity = Math.max(0, Math.min(1, o));
    });
    ticking = false;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', update);
  update();
})();
