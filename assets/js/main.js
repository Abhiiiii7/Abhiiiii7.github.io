/**
 * Creative Animated Portfolio - Main Script
 * Adapted from prashantkoirala465/web-development-portfolio
 * Warm earthy palette, italic serif display, GSAP scroll animations
 *
 * All content loaded from data/*.json - ZERO hardcoded personal content
 */

(function () {
  'use strict';

  // =========================================================================
  // GSAP / Lenis availability check
  // =========================================================================
  var hasGSAP = typeof gsap !== 'undefined';
  var hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== 'undefined';
  var hasLenis = typeof Lenis !== 'undefined';

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // =========================================================================
  // DATA LOADING
  // =========================================================================
  var dataFiles = [
    'site-config',
    'navigation',
    'hero',
    'about',
    'experience',
    'skills',
    'projects',
    'education',
    'contact',
    'footer',
  ];

  function loadJSON(filename) {
    return fetch('data/' + filename + '.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to load ' + filename + '.json');
        return response.json();
      })
      .catch(function (err) {
        console.warn('[Portfolio] Could not load ' + filename + '.json:', err.message);
        return null;
      });
  }

  function loadAllData() {
    return Promise.all(dataFiles.map(loadJSON)).then(function (results) {
      var data = {};
      dataFiles.forEach(function (name, i) {
        var key = name.replace(/-([a-z])/g, function (_, c) {
          return c.toUpperCase();
        });
        data[key] = results[i];
      });
      return data;
    });
  }

  // =========================================================================
  // DOM RENDERING
  // =========================================================================

  function renderSiteConfig(config) {
    if (!config) return;
    document.title = config.siteName || 'Portfolio';
  }

  function renderNavigation(nav) {
    if (!nav) return;
    var logoEl = document.getElementById('navLogo');
    var linksEl = document.getElementById('navLinks');
    var overlayItemsEl = document.getElementById('navOverlayItems');

    if (logoEl && nav.logo) {
      logoEl.textContent = nav.logo;
    }

    if (linksEl && nav.items) {
      linksEl.innerHTML = nav.items
        .map(function (item) {
          return '<a href="' + item.href + '">' + item.label + '</a>';
        })
        .join('');
    }

    if (overlayItemsEl && nav.items) {
      overlayItemsEl.innerHTML = nav.items
        .map(function (item) {
          return '<a href="' + item.href + '">' + item.label + '</a>';
        })
        .join('');
    }
  }

  function renderHero(hero) {
    if (!hero) return;

    var greetingEl = document.getElementById('heroGreeting');
    var name1El = document.getElementById('heroName1');
    var name2El = document.getElementById('heroName2');
    var titleEl = document.getElementById('heroTitle');
    var taglineEl = document.getElementById('heroTagline');
    var socialLinksEl = document.getElementById('heroSocialLinks');

    if (greetingEl) greetingEl.textContent = hero.greeting || '';

    // Split name into two lines, with each character wrapped for animation
    if (hero.name) {
      var parts = hero.name.split(' ');
      var wrapChars = function (text) {
        return text
          .split('')
          .map(function (ch) {
            return ch === ' '
              ? ' '
              : '<span class="char" style="display:inline-block;transform:translateY(100%);opacity:0">' +
                  ch +
                  '</span>';
          })
          .join('');
      };

      if (parts.length >= 2) {
        if (name1El) name1El.innerHTML = wrapChars(parts[0]);
        if (name2El) name2El.innerHTML = wrapChars(parts.slice(1).join(' '));
      } else {
        if (name1El) name1El.innerHTML = wrapChars(hero.name);
        if (name2El) name2El.innerHTML = '';
      }
    }

    if (titleEl) titleEl.textContent = hero.title || '';
    if (taglineEl) {
      var tagline = hero.tagline || '';
      taglineEl.textContent =
        tagline.length > 80 ? tagline.substring(0, 80) + '...' : tagline;
    }

    if (socialLinksEl && hero.socialLinks) {
      var links = [];
      if (hero.socialLinks.github)
        links.push(
          '<a href="' + hero.socialLinks.github + '" target="_blank" rel="noopener">GitHub</a>'
        );
      if (hero.socialLinks.linkedin)
        links.push(
          '<a href="' + hero.socialLinks.linkedin + '" target="_blank" rel="noopener">LinkedIn</a>'
        );
      if (hero.socialLinks.email)
        links.push(
          '<a href="mailto:' + hero.socialLinks.email + '">Email</a>'
        );
      socialLinksEl.innerHTML = links.join('');
    }
  }

  function renderAbout(about) {
    if (!about) return;

    var headingEl = document.getElementById('aboutHeading');
    var bioEl = document.getElementById('aboutBio');
    var philosophyEl = document.getElementById('aboutPhilosophy');
    var highlightsEl = document.getElementById('aboutHighlights');

    if (headingEl) headingEl.textContent = about.heading || 'About Me';

    if (bioEl) {
      var bioText = about.bio || '';
      var sentences = bioText.split(/(?<=\.)\s+/);
      var paragraphs = [];
      for (var i = 0; i < sentences.length; i += 3) {
        paragraphs.push(sentences.slice(i, i + 3).join(' '));
      }
      bioEl.innerHTML = paragraphs.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    }

    if (philosophyEl) {
      philosophyEl.textContent = about.philosophy || '';
      if (!about.philosophy) philosophyEl.style.display = 'none';
    }

    if (highlightsEl && about.highlights) {
      highlightsEl.innerHTML = about.highlights
        .map(function (h) {
          return '<div class="highlight-item">' +
            '<div class="highlight-value">' + h.value + '</div>' +
            '<div class="highlight-label">' + h.label + '</div>' +
            '</div>';
        })
        .join('');
    }
  }

  function renderExperience(exp) {
    if (!exp) return;

    var labelEl = document.getElementById('experienceLabel');
    var listEl = document.getElementById('experienceList');

    if (labelEl) labelEl.textContent = exp.heading || 'Experience';

    if (listEl && exp.positions) {
      listEl.innerHTML = exp.positions
        .map(function (pos) {
          return '<div class="experience-item">' +
            '<div class="experience-date">' + (pos.startDate || '') + (pos.endDate ? ' - ' + pos.endDate : '') + '</div>' +
            '<div class="experience-info">' +
            '<h3>' + (pos.title || '') + '</h3>' +
            '<p class="experience-company">' + (pos.company || '') + '</p>' +
            '<p class="experience-description">' + (pos.description || '') + '</p>' +
            '</div>' +
            '<div class="experience-location">' + (pos.location || '') + '</div>' +
            '</div>';
        })
        .join('');
    }
  }

  function renderSkills(skills) {
    if (!skills) return;

    var headingEl = document.getElementById('skillsHeading');
    var gridEl = document.getElementById('skillsGrid');
    var labelEl = document.getElementById('skillsLabel');

    if (labelEl) labelEl.textContent = skills.heading || 'Skills';
    if (headingEl) headingEl.textContent = skills.heading || 'Skills';

    if (gridEl && skills.categories) {
      gridEl.innerHTML = skills.categories
        .map(function (cat) {
          var tagsHtml = cat.items
            .map(function (item) { return '<span class="skill-tag">' + item + '</span>'; })
            .join('');
          return '<div class="skill-category">' +
            '<div class="skill-category-name">' + cat.name + '</div>' +
            '<div class="skill-items">' + tagsHtml + '</div>' +
            '</div>';
        })
        .join('');
    }
  }

  function inferCategory(project) {
    var name = (project.name || '').toLowerCase();
    var desc = (project.description || '').toLowerCase();
    var tech = (project.technologies || []).map(function (t) { return t.toLowerCase(); });
    var all = name + ' ' + desc + ' ' + tech.join(' ');

    if (all.match(/\b(react|vue|angular|svelte|next|nuxt|frontend|front-end|ui|ux|css|tailwind|html)\b/))
      return 'Frontend';
    if (all.match(/\b(node|express|django|flask|fastapi|spring|rails|backend|back-end|api|rest|graphql|server)\b/))
      return 'Backend';
    if (all.match(/\b(react native|flutter|swift|kotlin|ios|android|mobile)\b/))
      return 'Mobile';
    if (all.match(/\b(ml|machine learning|deep learning|ai|artificial|neural|nlp|data science|tensorflow|pytorch)\b/))
      return 'AI / ML';
    if (all.match(/\b(aws|docker|kubernetes|devops|ci\/cd|terraform|cloud|deploy)\b/))
      return 'DevOps';
    if (all.match(/\b(fullstack|full-stack|full stack|mern|mean)\b/))
      return 'Full Stack';
    return 'Development';
  }

  function renderProjects(projects) {
    if (!projects) return;

    var headingEl = document.getElementById('projectsHeading');
    var listEl = document.getElementById('projectsList');
    var labelEl = document.getElementById('projectsLabel');

    if (labelEl) labelEl.textContent = projects.heading || 'Projects';
    if (headingEl) headingEl.textContent = projects.heading || 'Projects';

    if (listEl && projects.projects) {
      listEl.innerHTML = projects.projects
        .map(function (proj) {
          var category = proj.category || inferCategory(proj);
          var techHtml = (proj.technologies || [])
            .map(function (t) { return '<span>' + t + '</span>'; })
            .join('');
          var linksHtml = [];
          if (proj.liveUrl)
            linksHtml.push('<a href="' + proj.liveUrl + '" target="_blank" rel="noopener">Live &rarr;</a>');
          if (proj.githubUrl)
            linksHtml.push('<a href="' + proj.githubUrl + '" target="_blank" rel="noopener">Source &rarr;</a>');

          return '<div class="project-item">' +
            '<div class="project-visual">' +
            '<div class="project-visual-inner">' + (proj.name || '') + '</div>' +
            '</div>' +
            '<div class="project-info">' +
            '<div class="project-category">' + category + '</div>' +
            '<h3 class="project-name">' + (proj.name || '') + '</h3>' +
            '<p class="project-description">' + (proj.description || '') + '</p>' +
            '<div class="project-tech">' + techHtml + '</div>' +
            (linksHtml.length ? '<div class="project-links">' + linksHtml.join('') + '</div>' : '') +
            '</div>' +
            '</div>';
        })
        .join('');
    }
  }

  function renderEducation(edu) {
    if (!edu) return;

    var headingEl = document.getElementById('educationHeading');
    var listEl = document.getElementById('educationList');
    var labelEl = document.getElementById('educationLabel');

    if (labelEl) labelEl.textContent = edu.heading || 'Education';
    if (headingEl) headingEl.textContent = edu.heading || 'Education';

    if (listEl && edu.entries) {
      var html = edu.entries
        .map(function (entry) {
          var honorsHtml =
            entry.honors && entry.honors.length
              ? '<div class="education-honors">' + entry.honors.map(function (h) { return '<span>' + h + '</span>'; }).join('') + '</div>'
              : '';
          var meta = [];
          if (entry.field) meta.push(entry.field);
          if (entry.gpa) meta.push('GPA: ' + entry.gpa);

          return '<div class="education-item">' +
            '<div class="education-year">' + (entry.startDate || '') + (entry.endDate ? ' - ' + entry.endDate : '') + '</div>' +
            '<div class="education-info">' +
            '<h3>' + (entry.degree || '') + '</h3>' +
            '<p class="education-institution">' + (entry.institution || '') + '</p>' +
            (meta.length ? '<p class="education-meta">' + meta.join(' | ') + '</p>' : '') +
            honorsHtml +
            '</div>' +
            '</div>';
        })
        .join('');

      // Certifications
      if (edu.certifications && edu.certifications.length) {
        html += '<div class="certifications-list">' +
          '<h4>Certifications</h4>' +
          edu.certifications.map(function (c) { return '<p>' + c + '</p>'; }).join('') +
          '</div>';
      }

      listEl.innerHTML = html;
    }
  }

  function renderContact(contact) {
    if (!contact) return;

    var headingEl = document.getElementById('contactHeading');
    var subEl = document.getElementById('contactSubheading');
    var detailsEl = document.getElementById('contactDetails');
    var emailBtnEl = document.getElementById('contactEmailBtn');
    var labelEl = document.getElementById('contactLabel');

    if (labelEl) labelEl.textContent = contact.heading || 'Contact';
    if (headingEl) headingEl.textContent = contact.heading || 'Get In Touch';
    if (subEl) subEl.textContent = contact.subheading || '';

    if (detailsEl) {
      var items = [];
      if (contact.email) {
        items.push(
          '<div class="contact-detail-item">' +
          '<div class="contact-detail-label">Email</div>' +
          '<div class="contact-detail-value"><a href="mailto:' + contact.email + '">' + contact.email + '</a></div>' +
          '</div>'
        );
      }
      if (contact.phone) {
        items.push(
          '<div class="contact-detail-item">' +
          '<div class="contact-detail-label">Phone</div>' +
          '<div class="contact-detail-value"><a href="tel:' + contact.phone + '">' + contact.phone + '</a></div>' +
          '</div>'
        );
      }
      if (contact.location) {
        items.push(
          '<div class="contact-detail-item">' +
          '<div class="contact-detail-label">Location</div>' +
          '<div class="contact-detail-value">' + contact.location + '</div>' +
          '</div>'
        );
      }
      if (contact.availability) {
        items.push(
          '<div class="contact-detail-item">' +
          '<div class="contact-detail-label">Status</div>' +
          '<div class="contact-detail-value">' + contact.availability + '</div>' +
          '</div>'
        );
      }
      detailsEl.innerHTML = items.join('');
    }

    if (emailBtnEl && contact.email) {
      emailBtnEl.href = 'mailto:' + contact.email;
    }
  }

  function renderFooter(footer) {
    if (!footer) return;

    var nameEl = document.getElementById('footerName');
    var linksEl = document.getElementById('footerLinks');
    var copyrightEl = document.getElementById('footerCopyright');
    var taglineEl = document.getElementById('footerTagline');

    if (nameEl) nameEl.textContent = footer.copyright || '';

    if (linksEl && footer.links) {
      linksEl.innerHTML = footer.links
        .map(function (link) {
          return '<a href="' + link.url + '" target="_blank" rel="noopener" class="footer-link">' + link.label + '</a>';
        })
        .join('');
    }

    if (copyrightEl) {
      copyrightEl.textContent = '\u00A9 ' + (footer.year || new Date().getFullYear()) + ' ' + (footer.copyright || '');
    }

    if (taglineEl) taglineEl.textContent = footer.tagline || '';
  }

  // =========================================================================
  // PAGE TRANSITION
  // =========================================================================

  function revealTransition() {
    if (!hasGSAP) {
      document.querySelectorAll('.transition-overlay').forEach(function (el) {
        el.style.transform = 'scaleY(0)';
      });
      return;
    }
    gsap.set('.transition-overlay', { scaleY: 1, transformOrigin: 'top' });
    gsap.to('.transition-overlay', {
      scaleY: 0,
      duration: 0.6,
      stagger: -0.1,
      ease: 'power2.inOut',
    });
  }

  // =========================================================================
  // LENIS SMOOTH SCROLL
  // =========================================================================

  function initLenis() {
    if (!hasLenis || !hasGSAP || !hasScrollTrigger) return null;

    var isMobile = window.innerWidth <= 900;
    var settings = {
      duration: isMobile ? 1 : 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      orientation: 'vertical',
      smoothWheel: true,
      syncTouch: true,
      lerp: isMobile ? 0.05 : 0.1,
    };

    var lenis = new Lenis(settings);
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return lenis;
  }

  // =========================================================================
  // NAVIGATION
  // =========================================================================

  function initNavigation() {
    var menuToggle = document.getElementById('menuToggle');
    var navOverlay = document.getElementById('navOverlay');
    if (!menuToggle || !navOverlay) return;

    var isOpen = false;
    var scrollY = 0;

    menuToggle.addEventListener('click', function () {
      if (!isOpen) {
        isOpen = true;
        scrollY = window.scrollY;
        menuToggle.classList.add('active');
        navOverlay.classList.add('active');
        document.body.style.position = 'fixed';
        document.body.style.top = '-' + scrollY + 'px';
        document.body.style.width = '100%';
      } else {
        isOpen = false;
        menuToggle.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      }
    });

    // Close on link click (re-bind after DOM update)
    setTimeout(function () {
      navOverlay.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          if (isOpen) {
            isOpen = false;
            menuToggle.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
          }
        });
      });
    }, 500);
  }

  // =========================================================================
  // FOOTER PARTICLE EXPLOSION
  // =========================================================================

  function initFooterParticles() {
    if (!hasGSAP) return;

    var footerContainer = document.querySelector('.footer-container');
    if (!footerContainer) return;

    var colors = ['#ed6a5a', '#f4f1bb', '#9bc1bc', '#5d576b', '#edf1e8'];
    var particles = [];
    var exploded = false;

    // Create particle elements
    for (var i = 0; i < 20; i++) {
      var particle = document.createElement('div');
      particle.className = 'footer-particle';
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

          gsap.fromTo(p,
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
      }
    });
  }

  // =========================================================================
  // GSAP ANIMATIONS
  // =========================================================================

  function initAnimations() {
    if (!hasGSAP || !hasScrollTrigger) return;

    // --- Hero entry animation ---
    var heroTl = gsap.timeline({ delay: 0.8 });

    heroTl
      .from('.hero-greeting', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
      .to(
        '.hero-name-1 .char',
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power4.out',
        },
        '-=0.4'
      )
      .to(
        '.hero-name-2 .char',
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power4.out',
        },
        '-=0.4'
      )
      .from(
        '.hero-title',
        {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.3'
      )
      .from(
        '.hero-footer',
        {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.4'
      );

    // --- About section ---
    var aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
      gsap.from('.about .section-label', {
        scrollTrigger: {
          trigger: '.about',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.about-heading', {
        scrollTrigger: {
          trigger: '.about',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('.about-bio p', {
        scrollTrigger: {
          trigger: '.about-bio',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
      });

      gsap.from('.about-philosophy', {
        scrollTrigger: {
          trigger: '.about-philosophy',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.highlight-item', {
        scrollTrigger: {
          trigger: '.about-highlights',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }

    // --- Experience section - staggered ---
    var expItems = document.querySelectorAll('.experience-item');
    if (expItems.length) {
      gsap.from('.experience .section-label', {
        scrollTrigger: {
          trigger: '.experience',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });

      expItems.forEach(function (item, index) {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 50,
          opacity: 0,
          duration: 0.7,
          delay: index * 0.05,
          ease: 'power3.out',
        });
      });
    }

    // --- Skills section - cards scale in ---
    var skillCats = document.querySelectorAll('.skill-category');
    if (skillCats.length) {
      gsap.from('.skills .section-label', {
        scrollTrigger: {
          trigger: '.skills',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.skills-header h2', {
        scrollTrigger: {
          trigger: '.skills',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      skillCats.forEach(function (cat, index) {
        gsap.from(cat, {
          scrollTrigger: {
            trigger: cat,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 60,
          opacity: 0,
          scale: 0.9,
          duration: 0.7,
          delay: index * 0.08,
          ease: 'power3.out',
        });
      });
    }

    // --- Projects section - alternating reveals ---
    var projectItems = document.querySelectorAll('.project-item');
    if (projectItems.length) {
      gsap.from('.projects .section-label', {
        scrollTrigger: {
          trigger: '.projects',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.projects-heading', {
        scrollTrigger: {
          trigger: '.projects',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      projectItems.forEach(function (item, index) {
        var visual = item.querySelector('.project-visual');
        var info = item.querySelector('.project-info');
        var isEven = index % 2 === 1;

        if (visual) {
          gsap.from(visual, {
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            x: isEven ? 80 : -80,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
          });
        }

        if (info) {
          gsap.from(info, {
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            x: isEven ? -60 : 60,
            opacity: 0,
            duration: 0.9,
            delay: 0.15,
            ease: 'power3.out',
          });
        }
      });
    }

    // --- Education section ---
    var eduItems = document.querySelectorAll('.education-item');
    if (eduItems.length) {
      gsap.from('.education .section-label', {
        scrollTrigger: {
          trigger: '.education',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.education-heading', {
        scrollTrigger: {
          trigger: '.education',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      eduItems.forEach(function (item, index) {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 40,
          opacity: 0,
          duration: 0.7,
          delay: index * 0.08,
          ease: 'power3.out',
        });
      });
    }

    // --- Contact section ---
    var contactContent = document.querySelector('.contact-content');
    if (contactContent) {
      gsap.from('.contact .section-label', {
        scrollTrigger: {
          trigger: '.contact',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.contact-heading', {
        scrollTrigger: {
          trigger: '.contact',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('.contact-subheading', {
        scrollTrigger: {
          trigger: '.contact',
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        delay: 0.1,
        ease: 'power3.out',
      });

      gsap.from('.contact-detail-item', {
        scrollTrigger: {
          trigger: '.contact-details',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });

      gsap.from('.contact-email-btn', {
        scrollTrigger: {
          trigger: '.contact-cta',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        scale: 0.9,
        duration: 0.7,
        ease: 'power3.out',
      });
    }

    // --- Footer ---
    var footerEl = document.querySelector('footer');
    if (footerEl) {
      gsap.from('.footer-container', {
        scrollTrigger: {
          trigger: 'footer',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    }

    // --- Parallax hero text on scroll ---
    gsap.to('.hero-name-1', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
      y: -100,
      opacity: 0.3,
    });

    gsap.to('.hero-name-2', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
      y: -60,
      opacity: 0.3,
    });

    // --- Floating decorative tags in About ---
    addFloatingTags();
  }

  // =========================================================================
  // FLOATING TAGS (decorative elements scattered in About section)
  // =========================================================================

  function addFloatingTags() {
    var aboutSection = document.querySelector('.about');
    if (!aboutSection || !hasGSAP || !hasScrollTrigger) return;

    var tags = ['Creative', 'Design', 'Code', 'Build', 'Ship'];
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
      tag.style.top = pos.top;
      if (pos.left) tag.style.left = pos.left;
      if (pos.right) tag.style.right = pos.right;
      tag.style.transform = 'rotate(' + pos.rot + 'deg)';
      aboutSection.appendChild(tag);

      // Parallax on scroll
      if (window.innerWidth > 1000) {
        gsap.to(tag, {
          scrollTrigger: {
            trigger: '.about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          y: -(150 + Math.random() * 250),
          rotation: pos.rot + (Math.random() - 0.5) * 30,
          ease: 'none',
        });
      }
    });
  }

  // =========================================================================
  // SMOOTH SCROLL to anchors
  // =========================================================================

  function initSmoothAnchors(lenis) {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();

        var target = document.querySelector(href);
        if (!target) return;

        if (lenis) {
          lenis.scrollTo(target, { offset: 0, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // =========================================================================
  // INIT
  // =========================================================================

  document.addEventListener('DOMContentLoaded', function () {
    loadAllData().then(function (data) {
      // Render all sections
      renderSiteConfig(data.siteConfig);
      renderNavigation(data.navigation);
      renderHero(data.hero);
      renderAbout(data.about);
      renderExperience(data.experience);
      renderSkills(data.skills);
      renderProjects(data.projects);
      renderEducation(data.education);
      renderContact(data.contact);
      renderFooter(data.footer);

      // Hide loading screen
      var loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }

      // Page transition reveal
      revealTransition();

      // Init Lenis smooth scrolling
      var lenis = initLenis();

      // Init navigation
      initNavigation();

      // Init smooth anchor scrolling
      initSmoothAnchors(lenis);

      // Init GSAP animations (after DOM is populated)
      requestAnimationFrame(function () {
        initAnimations();
        initFooterParticles();
      });
    });
  });
})();
