import { LucideIcon } from 'lucide-react';

export interface Project {
  id: number;
  title: string;
  tags: string[];
  desc: string;
  link: string;
  icon: LucideIcon;
  color: string;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  date: string;
  certId?: string;
  link: string;
  image?: string;
}

export interface Lab {
  id: number;
  title: string;
  desc: string;
  link: string;
  tags: string[];
  icon: LucideIcon;
  /** True when the demo needs server-side PHP — only available on yourfiyan.me (InfinityFree). */
  requiresPhp?: boolean;
  /**
   * True when the lab is an SPA route inside this site (rendered with a
   * react-router Link) rather than an external /live/ demo. Internal labs
   * work identically on both hosts, so resolveLiveLink does not apply.
   */
  internal?: boolean;
}

export interface CursorSpec {
  /** The CSS `cursor` keyword this entry demonstrates. */
  value: string;
  /** Short plain-language note on when the cursor is meant to appear. */
  hint: string;
}

export interface CursorCategory {
  /** Display name — doubles as the filter label on the Cursor Playground page. */
  name: string;
  cursors: CursorSpec[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  date: string;
  tags: string[];
  readTime: string;
}