/**
 * Live-demo URL resolution.
 *
 * The site deploys to two hosts:
 *   - yourfiyan.me       (InfinityFree — Apache + PHP, all /live/ demos work)
 *   - yourfiyan.is-a.dev (GitHub Pages — static only; PHP demos are stripped
 *     from the artifact by the deploy workflow)
 *
 * PHP-backed demos must always be reached on yourfiyan.me. Static demos
 * stay same-origin so they keep working on either host and in local dev.
 */

const PHP_HOST = 'https://yourfiyan.me';

/** True when the current origin can execute PHP (i.e. InfinityFree). */
export function isPhpHost(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === 'yourfiyan.me';
}

/**
 * Resolve a /live/... demo link. PHP demos are rewritten to the
 * yourfiyan.me absolute URL when we're not already on that host.
 */
export function resolveLiveLink(link: string, requiresPhp?: boolean): string {
  if (requiresPhp && !isPhpHost()) {
    return `${PHP_HOST}${link}`;
  }
  return link;
}
