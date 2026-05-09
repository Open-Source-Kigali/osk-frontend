<div align="center">

<img src="./src/assets/Logo/OSK-primary-logo-1200-400-white.svg" alt="Open Source Kigali Logo" height="90" />

# Open Source Kigali — Website

### Built in public • By the community • For the community

<p>
  The official website for <strong>Open Source Kigali (OSK)</strong> — Rwanda’s growing open-source developer community.
</p>

<p>
  This platform showcases community projects, events, learning resources,
  partnerships, and opportunities for contributors to collaborate and grow.
</p>

<p>
  <a href="https://opensourcekigali.rw">🌐 Live Website</a>
  •
  <a href="https://github.com/opensourcekigali/osk-website/issues">🐛 Report Bug</a>
  •
  
</p>

<p>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
  <img src="https://img.shields.io/badge/made%20in-Rwanda-green.svg" alt="Made in Rwanda" />
</p>

</div>

---

# 📖 About the Project

This repository contains the source code for the official **Open Source Kigali** website.

The project exists to:

- Showcase OSK community initiatives
- Highlight open-source projects
- Share events and learning resources
- Help contributors join the community
- Support partnerships and collaborations

> **This repository itself is an open-source project.**
>
> Anyone can contribute by opening issues, suggesting improvements,
> or submitting pull requests.

---

# ✨ Features

- Fast and modern frontend powered by Vite
- Responsive UI with Tailwind CSS
- Reusable component architecture
- Mobile-friendly design
- Community-driven contributions
- Continuous deployment with Vercel
- Type-safe development using TypeScript

---

#  Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| HTTP | Native Fetch API |
| State Management | React Hooks (`useState`, `useEffect`) |
| Deployment | Vercel |

---

# Project Structure

```bash
src/
├── assets/          # Images and static assets
├── components/      # Reusable UI components
│   └── ui/          # UI primitives (Button, Badge, Card...)
├── constants/       # Static data arrays
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and API helpers
├── pages/           # Route pages
├── types/           # TypeScript interfaces/types
└── App.tsx          # Router configuration
```

---

# Getting Started

## Prerequisites

Before running the project locally, ensure you have:

- Node.js 18+
- npm or yarn
- Git

---

## Installation & Setup

### 1️⃣ Fork and Clone the Repository

```bash
git clone https://github.com/Open-Source-Kigali/-Open-Source-Kigali-Website.git
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create Environment Variables

```bash
cp .env
```

### 4️⃣ Start Development Server

```bash
npm run dev
```

The application will run at:

```bash
http://localhost:5173
```

---

# Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_API_BASE_URL` | OSK backend API base URL | ✅ Yes |

---

# Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks
```

---

# Contributing

We welcome contributions from developers, designers, writers,
and open-source enthusiasts of all skill levels.

Please read:

```bash
CONTRIBUTING.md
```

before opening a pull request.

---

## New to Open Source?

Start with issues labelled:

```bash
good first issue
```

These issues are beginner-friendly, well-scoped,
and reviewed quickly by maintainers.

---

# Community & Contact

| Platform | Link |
|---|---|
| Discord | https://discord.com/invite/osk |
| LinkedIn | https://linkedin.com/company/osk |
| GitHub | https://github.com/opensourcekigali |
| Email | opensourcekigali@gmail.com |

---

# License

This project is licensed under the **MIT License**.

See:

```bash
LICENSE
```

for more information.

---

<div align="center">

### Built with ❤️ by the Open Source Kigali Community

Empowering African developers through open source.

</div>