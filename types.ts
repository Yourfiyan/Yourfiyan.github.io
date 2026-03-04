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