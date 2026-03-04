import { useState, useEffect, useCallback, useRef } from 'react';

type Theme = 'dark' | 'light';

/** Detect the browser / OS color-scheme preference. */
function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'dark' || stored === 'light') return stored;
  }
  // No stored preference — follow the browser / OS setting
  return getSystemTheme();
}

const TRANSITION_DURATION = 350; // ms — keep in sync with CSS .theme-transitioning rule

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const userHasChosen = useRef(localStorage.getItem('theme') !== null);

  // Apply the theme class + data-attribute and persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for OS-level preference changes while the page is open.
  // If the user has never manually toggled, follow along.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e: MediaQueryListEvent) => {
      if (!userHasChosen.current) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    // Mark that the user explicitly chose a theme
    userHasChosen.current = true;

    // Enable the smooth transition class, then switch
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    // Remove the transition class after the animation completes
    setTimeout(() => root.classList.remove('theme-transitioning'), TRANSITION_DURATION);
  }, []);

  return { theme, toggleTheme, setTheme } as const;
}
