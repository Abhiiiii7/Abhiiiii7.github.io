/**
 * Abhinav Varma Konderu - Portfolio (STATIC site)
 * Adapted from prashantkoirala465/web-development-portfolio
 *
 * All content is baked into index.html. This script is PROGRESSIVE
 * ENHANCEMENT only: the site is fully functional with JavaScript disabled.
 *
 * Responsibilities:
 *   - Hero char-split + entrance animation (wraps chars at runtime)
 *   - GSAP scroll reveals (with immediateRender:false safety)
 *   - Lenis smooth scroll
 *   - Nav overlay toggle (aria-expanded, directly bound)
 *   - Smooth anchor scrolling
 *   - Floating decorative tags + footer particles
 *
 * Hard guarantees:
 *   - prefers-reduced-motion: skips Lenis, ALL GSAP, particles, floating
 *     tags; content stays visible.
 *   - Content is NEVER left stuck-hidden: scroll-triggered gsap.from() uses
 *     immediateRender:false, and all init is wrapped in try/catch that
 *     restores visibility on failure.
 */

(function () {
  'use strict';

  // =========================================================================
  // Capability + motion-preference detection
  // =========================================================================
  var hasGSAP = typeof gsap !== 'undefined';
  var hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== 'undefined';
  var hasLenis = typeof Lenis !== 'undefined';

  var reduce = false;
  try {
    reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    reduce = false;
  }

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Elements whose CSS initial state may be hidden (opacity:0) awaiting GSAP.
  // If anything goes wrong, or motion is reduced, these MUST be made visible.
  var REVEAL_SELECTORS = [
    '.hero-greeting',
    '.hero-title',
    '.hero-footer',
    '.section-label',
    '.about-heading',
    '.about-bio p',
    '.about-philosophy',
    '.highlight-item',
    '.experience-item',
    '.skills-header h2',
    '.skill-category',
    '.projects-heading',
    '.project-visual',
    '.project-info',
    '.education-heading',
    '.education-item',
    '.contact-heading',
    '.contact-subheading',
    '.contact-detail-item',
    '.contact-email-btn',
    '.footer-container',
  ];

  // Make all potentially-animated content visible (failsafe / reduced motion).
  function forceVisible() {
    // Hero name characters (wrapped at runtime) sit at translateY(100%)/opacity:0.
    var chars = document.querySelectorAll('.hero-name-line .char');
    for (var i = 0; i < chars.length; i++) {
      chars[i].style.transform = 'none';
      chars[i].style.opacity = '1';
    }

    if (hasGSAP) {
      // Use GSAP to clear any inline state it may have applied.
      for (var s = 0; s < REVEAL_SELECTORS.length; s++) {
        try {
          gsap.set(REVEAL_SELECTORS[s], { clearProps: 'all', opacity: 1 });
        } catch (e) {
          /* selector may match nothing; ignore */
        }
      }
    } else {
      // No GSAP: clear inline opacity/transform directly.
      var els = document.querySelectorAll(REVEAL_SELECTORS.join(','));
      for (var j = 0; j < els.length; j++) {
        els[j].style.opacity = '1';
        els[j].style.transform = 'none';
      }
    }
  }

  // =========================================================================
  // Hero char-split (wrap chars at runtime from STATIC text)
  // =========================================================================
  function splitHeroChars() {
    var lines = [
      document.getElementById('heroName1'),
      document.getElementById('heroName2'),
    ];

    lines.forEach(function (el) {
      if (!el) return;
      var text = el.textContent;
      if (!text) return;

      var frag = document.createDocumentFragment();
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (ch === ' ') {
          frag.appendChild(document.createTextNode(' '));
          continue;
        }
        var span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        span.setAttribute('aria-hidden', 'true');
        // Only pre-hide when motion is allowed; otherwise leave natural.
        if (!reduce && hasGSAP) {
          span.style.display = 'inline-block';
          span.style.transform = 'translateY(100%)';
          span.style.opacity = '0';
        }
        frag.appendChild(span);
      }

      // Preserve the readable text for screen readers / no-JS parity.
      el.setAttribute('aria-label', text);
      el.textContent = '';
      el.appendChild(frag);
    });
  }

  // =========================================================================
  // Lenis smooth scroll
  // =========================================================================
  function initLenis() {
    if (!hasLenis || !hasGSAP || !hasScrollTrigger) return null;

    var isMobile = window.innerWidth <= 900;
    var lenis = new Lenis({
      duration: isMobile ? 1 : 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      orientation: 'vertical',
      smoothWheel: true,
      syncTouch: true,
      lerp: isMobile ? 0.05 : 0.1,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return lenis;
  }

  // =========================================================================
  // Navigation overlay toggle (static markup, directly bound)
  // =========================================================================
  function initNavigation() {
    var menuToggle = document.getElementById('menuToggle');
    var navOverlay = document.getElementById('navOverlay');
    if (!menuToggle || !navOverlay) return;

    var isOpen = false;
    var scrollY = 0;

    function open() {
      isOpen = true;
      scrollY = window.scrollY;
      menuToggle.classList.add('active');
      navOverlay.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollY + 'px';
      document.body.style.width = '100%';
    }

    function close() {
      isOpen = false;
      menuToggle.classList.remove('active');
      navOverlay.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }

    menuToggle.addEventListener('click', function () {
      if (isOpen) {
        close();
      } else {
        open();
      }
    });

    // Close when an overlay link is activated (markup is static — bind now).
    var overlayLinks = navOverlay.querySelectorAll('a');
    for (var i = 0; i < overlayLinks.length; i++) {
      overlayLinks[i].addEventListener('click', function () {
        if (isOpen) close();
      });
    }

    // Close on Escape for keyboard users.
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.keyCode === 27) && isOpen) close();
    });
  }

  // =========================================================================
  // Smooth anchor scrolling
  // =========================================================================
  function initSmoothAnchors(lenis) {
    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: 0, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        }
      });
    }
  }

  // =========================================================================
  // GSAP scroll reveals (all gsap.from use immediateRender:false)
  // =========================================================================
  function initAnimations() {
    if (!hasGSAP || !hasScrollTrigger) return;

    var ST = { toggleActions: 'play none none none' };

    // Shared scroll-reveal helper: immediateRender:false guarantees that a
    // trigger which never fires leaves the element in its natural (visible)
    // state instead of stuck at the "from" values.
    function reveal(target, from, triggerOpts) {
      var trigger = (triggerOpts && triggerOpts.trigger) || target;
      var start = (triggerOpts && triggerOpts.start) || 'top 85%';
      var vars = {};
      for (var k in from) {
        if (Object.prototype.hasOwnProperty.call(from, k)) vars[k] = from[k];
      }
      vars.immediateRender = false;
      vars.scrollTrigger = { trigger: trigger, start: start };
      vars.scrollTrigger.toggleActions = ST.toggleActions;
      return gsap.from(target, vars);
    }

    // --- Hero entrance (above the fold; safe to render immediately) ---
    var heroTl = gsap.timeline({ delay: 0.4 });
    heroTl
      .from('.hero-greeting', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' })
      .to('.hero-name-1 .char', { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'power4.out' }, '-=0.4')
      .to('.hero-name-2 .char', { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'power4.out' }, '-=0.4')
      .from('.hero-title', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .from('.hero-footer', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4');

    // --- About ---
    reveal('.about .section-label', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, { trigger: '.about', start: 'top 80%' });
    reveal('.about-heading', { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out' }, { trigger: '.about', start: 'top 75%' });
    reveal('.about-bio p', { y: 40, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' }, { trigger: '.about-bio', start: 'top 80%' });
    reveal('.about-philosophy', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, { trigger: '.about-philosophy', start: 'top 90%' });
    reveal('.highlight-item', { y: 40, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, { trigger: '.about-highlights', start: 'top 80%' });

    // --- Experience ---
    reveal('.experience .section-label', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, { trigger: '.experience', start: 'top 80%' });
    var expItems = document.querySelectorAll('.experience-item');
    expItems.forEach(function (item, index) {
      reveal(item, { y: 50, opacity: 0, duration: 0.7, delay: index * 0.05, ease: 'power3.out' }, { trigger: item, start: 'top 85%' });
    });

    // --- Skills ---
    reveal('.skills .section-label', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, { trigger: '.skills', start: 'top 80%' });
    reveal('.skills-header h2', { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out' }, { trigger: '.skills', start: 'top 75%' });
    var skillCats = document.querySelectorAll('.skill-category');
    skillCats.forEach(function (cat, index) {
      reveal(cat, { y: 60, opacity: 0, scale: 0.9, duration: 0.7, delay: index * 0.08, ease: 'power3.out' }, { trigger: cat, start: 'top 85%' });
    });

    // --- Projects (alternating reveals) ---
    reveal('.projects .section-label', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, { trigger: '.projects', start: 'top 80%' });
    reveal('.projects-heading', { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out' }, { trigger: '.projects', start: 'top 75%' });
    var projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(function (item, index) {
      var visual = item.querySelector('.project-visual');
      var info = item.querySelector('.project-info');
      var isEven = index % 2 === 1;
      if (visual) {
        reveal(visual, { x: isEven ? 80 : -80, opacity: 0, duration: 0.9, ease: 'power3.out' }, { trigger: item, start: 'top 80%' });
      }
      if (info) {
        reveal(info, { x: isEven ? -60 : 60, opacity: 0, duration: 0.9, delay: 0.15, ease: 'power3.out' }, { trigger: item, start: 'top 80%' });
      }
    });

    // --- Education ---
    reveal('.education .section-label', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, { trigger: '.education', start: 'top 80%' });
    reveal('.education-heading', { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out' }, { trigger: '.education', start: 'top 75%' });
    var eduItems = document.querySelectorAll('.education-item');
    eduItems.forEach(function (item, index) {
      reveal(item, { y: 40, opacity: 0, duration: 0.7, delay: index * 0.08, ease: 'power3.out' }, { trigger: item, start: 'top 85%' });
    });

    // --- Contact ---
    reveal('.contact .section-label', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, { trigger: '.contact', start: 'top 80%' });
    reveal('.contact-heading', { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out' }, { trigger: '.contact', start: 'top 75%' });
    reveal('.contact-subheading', { y: 30, opacity: 0, duration: 0.7, delay: 0.1, ease: 'power3.out' }, { trigger: '.contact', start: 'top 70%' });
    reveal('.contact-detail-item', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, { trigger: '.contact-details', start: 'top 85%' });
    reveal('.contact-email-btn', { y: 30, opacity: 0, scale: 0.9, duration: 0.7, ease: 'power3.out' }, { trigger: '.contact-cta', start: 'top 90%' });

    // --- Footer ---
    reveal('.footer-container', { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out' }, { trigger: 'footer', start: 'top 85%' });

    // --- Parallax hero text (scrub; not visibility-critical) ---
    gsap.to('.hero-name-1', {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
      y: -100,
      opacity: 0.3,
    });
    gsap.to('.hero-name-2', {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
      y: -60,
      opacity: 0.3,
    });

    // Decorative enhancements.
    addFloatingTags();
    initFooterParticles();

    // Recalculate trigger positions once layout settles.
    ScrollTrigger.refresh();
  }

  // =========================================================================
  // Floating decorative tags (About section)
  // =========================================================================
  function addFloatingTags() {
    var aboutSection = document.querySelector('.about');
    if (!aboutSection || !hasGSAP || !hasScrollTrigger) return;

    var tags = ['SQL', 'Power BI', 'Python', 'Forecast', 'Dashboards'];
    var positions = [
      { top: '15%', left: '5%', rot: -12 },
      { top: '25%', right: '8%', rot: 8 },
      { top: '60%', left: '3%', rot: -5 },
      { top: '70%', right: '5%', rot: 15 },
      { top: '45%', right: '12%', rot: -8 },
    ];

    tags.forEach(function (text, i) {
      var pos = positions[i];
      var tag = document.createElement('div');
      tag.className = 'floating-tag';
      tag.textContent = text;
      tag.setAttribute('aria-hidden', 'true');
      tag.style.top = pos.top;
      if (pos.left) tag.style.left = pos.left;
      if (pos.right) tag.style.right = pos.right;
      tag.style.transform = 'rotate(' + pos.rot + 'deg)';
      aboutSection.appendChild(tag);

      if (window.innerWidth > 1000) {
        gsap.to(tag, {
          scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 1 },
          y: -(150 + Math.random() * 250),
          rotation: pos.rot + (Math.random() - 0.5) * 30,
          ease: 'none',
        });
      }
    });
  }

  // =========================================================================
  // Footer particle burst
  // =========================================================================
  function initFooterParticles() {
    if (!hasGSAP || !hasScrollTrigger) return;

    var footerContainer = document.querySelector('.footer-container');
    if (!footerContainer) return;

    var colors = ['#ed6a5a', '#f4f1bb', '#9bc1bc', '#5d576b', '#edf1e8'];
    var particles = [];
    var exploded = false;

    for (var i = 0; i < 20; i++) {
      var particle = document.createElement('div');
      particle.className = 'footer-particle';
      particle.setAttribute('aria-hidden', 'true');
      particle.style.background = colors[i % colors.length];
      particle.style.width = (6 + Math.random() * 12) + 'px';
      particle.style.height = particle.style.width;
      particle.style.left = (10 + Math.random() * 80) + '%';
      particle.style.top = '50%';
      particle.style.opacity = '0';
      footerContainer.appendChild(particle);
      particles.push(particle);
    }

    ScrollTrigger.create({
      trigger: 'footer',
      start: 'top 80%',
      onEnter: function () {
        if (exploded) return;
        exploded = true;
        particles.forEach(function (p, idx) {
          var angle = (Math.random() - 0.5) * Math.PI;
          var distance = 100 + Math.random() * 200;
          var xEnd = Math.cos(angle) * distance;
          var yEnd = -Math.abs(Math.sin(angle) * distance) - 50;
          gsap.fromTo(
            p,
            { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 },
            {
              x: xEnd,
              y: yEnd,
              scale: 0,
              rotation: (Math.random() - 0.5) * 720,
              opacity: 0,
              duration: 1.2 + Math.random() * 0.8,
              delay: idx * 0.03,
              ease: 'power2.out',
            }
          );
        });
      },
      onLeaveBack: function () {
        exploded = false;
        particles.forEach(function (p) {
          gsap.set(p, { opacity: 0, x: 0, y: 0, scale: 1, rotation: 0 });
        });
      },
    });
  }

  // =========================================================================
  // Dashboard lightbox / gallery (works with or without motion/GSAP)
  // =========================================================================
  var GALLERIES = {
    'ai-supply-chain': [
      { src: 'assets/projects/ai-supply-chain/01-overview.webp', caption: 'Supply chain overview — KPI cards, profit by region and shipping mode' },
      { src: 'assets/projects/ai-supply-chain/02-regional.webp', caption: 'Regional delivery and risk intelligence' },
      { src: 'assets/projects/ai-supply-chain/03-profitability.webp', caption: 'Profitability intelligence' },
      { src: 'assets/projects/ai-supply-chain/04-shipping.webp', caption: 'Shipping-mode delivery-risk intelligence' },
      { src: 'assets/projects/ai-supply-chain/05-ai-insights.webp', caption: 'GenAI-generated executive insights' },
    ],
    'healthcare-pricing': [
      { src: 'assets/projects/healthcare-pricing/01-median-price.webp', caption: 'Median negotiated price by insurer' },
      { src: 'assets/projects/healthcare-pricing/02-cpt-mean.webp', caption: 'Mean price by CPT procedure' },
      { src: 'assets/projects/healthcare-pricing/03-payer-gross.webp', caption: 'Mean gross charge by CPT and payer' },
      { src: 'assets/projects/healthcare-pricing/04-payer-mix.webp', caption: 'Payer-mix distribution' },
      { src: 'assets/projects/healthcare-pricing/05-mean-vs-median.webp', caption: 'Mean vs. median gross charge' },
    ],
    'ecommerce-forecast': [
      { src: 'assets/projects/ecommerce-forecast/01-executive.webp', caption: 'Executive revenue overview' },
      { src: 'assets/projects/ecommerce-forecast/02-forecast.webp', caption: 'Revenue forecast projection' },
      { src: 'assets/projects/ecommerce-forecast/03-seasonality.webp', caption: 'Seasonality and demand patterns' },
      { src: 'assets/projects/ecommerce-forecast/04-seller.webp', caption: 'Seller performance analysis' },
    ],
    'creator-economy': [
      { src: 'assets/projects/creator-economy/01-chart.webp', caption: 'Algorithmic amplification analysis' },
      { src: 'assets/projects/creator-economy/02-chart.webp', caption: 'Engagement efficiency analysis' },
      { src: 'assets/projects/creator-economy/03-chart.webp', caption: 'Creator authority vs. visibility' },
      { src: 'assets/projects/creator-economy/04-chart.webp', caption: 'Regression model output' },
      { src: 'assets/projects/creator-economy/05-chart.webp', caption: 'Scale-efficiency tradeoff' },
    ],
    'indo-swiss': [
      { src: 'assets/exp/indo-swiss-convention.webp', caption: '10th Annual Convention — Indo Swiss Remedies' },
    ],
    dataharbor: [
      { src: 'assets/exp/dataharbor-bootcamp.webp', caption: 'DataHarbor bootcamp for CS students — Anurag University' },
    ],
    nilora: [
      { src: 'assets/exp/nilora-cofounder.webp', caption: 'Co-Founder — Nilora Organics' },
    ],
  };

  function initGallery() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var imgEl = document.getElementById('lightboxImage');
    var capEl = document.getElementById('lightboxCaption');
    var counterEl = document.getElementById('lightboxCounter');
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');
    var closeBtn = document.getElementById('lightboxClose');
    if (!imgEl || !prevBtn || !nextBtn || !closeBtn) return;

    var current = null;
    var index = 0;
    var lastFocused = null;
    var startX = 0;

    function render() {
      var item = current[index];
      imgEl.src = item.src;
      imgEl.alt = item.caption || '';
      if (capEl) capEl.textContent = item.caption || '';
      var multi = current.length > 1;
      if (counterEl) {
        counterEl.textContent = index + 1 + ' / ' + current.length;
        counterEl.style.display = multi ? '' : 'none';
      }
      prevBtn.style.display = multi ? '' : 'none';
      nextBtn.style.display = multi ? '' : 'none';
    }

    function openGallery(key) {
      var images = GALLERIES[key];
      if (!images || !images.length) return;
      current = images;
      index = 0;
      lastFocused = document.activeElement;
      lightbox.removeAttribute('hidden');
      document.body.classList.add('lightbox-open');
      render();
      closeBtn.focus();
    }

    function closeGallery() {
      lightbox.setAttribute('hidden', '');
      document.body.classList.remove('lightbox-open');
      imgEl.src = '';
      current = null;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function next() {
      if (!current) return;
      index = (index + 1) % current.length;
      render();
    }

    function prev() {
      if (!current) return;
      index = (index - 1 + current.length) % current.length;
      render();
    }

    var triggers = document.querySelectorAll('[data-gallery]');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', function (e) {
        e.preventDefault();
        openGallery(this.getAttribute('data-gallery'));
      });
    }

    closeBtn.addEventListener('click', closeGallery);
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    lightbox.addEventListener('click', function (e) {
      if (e.target && e.target.getAttribute && e.target.getAttribute('data-close') === 'true') {
        closeGallery();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hasAttribute('hidden')) return;
      if (e.key === 'Escape' || e.keyCode === 27) closeGallery();
      else if (e.key === 'ArrowRight' || e.keyCode === 39) next();
      else if (e.key === 'ArrowLeft' || e.keyCode === 37) prev();
    });

    lightbox.addEventListener(
      'touchstart',
      function (e) {
        if (e.changedTouches && e.changedTouches.length) startX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      'touchend',
      function (e) {
        if (!current || current.length < 2) return;
        if (!e.changedTouches || !e.changedTouches.length) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) {
          if (dx < 0) next();
          else prev();
        }
      },
      { passive: true }
    );
  }

  // =========================================================================
  // INIT
  // =========================================================================
  function init() {
    // Nav + anchors work regardless of motion preference.
    var lenis = null;

    if (reduce) {
      // Reduced motion: no Lenis, no GSAP, no particles, no floating tags.
      // Just wire up interaction and guarantee everything is visible.
      try {
        initNavigation();
        initSmoothAnchors(null);
        initGallery();
      } catch (e) {
        /* interaction failure is non-fatal */
      }
      forceVisible();
      return;
    }

    try {
      splitHeroChars();
      lenis = initLenis();
      initNavigation();
      initSmoothAnchors(lenis);
      initGallery();

      // Run GSAP after first paint so layout is measured correctly.
      requestAnimationFrame(function () {
        try {
          initAnimations();
        } catch (err) {
          if (typeof console !== 'undefined') {
            console.warn('[Portfolio] Animation init failed; showing content.', err);
          }
          forceVisible();
        }
      });
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[Portfolio] Init failed; showing content.', err);
      }
      // Best-effort interaction wiring + guaranteed visibility.
      try {
        initNavigation();
        initSmoothAnchors(lenis);
      } catch (e2) {
        /* ignore */
      }
      forceVisible();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
