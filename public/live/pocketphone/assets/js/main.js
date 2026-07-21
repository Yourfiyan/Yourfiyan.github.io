/* PocketPhone — interaction layer (no dependencies) */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Header state ---------- */
    var header = document.querySelector('[data-header]');
    var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    if (header) {
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- Mobile navigation ---------- */
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('site-nav');

    function setNav(open) {
        document.body.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            setNav(!document.body.classList.contains('nav-open'));
        });
        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) setNav(false);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
                setNav(false);
                toggle.focus();
            }
        });
    }

    /* ---------- Scroll reveals ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }

    /* ---------- Active nav link while scrolling ---------- */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('a[data-nav]'));
    var sections = navLinks
        .map(function (link) {
            var id = link.getAttribute('href');
            return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
        })
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        var current = null;
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) current = entry.target.id;
            });
            navLinks.forEach(function (link) {
                link.classList.toggle('active', link.getAttribute('href') === '#' + current);
            });
        }, { rootMargin: '-30% 0px -60% 0px' });
        sections.forEach(function (s) { sectionObserver.observe(s); });
    }

    /* ---------- Magnetic buttons (fine pointers, motion allowed) ---------- */
    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('[data-magnetic]').forEach(function (el) {
            var strength = 7;
            el.addEventListener('mousemove', function (e) {
                var r = el.getBoundingClientRect();
                var x = ((e.clientX - r.left) / r.width - 0.5) * 2;
                var y = ((e.clientY - r.top) / r.height - 0.5) * 2;
                el.style.transform = 'translate(' + (x * strength).toFixed(1) + 'px, ' + (y * strength).toFixed(1) + 'px)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
            });
        });
    }
})();
