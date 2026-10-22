/* ============================================================
   佳临 Kevin · 现金流架构师 — 交互脚本
   1. 金色流动线条背景（cash flow 隐喻）
   2. 滚动 reveal
   3. 数字滚动
   4. 二维码弹窗
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- 1. 流动金线 ---------- */
  var canvas = document.getElementById('flow');
  if (canvas && !reduced.matches) {
    var ctx = canvas.getContext('2d');
    var W, H, lines = [];
    var GOLD = '201,164,92';

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    // 每条线是一段横向流动的贝塞尔曲线
    function makeLine(yBase) {
      return {
        y: yBase,
        speed: 0.15 + Math.random() * 0.35,
        amp: 18 + Math.random() * 42,
        freq: 0.0012 + Math.random() * 0.0022,
        phase: Math.random() * Math.PI * 2,
        width: 0.6 + Math.random() * 1.1,
        alpha: 0.08 + Math.random() * 0.16,
        offset: Math.random() * 10000
      };
    }

    function initLines() {
      lines = [];
      var count = Math.min(14, Math.floor(H / 90));
      for (var i = 0; i < count; i++) {
        lines.push(makeLine((H / count) * i + 40 + Math.random() * 30));
      }
    }

    var t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 1;
      for (var i = 0; i < lines.length; i++) {
        var l = lines[i];
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(' + GOLD + ',' + l.alpha + ')';
        ctx.lineWidth = l.width;
        ctx.moveTo(-40, l.y);
        for (var x = 0; x <= W + 40; x += 26) {
          var wave = Math.sin(x * l.freq + t * l.speed * 0.02 + l.phase + l.offset * 0.001)
                   * Math.sin(x * 0.002 + l.phase);
          var y = l.y + wave * l.amp;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        // 线缓慢下沉再回到顶部，营造"流动"
        l.y += l.speed * 0.08;
        if (l.y > H + 60) l.y = -60;
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', function () {
      resize(); initLines();
    });
    resize(); initLines(); draw();
  } else if (canvas && reduced.matches) {
    canvas.style.display = 'none';
  }

  /* ---------- 2. 滚动 reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 3. 数字滚动 ---------- */
  var counters = document.querySelectorAll('.stat-num');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced.matches) { el.textContent = target + suffix; return; }
    var start = null;
    var dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- 4. 二维码弹窗 ---------- */
  var qrLayer = document.getElementById('qrLayer');
  var qrImg = document.getElementById('qrImg');
  var qrCaption = document.getElementById('qrCaption');
  var qrClose = document.getElementById('qrClose');

  var captions = {
    'wechat-personal': '加微信：吴佳临 Kevin · 中国澳门',
    'wechat-mp': '关注公众号：佳临 kevin',
    'channels': '关注视频号：佳临在澳门'
  };

  document.querySelectorAll('.qr-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-qr');
      qrImg.src = 'assets/qr/' + key + '.jpg';
      qrImg.alt = captions[key] || '二维码';
      qrCaption.textContent = captions[key] || '';
      qrLayer.hidden = false;
      document.body.style.overflow = 'hidden';
    });
  });

  function closeQr() {
    qrLayer.hidden = true;
    document.body.style.overflow = '';
  }
  qrClose.addEventListener('click', closeQr);
  qrLayer.addEventListener('click', function (e) {
    if (e.target === qrLayer) closeQr();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !qrLayer.hidden) closeQr();
  });

})();
