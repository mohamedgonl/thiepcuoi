/* ============================================================
   render.js — Dựng thiệp theo nội dung trong file config (window.WEDDING).
   Mỗi route (nhà trai / nhà gái) có 1 file config.js riêng.
   - Text: điền vào các phần tử có data-k / data-k-html.
   - Ảnh/nhạc: khai báo tên file trong config (album[], cover, music).
       + album  -> media/album/<tên file>
       + cover  -> media/cover/<tên file>
       + music  -> media/music/<tên file>
   Không gọi mạng/API — mọi thứ lấy từ config.
   ============================================================ */
(function () {
  'use strict';
  var cfg = window.WEDDING || {};
  var SB = window.SHARED_BASE || '';   // tiền tố tới thư mục dùng chung (vd '../')
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ----- Góc nhìn A/B theo thứ tự hiển thị (order: 'groom' hoặc 'bride') -----
  var groom = cfg.groom || {}, bride = cfg.bride || {};
  var A = (cfg.order === 'bride') ? bride : groom;
  var B = (cfg.order === 'bride') ? groom : bride;
  var view = {
    side: cfg.side, saveTheDate: cfg.saveTheDate, invite: cfg.invite, footer: cfg.footer,
    ceremony: cfg.ceremony || {}, reception: cfg.reception || {}, venue: cfg.venue || {},
    nameA: A.name, fullA: A.full, roleA: A.role,
    nameB: B.name, fullB: B.full, roleB: B.role,
    pA: { father: A.father, mother: A.mother, hometown: A.hometown },
    pB: { father: B.father, mother: B.mother, hometown: B.hometown }
  };

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return (o == null) ? undefined : o[k]; }, obj);
  }

  // ----- Điền text -----
  function bindText() {
    $$('[data-k]').forEach(function (el) {
      var v = get(view, el.getAttribute('data-k'));
      if (v != null) el.textContent = v;
    });
    $$('[data-k-html]').forEach(function (el) {
      var v = get(view, el.getAttribute('data-k-html'));
      if (v != null) el.innerHTML = String(v).replace(/\n/g, '<br>');
    });
  }

  // ----- Album 3D -----
  function buildAlbum(files) {
    var stage = $('#album-stage'), dots = $('#album-dots'), thumbs = $('#lightbox-thumbs'), count = $('#lightbox-count');
    if (!stage) return;
    var urls = (files || []).map(function (n) { return SB + 'media/album/' + n; });
    if (!urls.length) { var sec = stage.closest('.overflow-x-clip'); if (sec) sec.style.display = 'none'; return; }
    stage.innerHTML = ''; if (dots) dots.innerHTML = ''; if (thumbs) thumbs.innerHTML = '';
    urls.forEach(function (url, i) {
      var slide = document.createElement('div');
      slide.className = 'absolute h-[92%] rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all ease-in-out';
      slide.style.cssText = 'aspect-ratio:0.667/1;transition-duration:1100ms;opacity:0;';
      var img = document.createElement('img');
      img.className = 'h-full w-full object-cover'; img.src = url; img.alt = 'Ảnh cưới ' + (i + 1);
      img.style.objectPosition = '50% 50%'; slide.appendChild(img); stage.appendChild(slide);
      if (dots) { var d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', 'Ảnh ' + (i + 1)); d.className = 'rounded-full transition-all duration-300 w-2 h-2 bg-current opacity-25 hover:opacity-40'; dots.appendChild(d); }
      if (thumbs) {
        var tb = document.createElement('button'); tb.type = 'button'; tb.className = 'flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md sm:rounded-lg overflow-hidden transition-all duration-200 opacity-60 hover:opacity-100'; tb.setAttribute('aria-label', 'Xem ảnh ' + (i + 1));
        var ti = document.createElement('img'); ti.className = 'h-full w-full object-cover'; ti.alt = 'Thumbnail ' + (i + 1); ti.draggable = false; ti.src = url; tb.appendChild(ti); thumbs.appendChild(tb);
      }
    });
    if (count) count.textContent = '1 / ' + urls.length;
    var lb = $('#lightbox-image'); if (lb) lb.src = urls[0];
    // Nhiều ảnh thì ẩn hàng chấm cho gọn (vẫn dùng mũi tên / vuốt / lightbox)
    if (dots && urls.length > 14) dots.style.display = 'none';
  }

  function setCover() { var el = $('#cover-photo'); if (el && cfg.cover) el.src = SB + 'media/album/' + cfg.cover; }
  function setMusic() { var a = $('audio'); if (a && cfg.music) a.src = SB + 'media/music/' + cfg.music; }

  // ----- Lịch trình ngày cưới -----
  var ICONS = { camera: 'camera.webp', cake: 'cake.webp', cook: 'cook.webp' };
  function buildTimeline() {
    var ol = $('[data-timeline]'); if (!ol) return;
    var items = cfg.timeline || []; ol.innerHTML = '';
    items.forEach(function (it, i) {
      var li = document.createElement('li'); li.className = 'contents';
      var first = i === 0, last = i === items.length - 1;
      var iconHtml = it.icon && ICONS[it.icon]
        ? '<span class="relative inline-block"><span aria-hidden="true" class="absolute top-1/2 flex items-center justify-center -translate-y-1/2 right-full" style="margin-right: 30px;"><img alt="" aria-hidden="true" class="block h-10 w-10 shrink-0 object-contain" src="' + SB + 'assets/img/' + ICONS[it.icon] + '"></span>' + it.time + '</span>'
        : it.time;
      var lineTop = first ? 'top-1/2' : '-top-8 md:-top-10';
      var lineBot = last ? 'bottom-1/2' : '-bottom-8 md:-bottom-10';
      li.innerHTML =
        '<span class="pt-0.5 text-right text-[16px] md:text-[17px] tabular-nums tracking-wide leading-snug" style="color: rgb(236, 228, 216); font-family: \'Times New Roman\', serif;">' + iconHtml + '</span>' +
        '<span aria-hidden="true" class="relative flex items-center justify-center self-stretch"><span class="absolute left-1/2 -translate-x-1/2 w-px ' + lineTop + ' ' + lineBot + '" style="background-color: color-mix(in srgb, rgb(236, 228, 216) 40%, transparent 60%);"></span><span class="relative block h-2.5 w-2.5 rounded-full" style="background-color: rgb(236, 228, 216); box-shadow: color-mix(in srgb, rgb(236, 228, 216) 13%, transparent 87%) 0px 0px 0px 2px;"></span></span>' +
        '<span class="text-[13px] md:text-[15px]" style="color: rgba(236, 228, 216, 0.7); font-family: \'Times New Roman\', serif;"><span dir="auto">' + it.label + '</span></span>';
      ol.appendChild(li);
    });
  }

  // ----- Lịch (calendar) tháng của tiệc cưới -----
  function buildCalendar() {
    var box = $('[data-calendar]'); if (!box) return;
    var r = cfg.reception || {};
    var month = +r.calMonth || +((cfg.ceremony || {}).month) || 11;
    var year = +r.calYear || +((cfg.ceremony || {}).year) || 2026;
    var hi = +r.highlightDay || +((cfg.ceremony || {}).day) || 0;
    var title = $('[data-cal-title]'); if (title) title.textContent = 'Tháng ' + month + ' / ' + year;
    var daysInMonth = new Date(year, month, 0).getDate();
    var firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Mon=0
    var cells = '';
    for (var b = 0; b < firstDow; b++) cells += '<div class="flex items-center justify-center h-[30px] md:h-[34px]"></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      if (d === hi) {
        cells += '<div class="flex items-center justify-center h-[30px] md:h-[34px]"><div class="relative w-[26px] h-[24px] md:w-[30px] md:h-[28px] flex items-center justify-center"><svg viewBox="0 0 24 22" class="absolute inset-0 w-full h-full drop-shadow-sm" fill="#511419"><path d="M12 21C12 21 1.5 13.5 1.5 7.5C1.5 4.46 3.96 2 7 2C8.76 2 10.35 2.81 11.4 4.09L12 4.8L12.6 4.09C13.65 2.81 15.24 2 17 2C20.04 2 22.5 4.46 22.5 7.5C22.5 13.5 12 21 12 21Z"/></svg><span class="relative z-10 text-[11px] md:text-[12px] font-bold" style="color: rgb(255, 255, 255);">' + d + '</span></div></div>';
      } else {
        cells += '<div class="flex items-center justify-center h-[30px] md:h-[34px]"><span class="text-[12px] md:text-[13px]">' + d + '</span></div>';
      }
    }
    box.innerHTML = cells;
  }

  // ----- Bản đồ + chỉ đường + thêm vào lịch -----
  function setLinks() {
    var v = cfg.venue || {};
    var iframe = $('[data-map]');
    if (iframe && v.mapQuery) iframe.src = 'https://www.google.com/maps?q=' + encodeURIComponent(v.mapQuery) + '&output=embed';
    var dir = $('[data-directions]');
    if (dir && (v.directionsQuery || v.mapQuery)) dir.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(v.directionsQuery || v.mapQuery);
    var cal = $('[data-addcal]');
    if (cal && cfg.reception && cfg.reception.calendarUrl) cal.href = cfg.reception.calendarUrl;
  }

  // ----- Hộp quà mừng -----
  function buildGift() {
    var g = cfg.gift; if (!g) return;
    function fill(prefix, data, label) {
      if (!data) return;
      var h = $('[data-gift="' + prefix + '-title"]'); if (h) h.textContent = label + ' - ' + (data.name || '');
      var img = $('[data-gift="' + prefix + '-qr"]'); if (img && data.qr) img.src = data.qr;
      var bank = $('[data-gift="' + prefix + '-bank"]'); if (bank) bank.textContent = data.bank || '';
      var acc = $('[data-gift="' + prefix + '-acc"]'); if (acc) acc.textContent = data.acc || '';
      var nm = $('[data-gift="' + prefix + '-name"]'); if (nm) nm.textContent = data.name || '';
    }
    fill('groom', g.groom, 'Chú Rể');
    fill('bride', g.bride, 'Cô Dâu');
  }

  function loadScript(src) { var s = document.createElement('script'); s.src = src; document.body.appendChild(s); }

  function run() {
    try {
      bindText(); buildTimeline(); buildCalendar(); setLinks(); buildGift();
      buildAlbum(cfg.album); setCover(); setMusic();
    } catch (e) { /* vẫn nạp script để trang không vỡ */ }
    loadScript(SB + 'js/script.js');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
