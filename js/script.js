/* Thiệp cưới Quang Long & Minh Nguyệt - hành vi của trang (không phụ thuộc thư viện) */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Màn hình mở thiệp + nhạc nền ---------- */
  var intro = $('#intro');
  var openLink = $('#open-invitation');
  var audio = $('audio');
  var invitation = $('#invitation');
  var musicToggle = $('#music-toggle');
  var musicIcon = musicToggle && $('.absolute.inset-0.flex', musicToggle);

  function setMusicState(playing) {
    if (!musicToggle) return;
    musicToggle.setAttribute('aria-label', playing ? 'Tạm dừng nhạc' : 'Phát nhạc');
    if (musicIcon) musicIcon.classList.toggle('animate-spin-cd', playing);
  }

  function playMusic() {
    if (!audio) return;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { setMusicState(false); });
    setMusicState(true);
  }

  function pauseMusic() {
    if (audio) audio.pause();
    setMusicState(false);
  }

  /* Tự cuộn dọc chầm chậm sau khi mở thiệp; dừng ngay khi người dùng chạm vào */
  function startGentleScroll() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var SPEED = 60; // px / giây
    var pos = window.scrollY || window.pageYOffset || 0;
    var last = null, stopped = false, raf = 0;
    var events = ['wheel', 'touchstart', 'keydown', 'mousedown', 'pointerdown'];

    function stop() {
      if (stopped) return;
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      events.forEach(function (ev) { window.removeEventListener(ev, onUser); });
    }
    function onUser(e) {
      if (e.type === 'keydown') {
        var keys = [' ', 'Spacebar', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
        if (keys.indexOf(e.key) === -1) return;
      }
      stop();
    }
    function step(ts) {
      if (stopped) return;
      if (last === null) last = ts;
      var dt = (ts - last) / 1000;
      last = ts;
      pos += SPEED * dt;
      window.scrollTo(0, pos);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (pos >= max - 2) { stop(); return; }
      raf = requestAnimationFrame(step);
    }
    events.forEach(function (ev) { window.addEventListener(ev, onUser, { passive: true }); });
    raf = requestAnimationFrame(step);
  }

  if (openLink && intro) {
    openLink.addEventListener('click', function (e) {
      e.preventDefault();
      intro.style.animation = 'envelope-away 0.9s ease-in forwards';
      intro.style.pointerEvents = 'none';
      invitation.style.display = '';
      playMusic();
      setTimeout(function () { intro.style.display = 'none'; }, 900);
      setTimeout(startGentleScroll, 1500);
    });
  }

  if (musicToggle && audio) {
    musicToggle.addEventListener('click', function () {
      if (audio.paused) playMusic(); else pauseMusic();
    });
  }

  /* ---------- Nút chat ở góc ---------- */
  var chatClose = $('#chat-close');
  if (chatClose) {
    chatClose.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $('#chat-widget').style.display = 'none';
    });
  }

  /* ---------- Album ảnh (carousel 3D) + lightbox ---------- */
  var stage = $('#album-stage');
  var slides = stage ? $$(':scope > div', stage) : [];
  var dots = $$('#album-dots button');
  var lightbox = $('#lightbox');
  var current = 0;
  var timer = null;

  // [translateX %, translateZ px, rotateY deg, scale, opacity, z-index] theo khoảng cách tới ảnh đang chọn
  var POSE = [
    [0, 0, 0, 1, 1, 100],
    [60, -150, 45, 0.85, 0.75, 99],
    [120, -300, 90, 0.7, 0.5, 98],
    [180, -450, 135, 0.7, 0.3, 97]
  ];

  function offset(i) {
    var n = slides.length;
    var d = (((i - current) % n) + n) % n;
    return d > n / 2 ? d - n : d;
  }

  function render() {
    slides.forEach(function (el, i) {
      var d = offset(i);
      var p = POSE[Math.abs(d)];
      var sign = d > 0 ? 1 : d < 0 ? -1 : 0;
      el.style.transform = 'translateX(' + sign * p[0] + '%) translateZ(' + p[1] + 'px) rotateY(' +
        sign * p[2] + 'deg) scale(' + p[3] + ')';
      el.style.opacity = p[4];
      el.style.zIndex = p[5];
      el.classList.toggle('ring-2', d === 0);
      el.classList.toggle('ring-white/30', d === 0);
    });
    dots.forEach(function (b, i) {
      var on = i === current;
      b.classList.toggle('w-6', on);
      b.classList.toggle('opacity-70', on);
      b.classList.toggle('w-2', !on);
      b.classList.toggle('opacity-25', !on);
      b.classList.toggle('hover:opacity-40', !on);
    });
  }

  function go(i) {
    var n = slides.length;
    current = ((i % n) + n) % n;
    render();
  }

  function autoplay(on) {
    clearInterval(timer);
    if (on && slides.length) timer = setInterval(function () { go(current + 1); }, 4000);
  }

  if (stage) {
    slides.forEach(function (el, i) {
      el.addEventListener('click', function () {
        if (i === current) openLightbox(i); else go(i);
      });
    });
    dots.forEach(function (b, i) { b.addEventListener('click', function () { go(i); autoplay(true); }); });
    var prev = $('#album-prev');
    var next = $('#album-next');
    if (prev) prev.addEventListener('click', function () { go(current - 1); autoplay(true); });
    if (next) next.addEventListener('click', function () { go(current + 1); autoplay(true); });

    // vuốt ngang trên điện thoại
    var startX = null;
    stage.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); autoplay(true); }
    });
    stage.addEventListener('mouseenter', function () { autoplay(false); });
    stage.addEventListener('mouseleave', function () { autoplay(true); });
    autoplay(true);
  }

  /* lightbox */
  var lbIndex = 0;
  var lbImage = $('#lightbox-image');
  var lbCount = $('#lightbox-count');
  var lbThumbs = $$('#lightbox-thumbs button');

  function showLightbox(i) {
    var n = slides.length;
    lbIndex = ((i % n) + n) % n;
    var src = $('img', slides[lbIndex]).getAttribute('src');
    lbImage.setAttribute('src', src);
    lbImage.setAttribute('alt', 'Ảnh cưới ' + (lbIndex + 1));
    lbCount.textContent = (lbIndex + 1) + ' / ' + n;
    lbThumbs.forEach(function (b, k) {
      var on = k === lbIndex;
      b.classList.toggle('scale-105', on);
      b.classList.toggle('shadow-lg', on);
      b.classList.toggle('opacity-60', !on);
      b.classList.toggle('hover:opacity-100', !on);
      if (on) {
        b.setAttribute('aria-current', 'true');
        b.style.outline = '2px solid rgb(81, 20, 25)';
        b.style.outlineOffset = '2px';
      } else {
        b.removeAttribute('aria-current');
        b.style.outline = '';
        b.style.outlineOffset = '';
      }
    });
  }

  function openLightbox(i) {
    if (!lightbox) return;
    autoplay(false);
    showLightbox(i);
    lightbox.showModal();
  }

  if (lightbox) {
    $('#lightbox-prev').addEventListener('click', function (e) { e.stopPropagation(); showLightbox(lbIndex - 1); });
    $('#lightbox-next').addEventListener('click', function (e) { e.stopPropagation(); showLightbox(lbIndex + 1); });
    lbThumbs.forEach(function (b, k) {
      b.addEventListener('click', function (e) { e.stopPropagation(); showLightbox(k); });
    });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
      if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
    });
    lightbox.addEventListener('close', function () { go(lbIndex); autoplay(true); });
  }

  /* ---------- Hộp quà mừng ---------- */
  var giftOpen = $('#gift-open');
  var giftDialog = $('#gift-dialog');
  if (giftOpen && giftDialog) {
    giftOpen.addEventListener('click', function () { giftDialog.showModal(); });
    $('#gift-close').addEventListener('click', function () { giftDialog.close(); });
    $$('button', giftDialog).forEach(function (b) {
      if (b.textContent.indexOf('Lưu QR') === -1) return;
      b.addEventListener('click', function () {
        var img = $('img', b.parentNode);
        var a = document.createElement('a');
        a.href = img.getAttribute('src');
        a.download = a.href.split('/').pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    });
  }

  /* ---------- Sổ lưu bút ---------- */
  var form = $('#wish-form');
  var list = $('#wish-list');
  var STORE = 'thiepcuoi-quanglong:wishes';

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function stamp(d) {
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' ' +
      d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function addWish(name, message, time, save) {
    var item = list.firstElementChild.cloneNode(true);
    $('.font-semibold', item).textContent = name;
    $('.opacity-70', item).textContent = time;
    $('p', item).textContent = message;
    list.insertBefore(item, list.firstChild);
    if (save) {
      try {
        var all = JSON.parse(localStorage.getItem(STORE) || '[]');
        all.push({ name: name, message: message, time: time });
        localStorage.setItem(STORE, JSON.stringify(all));
      } catch (err) { /* bỏ qua nếu trình duyệt chặn localStorage */ }
    }
  }

  if (form && list) {
    try {
      JSON.parse(localStorage.getItem(STORE) || '[]').forEach(function (w) {
        addWish(w.name, w.message, w.time, false);
      });
    } catch (err) { /* ignore */ }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#wish-name').value.trim();
      var message = $('#wish-message').value.trim();
      if (!name || !message) return;
      addWish(name, message, stamp(new Date()), true);
      form.reset();
    });

    var SUGGEST = [
      'Chúc hai bạn trăm năm hạnh phúc, bên nhau đến đầu bạc răng long!',
      'Chúc mừng ngày trọng đại của hai bạn, luôn yêu thương và thấu hiểu nhau nhé!',
      'Chúc hai bạn mãi mãi hạnh phúc và sớm có tin vui!'
    ];
    var wand = $('button[type="button"]', form);
    if (wand) {
      wand.addEventListener('click', function () {
        $('#wish-message').value = SUGGEST[Math.floor(Math.random() * SUGGEST.length)];
      });
    }
  }

  /* ---------- Xác nhận tham dự ---------- */
  var rsvp = $('#rsvp-btn');
  if (rsvp && form) {
    rsvp.addEventListener('click', function () {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () { $('#wish-name').focus(); }, 500);
    });
  }
})();

