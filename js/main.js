/* ============================================================
   DominaElLápiz — Interactividad
   ============================================================ */
(function () {
    'use strict';

    document.documentElement.classList.add('js');

    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

    /* ---------- Iconos ---------- */
    if (window.lucide) lucide.createIcons();

    /* ---------- Menú móvil ---------- */
    var menuBtn = $('#mobile-menu-btn');
    var mobileMenu = $('#mobile-menu');

    function closeMobileMenu() {
        if (!mobileMenu || !menuBtn) return;
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('overflow-hidden');
        var icon = menuBtn.querySelector('[data-lucide]');
        if (icon) icon.setAttribute('data-lucide', 'menu');
        if (window.lucide) lucide.createIcons();
    }

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function () {
            var open = mobileMenu.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.classList.toggle('overflow-hidden', open);
            var icon = menuBtn.querySelector('[data-lucide]');
            if (icon) icon.setAttribute('data-lucide', open ? 'x' : 'menu');
            if (window.lucide) lucide.createIcons();
        });

        $$('a', mobileMenu).forEach(function (link) {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', function (e) {
            if (mobileMenu.classList.contains('open') &&
                !mobileMenu.contains(e.target) &&
                !menuBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMobileMenu();
        });
    }

    /* ---------- Tabs (Sombreado) ---------- */
    $$('.tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var target = btn.getAttribute('data-tab');
            if (!target) return;

            $$('.tab-btn').forEach(function (b) { b.classList.remove('tab-active'); });
            $$('.tab-content').forEach(function (t) { t.classList.remove('active'); });

            btn.classList.add('tab-active');
            var panel = document.getElementById(target);
            if (panel) panel.classList.add('active');
        });
    });

    /* ---------- Scroll: navbar, progreso de lectura, scrollspy, botón arriba ---------- */
    var navbar = $('#navbar');
    var progressBar = $('#reading-progress');
    var backTop = $('#back-to-top');
    var sections = $$('main section[id]');
    var navLinks = $$('.nav-link');
    var ticking = false;

    function updateScrollspy() {
        if (!sections.length || !navLinks.length) return;
        var pos = window.scrollY + 140;
        var current = '';
        sections.forEach(function (sec) {
            if (sec.offsetTop <= pos) current = sec.getAttribute('id');
        });
        navLinks.forEach(function (link) {
            var isActive = link.getAttribute('href') === '#' + current;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    }

    function updateChrome() {
        var y = window.scrollY;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var pct = max > 0 ? (y / max) * 100 : 0;

        if (progressBar) progressBar.style.width = pct + '%';
        if (navbar) navbar.classList.toggle('scrolled', y > 20);
        if (backTop) backTop.classList.toggle('visible', y > 500);

        updateScrollspy();
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateChrome);
            ticking = true;
        }
    }, { passive: true });

    if (backTop) {
        backTop.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    updateChrome();

    /* ---------- Animaciones reveal ---------- */
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealEls = $$('.reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('active'); });
    } else {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
    }

    /* ---------- Plan de práctica (checklist con localStorage) ---------- */
    var STORAGE_KEY = 'dominaElLapiz_checklist_v1';
    var checkboxes = $$('.practice-check');
    var progressFill = $('#practice-progress-fill');
    var progressCount = $('#practice-count');
    var resetBtn = $('#practice-reset');

    function loadState() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { /* almacenamiento no disponible */ }
    }

    function updatePracticeProgress() {
        var total = checkboxes.length;
        var done = 0;
        checkboxes.forEach(function (cb) { if (cb.checked) done += 1; });
        var pct = total > 0 ? Math.round((done / total) * 100) : 0;

        if (progressFill) progressFill.style.width = pct + '%';
        if (progressCount) {
            progressCount.textContent = done + ' de ' + total + ' ejercicios';
        }
        if (total > 0 && done === total) {
            if (progressCount) progressCount.textContent = '¡Completado! Reinicia cuando quieras.';
        }
    }

    if (checkboxes.length) {
        var state = loadState();

        checkboxes.forEach(function (cb) {
            var id = cb.getAttribute('data-practice');
            if (id && state[id]) cb.checked = true;

            cb.addEventListener('change', function () {
                if (id) state[id] = cb.checked;
                saveState(state);
                updatePracticeProgress();
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                checkboxes.forEach(function (cb) { cb.checked = false; });
                saveState({});
                updatePracticeProgress();
            });
        }

        updatePracticeProgress();
    }
})();
