import { useState, useEffect } from 'react';
import { GITHUB_USERNAME } from '../constants';

// --- Types ---
export interface GitHubProfile {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
  topics: string[];
}

export interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: any;
  created_at: string;
}

export interface LanguageStat {
  name: string;
  count: number;
  percent: number;
  color: string;
}

export interface GitHubData {
  profile: GitHubProfile | null;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  languages: LanguageStat[];
  isLoading: boolean;
  error: string | null;
}

// --- Cache helpers ---
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCached<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

// --- Language color map (imported from utils for consistency) ---
import { getLanguageColor } from '../utils/github';

function buildLanguageStats(repos: GitHubRepo[]): LanguageStat[] {
  const counts: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language && !repo.fork) {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
    }
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, c]) => sum + c, 0);
  return entries.map(([name, count]) => ({
    name,
    count,
    percent: Math.round((count / total) * 100),
    color: getLanguageColor(name),
  }));
}

// --- Hook ---
export function useGitHubData(): GitHubData {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [languages, setLanguages] = useState<LanguageStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const BASE = `https://api.github.com/users/${GITHUB_USERNAME}`;

    async function fetchAll() {
      // Check cache first
      const cachedProfile = getCached<GitHubProfile>('gh_profile');
      const cachedRepos = getCached<GitHubRepo[]>('gh_repos');
      const cachedEvents = getCached<GitHubEvent[]>('gh_events');

      if (cachedProfile && cachedRepos && cachedEvents) {
        if (cancelled) return;
        setProfile(cachedProfile);
        setRepos(cachedRepos);
        setEvents(cachedEvents);
        setLanguages(buildLanguageStats(cachedRepos));
        setIsLoading(false);
        return;
      }

      try {
        const [profileRes, reposRes, eventsRes] = await Promise.all([
          fetch(BASE),
          fetch(`${BASE}/repos?sort=updated&per_page=30`),
          fetch(`${BASE}/events/public?per_page=15`),
        ]);

        if (!profileRes.ok) throw new Error(`GitHub API error: ${profileRes.status}`);

        const profileData: GitHubProfile = await profileRes.json();
        const reposData: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];
        const eventsData: GitHubEvent[] = eventsRes.ok ? await eventsRes.json() : [];

        if (cancelled) return;

        // Persist to session cache
        setCache('gh_profile', profileData);
        setCache('gh_repos', reposData);
        setCache('gh_events', eventsData);

        setProfile(profileData);
        setRepos(reposData);
        setEvents(eventsData);
        setLanguages(buildLanguageStats(reposData));
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Failed to fetch GitHub data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return { profile, repos, events, languages, isLoading, error };
}