/* ---------- Hiệu ứng hiện dần khi cuộn (scroll reveal) ---------- */
(function () {
  'use strict';
  var slice = function (x) { return Array.prototype.slice.call(x); };
  var frame = document.querySelector('.pc-frame');
  if (!frame) return;

  // Các hoa trang trí bị "kẹt" ở translateY(40px) trong bản tĩnh
  var stuck = slice(document.querySelectorAll('[style*="translateY(40px)"]'));

  // Gắn lớp hiện-dần cho các khối nội dung chính (bỏ qua nền trang trí)
  var blocks = slice(frame.children).filter(function (el) {
    if (el.getAttribute('aria-hidden') === 'true') return false;
    if (el.tagName === 'DIALOG') return false;
    var cls = (el.className && el.className.indexOf) ? el.className : '';
    if (cls.indexOf('absolute') > -1) return false;
    return true;
  });
  blocks.forEach(function (el) { el.classList.add('cd-reveal'); });

  function slideFloat(el) {
    el.classList.add('cd-float-reveal');
    if (el.style.transform) {
      el.style.transform = el.style.transform.replace('translateY(40px)', 'translateY(0px)');
    }
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('cd-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    blocks.forEach(function (el) { io.observe(el); });

    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { slideFloat(e.target); io2.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    stuck.forEach(function (el) { io2.observe(el); });
  } else {
    blocks.forEach(function (el) { el.classList.add('cd-in'); });
    stuck.forEach(slideFloat);
  }
})();

/* ---------- Tự co cỡ chữ tên để nằm gọn trên 1 dòng ---------- */
(function () {
  'use strict';
  var slice = function (x) { return Array.prototype.slice.call(x); };

  // Đo bề rộng text thật bằng 1 span ẩn (đúng kể cả khi căn giữa / tràn)
  var ruler = null;
  function measureWidth(text, cs, px) {
    if (!ruler) {
      ruler = document.createElement('span');
      ruler.setAttribute('aria-hidden', 'true');
      ruler.style.cssText = 'position:absolute;left:-99999px;top:-99999px;white-space:nowrap;visibility:hidden;pointer-events:none;';
      document.body.appendChild(ruler);
    }
    ruler.style.fontFamily = cs.fontFamily;
    ruler.style.fontWeight = cs.fontWeight;
    ruler.style.fontStyle = cs.fontStyle;
    ruler.style.letterSpacing = cs.letterSpacing;
    ruler.style.fontSize = px + 'px';
    ruler.textContent = text;
    return ruler.getBoundingClientRect().width;
  }

  function fitGroup(els, maxSize, minSize) {
    if (!els.length) return;
    var longest = els.reduce(function (a, b) {
      return (b.textContent.trim().length > a.textContent.trim().length) ? b : a;
    });
    var cs = getComputedStyle(longest);
    // bề rộng khả dụng = bề rộng ô chứa tên (đã được ràng width:100%)
    var avail = longest.clientWidth || (longest.parentElement && longest.parentElement.clientWidth) || 0;
    if (avail < 10) return;
    avail -= 2;
    var size = maxSize, guard = 0;
    while (size > minSize && measureWidth(longest.textContent, cs, size) > avail && guard < 800) {
      size -= 1; guard++;
    }
    var mustWrap = measureWidth(longest.textContent, cs, size) > avail;
    els.forEach(function (e) {
      e.style.whiteSpace = mustWrap ? 'normal' : 'nowrap';
      e.style.setProperty('font-size', size + 'px', 'important');
    });
  }

  function run() {
    var vw = window.innerWidth;
    var max = vw >= 1024 ? 92 : vw >= 768 ? 72 : 56;
    var min = vw >= 1024 ? 30 : 20;
    fitGroup(slice(document.querySelectorAll('.pc-frame header p.cd-script-name')), max, min);
    fitGroup(slice(document.querySelectorAll('.pc-frame h3.whitespace-nowrap')), max, min);
  }

  // Bảo đảm font Great Vibes đã tải xong rồi mới đo
  function runAfterFont() {
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load("40px 'Great Vibes'", 'Nguyễn Thị Minh Nguyệt'),
        document.fonts.load("90px 'Great Vibes'", 'Nguyễn Thị Minh Nguyệt')
      ]).then(run, run);
    }
    run();
  }

  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(run); }
  window.addEventListener('load', runAfterFont);
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(runAfterFont, 150); });
  setTimeout(runAfterFont, 300);
  setTimeout(runAfterFont, 900);
  setTimeout(runAfterFont, 1600);
})();
