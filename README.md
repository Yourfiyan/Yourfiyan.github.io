# yourfiyan.github.io

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Personal portfolio website for Syed Sufiyan Hamza — built with React, TypeScript, Vite, and Tailwind CSS. Features project showcases, blog system, certificates, and a contact page.

**Live:** [yourfiyan.is-a.dev](https://yourfiyan.is-a.dev) (GitHub Pages) · [yourfiyan.me](https://yourfiyan.me) (InfinityFree)

## Dual Deployment

The site deploys to two hosts from the same codebase:

| | GitHub Pages | InfinityFree |
|---|---|---|
| Domain | `yourfiyan.is-a.dev` | `yourfiyan.me` |
| Trigger | push to `main` (Actions) | `npm run deploy:ftp` |
| SPA routing | `404.html` redirect trick | `.htaccess` rewrite |
| PHP demos (`/live/`) | stripped from artifact — linked cross-domain | served natively |

The build injects the target domain into canonical/OG tags via the
`SITE_URL` env var (`__SITE_URL__` placeholders in `index.html`).

> **Note:** `blogs/*.md` and the dashboard tooling (`dashboard.cjs`,
> `generate-blog.cjs`) are intentionally untracked local tooling. CI
> builds keep the committed `blogData.ts` as the blog source of truth;
> the `dashboard`/`blog:generate` npm scripts only work on a machine
> that has the local tooling.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Routing | React Router (BrowserRouter) |
| Blog | Markdown → static build pipeline |
| Deployment | GitHub Pages + custom deploy script |
| SEO | Sitemap, robots.txt, Open Graph, JSON-LD |

## Pages

- **Home** — Hero, about bento grid, project highlights, timeline
- **Projects** — Showcase of major projects with detail pages
- **Blog** — Technical blog with Markdown build pipeline
- **Certificates** — Course and learning credentials
- **Labs** — Experimental projects
- **Contact** — Contact form and social links

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
yourfiyan.github.io/
├── components/     # Reusable UI components (Navbar, Hero, Projects, etc.)
├── pages/          # Route pages (Home, Blog, Projects, Contact, etc.)
├── hooks/          # Custom React hooks
├── public/         # Static assets
├── utils/          # Utility functions
├── build-blogs.cjs # Blog build pipeline
├── build-sitemap.cjs # Sitemap generator
├── deploy.cjs      # Deployment script (GitHub Pages + FTP)
└── vite.config.ts  # Vite configuration
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## License

This project is licensed under the [MIT License](LICENSE).
