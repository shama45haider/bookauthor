// Shared behavior for every page: image lightbox, mobile buy bar, copy-link button.
(function () {
  // Lightbox: book covers open on their own; haskama letters open as a gallery with prev/next
  var box = document.getElementById('lightbox');
  if (box && typeof box.showModal === 'function') {
    var img = box.querySelector('.lightbox-img');
    var lbBar = box.querySelector('.lightbox-bar');
    var nameEl = box.querySelector('.lightbox-name');
    var roleEl = box.querySelector('.lightbox-role');
    var countEl = box.querySelector('.lightbox-count');
    var fullEl = box.querySelector('.lightbox-full');
    var letters = Array.prototype.slice.call(document.querySelectorAll('.letter'));
    var current = -1;

    var setImage = function (src, alt) {
      img.removeAttribute('src'); // never show the previous image under the new caption
      img.alt = alt || '';
      img.src = src;
    };

    var openCover = function (btn) {
      current = -1;
      box.classList.remove('is-doc');
      if (lbBar) lbBar.hidden = true;
      box.setAttribute('aria-label', 'Enlarged cover');
      setImage(btn.dataset.full, btn.dataset.alt);
      if (!box.open) box.showModal();
    };

    var showLetter = function (i) {
      var n = letters.length;
      current = (i + n) % n;
      var b = letters[current];
      box.classList.add('is-doc');
      box.style.setProperty('--ar', b.dataset.w / b.dataset.h);
      setImage(b.dataset.full, b.dataset.alt);
      nameEl.textContent = b.dataset.name;
      roleEl.textContent = b.dataset.role || '';
      roleEl.hidden = !b.dataset.role;
      countEl.textContent = (current + 1) + ' of ' + n;
      fullEl.href = b.dataset.full;
      lbBar.hidden = false;
      box.setAttribute('aria-label', 'Haskama from ' + b.dataset.name);
      [current + 1, current - 1].forEach(function (j) {
        new Image().src = letters[(j + n) % n].dataset.full;
      });
      if (!box.open) box.showModal();
    };

    document.querySelectorAll('.zoomable').forEach(function (btn) {
      btn.addEventListener('click', function () { openCover(btn); });
    });
    letters.forEach(function (btn, i) {
      btn.addEventListener('click', function () { showLetter(i); });
    });
    document.querySelectorAll('.quote-letter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = letters.findIndex(function (l) { return l.dataset.id === btn.dataset.letter; });
        if (i > -1) showLetter(i);
      });
    });

    box.addEventListener('click', function (e) {
      var nav = e.target.closest('.lightbox-nav');
      if (nav) showLetter(current + Number(nav.dataset.step));
      else if (e.target === box || e.target.closest('.lightbox-close')) box.close();
    });
    box.addEventListener('keydown', function (e) {
      if (current < 0) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); showLetter(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); showLetter(current - 1); }
    });

    // Swipe between letters on touch screens (one finger only, so pinch-zoom still works)
    var startX = null, startY = 0;
    img.addEventListener('touchstart', function (e) {
      startX = (current > -1 && e.touches.length === 1) ? e.touches[0].clientX : null;
      startY = e.touches[0].clientY;
    }, { passive: true });
    img.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showLetter(current + (dx < 0 ? 1 : -1));
    });
  }

  // Mobile buy bar: hidden while any element marked data-hide-buybar is on screen
  var buybar = document.getElementById('buybar');
  var watched = document.querySelectorAll('[data-hide-buybar]');
  if (buybar && 'IntersectionObserver' in window) {
    var onScreen = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) onScreen.add(e.target); else onScreen.delete(e.target);
      });
      buybar.classList.toggle('show', onScreen.size === 0);
    });
    watched.forEach(function (el) { io.observe(el); });
    if (!watched.length) buybar.classList.add('show');
  }

  // Copy link
  var copy = document.getElementById('copy-link');
  if (copy) {
    copy.addEventListener('click', function () {
      var url = copy.dataset.url;
      var label = copy.querySelector('span');
      var done = function () {
        label.textContent = 'Link copied';
        setTimeout(function () { label.textContent = 'Copy link'; }, 2000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt('Copy this link:', url); });
      else prompt('Copy this link:', url);
    });
  }
})();
