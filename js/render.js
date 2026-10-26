/* ============================================================
   render.js — Tự động nạp ảnh/nhạc từ các thư mục trong repo.
   Bạn chỉ cần THÊM / XOÁ file trong các thư mục sau là web tự cập nhật:
     media/album/   -> ảnh album (hiện hết, sắp theo tên file: 01,02,03...)
     media/cover/   -> ảnh trong phong bì đầu thiệp (lấy file đầu tiên)
     media/music/   -> nhạc nền (lấy file đầu tiên)
   Cách hoạt động: gọi GitHub Contents API để liệt kê file trong thư mục.
   Nếu API lỗi (offline/giới hạn) thì đọc manifest.json dự phòng trong thư mục đó.
   ============================================================ */
(function () {
  'use strict';

  // --- Cấu hình repo (đổi nếu bạn fork / đổi host) ---
  var REPO = 'mohamedgonl/thiepcuoi';
  var BRANCH = 'main';
  // Thư mục gốc của trang hiện tại so với gốc repo (route sau này sẽ set khác)
  var BASE = (window.MEDIA_BASE || '').replace(/^\/+|\/+$/g, ''); // '' = gốc
  var basePrefix = BASE ? BASE + '/' : '';

  var isImg = function (n) { return /\.(webp|jpe?g|png|gif|avif)$/i.test(n); };
  var isAudio = function (n) { return /\.(mp3|ogg|m4a|wav|aac)$/i.test(n); };
  var natSort = function (a, b) { return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }); };

  // Liệt kê file trong 1 thư mục (trả về mảng tên file)
  function listFolder(path) {
    var repoPath = (basePrefix + path).replace(/^\/+/, '');
    var api = 'https://api.github.com/repos/' + REPO + '/contents/' + repoPath + '?ref=' + BRANCH;
    return fetch(api, { headers: { 'Accept': 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error('api ' + r.status); return r.json(); })
      .then(function (j) {
        if (!Array.isArray(j)) throw new Error('not array');
        return j.filter(function (f) { return f.type === 'file'; }).map(function (f) { return f.name; });
      })
      .catch(function () {
        // Fallback: manifest.json trong thư mục (mảng tên file)
        return fetch(path + '/manifest.json', { cache: 'no-store' })
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (arr) { return Array.isArray(arr) ? arr : []; })
          .catch(function () { return []; });
      });
  }

  var $ = function (s) { return document.querySelector(s); };

  // --- Dựng album 3D từ danh sách ảnh ---
  function buildAlbum(urls) {
    var stage = $('#album-stage');
    var dots = $('#album-dots');
    var thumbs = $('#lightbox-thumbs');
    var count = $('#lightbox-count');
    if (!stage) return;
    if (!urls.length) {
      // Không có ảnh -> ẩn mục album cho gọn
      var sec = stage.closest('.overflow-x-clip');
      if (sec) sec.style.display = 'none';
      return;
    }
    stage.innerHTML = '';
    if (dots) dots.innerHTML = '';
    if (thumbs) thumbs.innerHTML = '';

    urls.forEach(function (url, i) {
      var slide = document.createElement('div');
      slide.className = 'absolute h-[92%] rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all ease-in-out';
      slide.style.cssText = 'aspect-ratio:0.667/1;transition-duration:1100ms;opacity:0;';
      var img = document.createElement('img');
      img.className = 'h-full w-full object-cover';
      img.src = url;
      img.alt = 'Ảnh cưới ' + (i + 1);
      img.style.objectPosition = '50% 50%';
      slide.appendChild(img);
      stage.appendChild(slide);

      if (dots) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Ảnh ' + (i + 1));
        dot.className = 'rounded-full transition-all duration-300 w-2 h-2 bg-current opacity-25 hover:opacity-40';
        dots.appendChild(dot);
      }
      if (thumbs) {
        var tb = document.createElement('button');
        tb.type = 'button';
        tb.className = 'flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md sm:rounded-lg overflow-hidden transition-all duration-200 opacity-60 hover:opacity-100';
        tb.setAttribute('aria-label', 'Xem ảnh ' + (i + 1));
        var tbimg = document.createElement('img');
        tbimg.className = 'h-full w-full object-cover';
        tbimg.alt = 'Thumbnail ' + (i + 1);
        tbimg.draggable = false;
        tbimg.src = url;
        tb.appendChild(tbimg);
        thumbs.appendChild(tb);
      }
    });
    if (count) count.textContent = '1 / ' + urls.length;
    var lbImg = $('#lightbox-image');
    if (lbImg) lbImg.src = urls[0];
  }

  function setCover(url) {
    var el = $('#cover-photo');
    if (el && url) el.src = url;
  }
  function setMusic(url) {
    var a = document.querySelector('audio');
    if (a && url) { a.src = url; }
  }

  function loadScript(src) {
    var s = document.createElement('script');
    s.src = src;
    document.body.appendChild(s);
  }

  // --- Chạy ---
  function start() {
    Promise.all([
      listFolder('media/album'),
      listFolder('media/cover'),
      listFolder('media/music')
    ]).then(function (res) {
      var album = res[0].filter(isImg).sort(natSort).map(function (n) { return basePrefix + 'media/album/' + n; });
      var cover = res[1].filter(isImg).sort(natSort);
      var music = res[2].filter(isAudio).sort(natSort);
      buildAlbum(album);
      if (cover.length) setCover(basePrefix + 'media/cover/' + cover[0]);
      if (music.length) setMusic(basePrefix + 'media/music/' + music[0]);
    }).catch(function () {
      buildAlbum([]);
    }).then(function () {
      // Nạp script hành vi SAU khi album đã dựng xong
      loadScript((window.SCRIPT_BASE || '') + 'js/script.js');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
