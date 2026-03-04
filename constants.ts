import { Terminal, Cpu, Code2, Globe, Server, Calculator, Smartphone, ShieldCheck, Music, Beaker } from 'lucide-react';
import { Certificate, Lab } from './types';

export const GITHUB_USERNAME = "yourfiyan";

export const HERO_CONTENT = {
  headline: "Hi, I'm",
  name: "Syed Sufiyan Hamza",
  rotatingText: ["Student Developer", "Tech Guy", "Linux Dude", "Problem Solver"],
  intro: "A passionate Class 10 student developer from Titabar, Assam. I build innovative solutions and experiment with technology to solve real-world problems."
};

export const ABOUT_CONTENT = {
  bio1: "Hello! I'm a 17-year-old tech enthusiast and developer from Titabar, Assam. For over 3 years, I've been exploring the realms of technology, building everything from personal productivity tools to AI-powered scripts.",
  bio2: "My journey began with simple HTML pages and has evolved into creating applications and experimenting across Windows and Linux environments. I'm passionate about solving problems through code and constantly learning new technologies.",
  skills: ["HTML", "CSS", "JavaScript", "Python", "Linux", "Problem Solving", "Git & GitHub"]
};

export const PROJECTS = [
  {
    id: 1,
    title: "Customer Support AI Agent",
    tags: ["Python", "Gemini AI", "FastAPI", "Multi-Agent"],
    desc: "A production-ready multi-agent customer support system built with Google Gemini AI, featuring automated inquiry handling and quality validation.",
    link: "/projects/customer-support",
    icon: Server,
    color: "from-blue-500 to-indigo-500"
  },
  {
    id: 2,
    title: "Calculato Ready",
    tags: ["HTML", "CSS", "JS", "Web App"],
    desc: "A responsive web-based calculator demonstrating fundamental HTML, CSS, and JavaScript skills for intuitive use.",
    link: "/projects/calculatoready",
    icon: Calculator,
    color: "from-emerald-400 to-cyan-500"
  },
  {
    id: 3,
    title: "Pocketphone",
    tags: ["PHP", "MySQL", "Security", "Admin Panel"],
    desc: "A secure phone inventory management system with an admin panel, featuring role-based access control and comprehensive product management.",
    link: "/projects/pocketphone",
    icon: Smartphone,
    color: "from-purple-500 to-pink-500"
  }
];

export const LABS: Lab[] = [
  {
    id: 1,
    title: "Music Player",
    desc: "A web-based music player interface exploring audio APIs and custom controls.",
    link: "/live/music_player/index.html",
    tags: ["HTML", "JS", "Audio API"],
    icon: Music
  },
  {
    id: 2,
    title: "Calculato Ready (Live)",
    desc: "Direct access to the live calculator application.",
    link: "/live/calc/index.html",
    tags: ["Utility", "Math", "Web App"],
    icon: Calculator
  },
  {
    id: 3,
    title: "Pocketphone (Admin)",
    desc: "Direct access to the inventory management admin panel demo.",
    link: "/live/pocketphone/admin/index.php",
    tags: ["PHP", "Admin", "Demo"],
    icon: Smartphone
  }
];

export const CERTIFICATES: Certificate[] = [
  {
    id: 1,
    title: "Master Data Management for Beginners",
    issuer: "TCS iON",
    date: "14 Jul 2025",
    certId: "71279-28639249-1016",
    link: "/assets/certificates/1.pdf",
    image: "/assets/image/1.jpg"
  },
  {
    id: 2,
    title: "UX Design Introduction",
    issuer: "Lloyds Banking Group",
    date: "Nov 2025",
    link: "https://www.theforage.com/completion-certificates/Zbnc2o4ok6kD2NEXx/N65hfzBKXRiATv6yd_Zbnc2o4ok6kD2NEXx_691896edf8a076de76e259b6_1763236687789_completion_certificate.pdf"
  },
  {
    id: 3,
    title: "GenAI Powered Data Analytics",
    issuer: "Tata Group",
    date: "Nov 2025",
    link: "https://www.theforage.com/completion-certificates/ifobHAoMjQs9s6bKS/gMTdCXwDdLYoXZ3wG_ifobHAoMjQs9s6bKS_691896edf8a076de76e259b6_1763229118141_completion_certificate.pdf"
  },
  {
    id: 4,
    title: "Advanced Software Engineering",
    issuer: "Walmart USA",
    date: "Nov 2025",
    link: "https://www.theforage.com/completion-certificates/prBZoAihniNijyD6d/oX6f9BbCL9kJDJzfg_prBZoAihniNijyD6d_691896edf8a076de76e259b6_1763225980303_completion_certificate.pdf"
  },
  {
    id: 5,
    title: "Personal Banker",
    issuer: "Wells Fargo",
    date: "Nov 2025",
    link: "https://www.theforage.com/completion-certificates/nkmk7gJitYs4TBvoA/owmbvXSPLTqePC5gQ_nkmk7gJitYs4TBvoA_691896edf8a076de76e259b6_1763224943444_completion_certificate.pdf"
  },
  {
    id: 6,
    title: "Front-End Software Engineering",
    issuer: "Skyscanner",
    date: "Dec 2025",
    link: "https://www.theforage.com/completion-certificates/skoQmxqhtgWmKv2pm/km4rw7dihDr3etqom_skoQmxqhtgWmKv2pm_691896edf8a076de76e259b6_1765206899738_completion_certificate.pdf"
  },
  {
    id: 7,
    title: "Claude 101",
    issuer: "Anthropic",
    date: "Mar 2026",
    certId: "6vzjotimfu6a",
    link: "/assets/certificates/7-claude-101.pdf"
  },
  {
    id: 8,
    title: "Claude with the Anthropic API",
    issuer: "Anthropic",
    date: "Mar 2026",
    certId: "zrt7z5bwq79y",
    link: "/assets/certificates/8-claude-with-anthropic-api.pdf"
  }
];

export const CONTACT_INFO = {
  location: "Titabar, Assam, India",
  email: "yourfiyan@proton.me",
  github: "github.com/yourfiyan"
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Labs", href: "/labs" },
  { label: "Certificates", href: "/certificates" },
  { label: "Contact", href: "/contact" },
];