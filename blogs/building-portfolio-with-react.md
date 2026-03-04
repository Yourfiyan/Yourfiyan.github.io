---
title: "How I Built This Portfolio with React & Vite"
date: "March 2026"
tags: ["React", "Vite", "Web Dev", "Tutorial"]
---

When I decided to build a portfolio, I had a clear vision: it should be fast, visually striking, and showcase my work effectively. After considering various options, I chose React with TypeScript and Vite as my build tool.

The design philosophy was inspired by modern glass-morphism trends—translucent cards, subtle gradients, and animated backgrounds. Framer Motion handles all the animations, from the hero section's rotating text to the smooth page transitions.

One interesting decision was using HashRouter instead of BrowserRouter. Since I'm hosting on InfinityFree (a free hosting service), I don't have control over server-side routing. Hash-based routing ensures all routes work without any .htaccess configuration.

The GitHub integration was a fun challenge. I fetch live data from GitHub's REST API to display my repositories, languages, and activity. To handle rate limiting (60 requests/hour for unauthenticated requests), I implemented sessionStorage caching with a 10-minute TTL.

For styling, Tailwind CSS was a no-brainer. Its utility-first approach lets me build responsive layouts quickly. The dark theme uses a carefully chosen palette of slate colors with indigo and cyan accents.

Looking back, I'd do a few things differently: set up Tailwind as a proper PostCSS plugin instead of the CDN version, and add more comprehensive error handling. But overall, I'm proud of how it turned out. It's a living project that I continue to improve.
