/* =========================================================
   SmartTrip Interactive Logic
   - Navbar: bayangan saat scroll, sembunyi saat scroll turun / muncul saat
     scroll naik, progress baca, dropdown, menu mobile dengan transisi.
   - Filter kategori di halaman rekomendasi.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('site-nav');
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const dropdowns = Array.from(document.querySelectorAll('.nav-dd'));

  /* ---------- Menu mobile ---------- */
  const setMobileMenu = (open) => {
    if (!menuBtn || !mobileMenu) return;
    mobileMenu.classList.toggle('open', open);
    menuBtn.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    const icon = menuBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars', !open);
      icon.classList.toggle('fa-xmark', open);
    }
    if (open && nav) nav.classList.remove('is-hidden');
  };

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => setMobileMenu(!mobileMenu.classList.contains('open')));
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMobileMenu(false)));
  }

  /* ---------- Dropdown desktop ---------- */
  const closeDropdowns = (except) => {
    dropdowns.forEach((dd) => {
      if (dd === except) return;
      dd.classList.remove('is-open');
      const b = dd.querySelector('.nav-dd-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  };

  dropdowns.forEach((dd) => {
    const btn = dd.querySelector('.nav-dd-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = !dd.classList.contains('is-open');
      closeDropdowns(dd);
      dd.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dd')) closeDropdowns();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openDd = dropdowns.find((dd) => dd.classList.contains('is-open'));
    closeDropdowns();
    if (openDd) openDd.querySelector('.nav-dd-btn').focus();
    setMobileMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) setMobileMenu(false);
  });

  /* ---------- Scroll: bayangan, sembunyi/muncul, progress ---------- */
  if (nav) {
    const progress = nav.querySelector('.nav-progress');
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      const menuOpen = mobileMenu && mobileMenu.classList.contains('open');
      const ddOpen = dropdowns.some((dd) => dd.classList.contains('is-open'));

      nav.classList.toggle('is-scrolled', y > 8);

      if (menuOpen || ddOpen || y < 120) {
        nav.classList.remove('is-hidden');
      } else if (y > lastY + 4) {
        nav.classList.add('is-hidden');
      } else if (y < lastY - 4) {
        nav.classList.remove('is-hidden');
      }

      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      }

      lastY = y;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
    onScroll();
  }

  /* ---------- Filter kategori (halaman rekomendasi) ---------- */
  const grid = document.querySelector('[data-filter-grid]');
  if (grid) {
    const chips = Array.from(document.querySelectorAll('[data-filter]'));
    const cards = Array.from(grid.querySelectorAll('[data-cat]'));
    const empty = document.querySelector('.filter-empty');

    const apply = (cat) => {
      let shown = 0;
      cards.forEach((c) => {
        const show = cat === 'all' || c.dataset.cat === cat;
        c.classList.toggle('hidden', !show);
        if (show) shown += 1;
      });
      chips.forEach((ch) => {
        const on = ch.dataset.filter === cat;
        ch.classList.toggle('is-active', on);
        ch.setAttribute('aria-pressed', String(on));
      });
      if (empty) empty.classList.toggle('hidden', shown > 0);
    };

    chips.forEach((ch) => ch.addEventListener('click', () => apply(ch.dataset.filter)));

    // Dukung tautan seperti destinasi.html?cat=budaya
    const wanted = new URLSearchParams(window.location.search).get('cat');
    apply(chips.some((ch) => ch.dataset.filter === wanted) ? wanted : 'all');
  }
});