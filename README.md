# Abhinav Varma Konderu — Portfolio

Personal portfolio site for **Abhinav Varma Konderu**, a Data Analyst and M.S. Business Analytics student at California State University, Northridge (CSUN). It showcases experience, skills, selected analytics projects, education, and contact details.

**Live:** https://abhinavvarma.com/

## Overview

A single-page, fully static portfolio. All content is baked directly into `index.html` — there is no runtime data fetching and no build step. The site is designed to be readable and functional even with JavaScript disabled; JavaScript only adds progressive-enhancement motion (smooth scrolling, scroll reveals, and the hero animation).

## Tech Stack

- **HTML5** — semantic, static markup (all content lives in `index.html`)
- **CSS3** — custom design system: cream/coral palette, Playfair-style serif display, mono accents, brutalist hard-shadow hovers
- **Vanilla JavaScript** — no framework, no bundler
- **[GSAP 3.12.5](https://gsap.com/) + ScrollTrigger** — scroll-driven reveal animations (CDN)
- **[Lenis 1.1.18](https://github.com/darkroomengineering/lenis)** — smooth scrolling (CDN)
- **Google Fonts** — display + mono typography

No package manager, no compilation. The CDN libraries are loaded via `<script>` tags with SRI integrity hashes.

## Project Structure

```
.
├── index.html            # All page content (static, single source of truth)
├── assets/
│   ├── css/              # Stylesheet(s)
│   ├── js/
│   │   └── main.js       # Progressive-enhancement animations & nav
│   └── og-image.png      # 1200×630 social share card
├── favicon.svg           # "AV" monogram favicon
├── robots.txt            # Crawl directives + sitemap reference
├── sitemap.xml           # Single-URL sitemap
├── 404.html              # Branded not-found page (served by GitHub Pages)
└── README.md
```

> Note: A legacy `data/` directory may remain from the previous JSON-driven version. The current site does **not** read from it — all content is in `index.html`.

## Running Locally

No build tooling required. Serve the folder over a local HTTP server so relative paths and fonts resolve correctly:

```bash
# from the repository root
python3 -m http.server 8000
```

Then open http://localhost:8000/ in your browser.

(Opening `index.html` directly via `file://` mostly works, but a local server is recommended for accurate font loading and absolute-path assets like `/favicon.svg`.)

## Deployment

Hosted on **GitHub Pages** from the repository root. Pushing to the default branch publishes the site. `404.html` is automatically served by GitHub Pages for unknown routes.

## Accessibility & SEO

- WCAG AA-compliant accent text contrast
- `prefers-reduced-motion` support (animations disabled, content always visible)
- Skip link, visible focus styles, and semantic landmarks
- Open Graph + Twitter Card metadata, JSON-LD `Person` schema, canonical URL, `robots.txt`, and `sitemap.xml`

## Contact

- **Email:** abhinavvarmakonderu@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/abhinav-varma723
- **GitHub:** https://github.com/Abhiiiii7
- **Location:** Los Angeles, CA

## Credits

Design adapted from the [`prashantkoirala465/web-development-portfolio`](https://github.com/prashantkoirala465/web-development-portfolio) template, restructured into a static-baked single-page portfolio with custom content, palette, and accessibility improvements.
