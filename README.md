# yourfiyan.github.io

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Personal portfolio website for Syed Sufiyan Hamza — built with React, TypeScript, Vite, and Tailwind CSS. Features project showcases, blog system, certificates, and a contact page.

**Live:** [yourfiyan.github.io](https://yourfiyan.github.io)

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
