// GitHub utility functions

/**
 * GitHub's official language color palette (top ~20 languages)
 */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  PHP: '#4F5D95',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Lua: '#000080',
  Vue: '#41b883',
  SCSS: '#c6538c',
  Jupyter: '#F37626',
  'Jupyter Notebook': '#DA5B0B',
};

/**
 * Returns the hex color for a GitHub language.
 */
export function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] ?? '#8b949e';
}

/**
 * Converts an ISO date string to a human-readable relative time string.
 */
export function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  return `${months}mo ago`;
}

/**
 * Maps a GitHub event type to a human-readable description and icon name.
 */
export interface EventDescription {
  icon: 'push' | 'create' | 'star' | 'fork' | 'issue' | 'pr' | 'delete' | 'other';
  text: string;
}

export function getEventDescription(event: {
  type: string;
  repo: { name: string };
  payload?: any;
}): EventDescription {
  const repoName = event.repo.name.split('/').pop() || event.repo.name;

  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload?._totalCommits ?? event.payload?.commits?.length ?? 0;
      return {
        icon: 'push',
        text: commits > 0
          ? `Pushed ${commits} commit${commits !== 1 ? 's' : ''} to ${repoName}`
          : `Pushed to ${repoName}`,
      };
    }
    case 'CreateEvent': {
      const refType = event.payload?.ref_type ?? 'repository';
      const ref = event.payload?.ref;
      return {
        icon: 'create',
        text: ref
          ? `Created ${refType} "${ref}" in ${repoName}`
          : `Created ${refType} ${repoName}`,
      };
    }
    case 'DeleteEvent': {
      const refType = event.payload?.ref_type ?? 'branch';
      const ref = event.payload?.ref ?? '';
      return {
        icon: 'delete',
        text: `Deleted ${refType} "${ref}" in ${repoName}`,
      };
    }
    case 'WatchEvent':
      return { icon: 'star', text: `Starred ${repoName}` };
    case 'ForkEvent':
      return { icon: 'fork', text: `Forked ${repoName}` };
    case 'IssuesEvent': {
      const action = event.payload?.action ?? 'opened';
      return { icon: 'issue', text: `${capitalize(action)} issue in ${repoName}` };
    }
    case 'PullRequestEvent': {
      const action = event.payload?.action ?? 'opened';
      return { icon: 'pr', text: `${capitalize(action)} PR in ${repoName}` };
    }
    case 'IssueCommentEvent':
      return { icon: 'issue', text: `Commented on issue in ${repoName}` };
    case 'ReleaseEvent':
      return { icon: 'create', text: `Published release in ${repoName}` };
    default:
      return { icon: 'other', text: `Activity in ${repoName}` };
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
