import { useEffect } from 'react';

const SITE_NAME = 'Syed Sufiyan Hamza';
const DEFAULT_TITLE = 'Syed Sufiyan Hamza | Student Developer Portfolio';
const DEFAULT_DESCRIPTION =
  'Portfolio of Syed Sufiyan Hamza — an 18-year-old student developer from Assam, India. Projects, blog posts, certificates, and experiments in web dev, Python, and AI.';

function setMeta(selector: string, attr: string, value: string) {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el) el.setAttribute(attr, value);
}

/**
 * Per-route document title + description + canonical/OG sync.
 *
 * This is an SPA, so crawlers that execute JS (Google) and users
 * (tab titles, history, bookmarks) get route-specific metadata.
 * The server-rendered defaults in index.html remain the fallback for
 * non-JS crawlers and social scrapers.
 */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description ?? DEFAULT_DESCRIPTION;

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', desc);

    // Keep canonical + og:url pointing at the current route on the
    // current domain (the build injects the right domain per target).
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      const url = `${window.location.origin}${window.location.pathname}`;
      canonical.href = url;
      setMeta('meta[property="og:url"]', 'content', url);
    }
  }, [title, description]);
}
