# Contributing to Open Source Kigali Website

Thank you for your interest in contributing to the **Open Source Kigali Website** 🎉  
We're excited to have you here. This guide will help you go from setup to a successfully merged pull request.

---

## 📌 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What We Need Help With](#what-we-need-help-with)
- [Before You Start](#before-you-start)
- [Setting Up Locally](#setting-up-locally)
- [Branch Structure](#branch-structure)
- [Making a Contribution](#making-a-contribution)
- [Pull Request Checklist](#pull-request-checklist)
- [Commit Message Format](#commit-message-format)
- [Code Style Guidelines](#code-style-guidelines)
- [Project Structure](#project-structure)
- [Where to Get Help](#where-to-get-help)

---

## 🤝 Code of Conduct

By contributing to this project, you agree to follow our Code of Conduct.

Please read it here:

[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

We expect all contributors to be respectful, collaborative, and inclusive.

---

## What We Need Help With

All work is tracked using GitHub Issues.

| Label              | Meaning                 |
| ------------------ | ----------------------- |
| `good first issue` | Beginner-friendly tasks |
| `help wanted`      | Needs community support |
| `bug`              | Something is broken     |
| `enhancement`      | Feature improvements    |
| `documentation`    | Docs or README updates  |
| `design`           | UI/UX improvements      |

Start here →
[https://github.com/open-source-kigali/osk-frontend/issues](https://github.com/open-source-kigali/osk-frontend/issues)

---

## Before You Start

Before writing any code:

1. Check if an issue already exists.
2. If it exists, comment on it to let others know you are working on it.
3. If no issue exists, create one first before starting work.
4. Keep each pull request focused on **one issue only**.

This makes reviews faster and easier.

---

## Setting Up Locally

```bash
# 1. Fork the repository, then clone your fork
git clone https://github.com/YOUR_USERNAME/osk-frontend.git
cd osk-frontend

# 2. Install dependencies
npm install

# 3. Create environment variables
cp .env.example .env

# 4. Start development server
npm run dev
```

The app runs at:

```
http://localhost:5173
```

---

## Branch Structure

We use two main branches:

| Branch        | Purpose                                      |
|---------------|----------------------------------------------|
| `main`        | Production — what is live on the website     |
| `development` | Staging — where all PRs are merged first     |

**Always branch off `development` — never off `main`.**

```bash
# Switch to development first
git checkout development
git pull origin development

# Then create your branch
git checkout -b fix/your-change-name
```

Your pull request should always target the `development` branch.

---

## Making a Contribution

```bash
# 1. Switch to development and pull latest changes
git checkout development
git pull origin development

# 2. Create a new branch from development
git checkout -b feat/add-new-feature
git checkout -b fix/navbar-bug
git checkout -b docs/update-readme

# 3. Make your changes

# 4. Run checks before committing
npm run lint
npm run typecheck
npm run build

# 5. Commit your changes
git add .
git commit -m "feat: add new feature description"

# 6. Push your branch
git push origin feat/add-new-feature

# 7. Open a Pull Request on GitHub targeting the development branch
```

---

## Pull Request Checklist

Before submitting your PR:

- [ ] Code passes `npm run lint`
- [ ] Code passes `npm run typecheck`
- [ ] Project builds successfully with `npm run build`
- [ ] Changes are tested locally in the browser
- [ ] No `console.log` statements left in the code
- [ ] No hardcoded data in components — use `src/constants/`
- [ ] Types are defined in `src/types/`
- [ ] PR targets the `development` branch not `main`
- [ ] PR is linked to an issue
- [ ] PR description clearly explains what changed and why

---

## Commit Message Format

We use **Conventional Commits**:

```
type: short description
```

### Examples

```
feat: add partner logo upload to form
fix: navbar does not turn white on scroll
docs: update installation instructions
style: fix spacing on projects page
refactor: move events data to constants
chore: update dependencies
```

### Types

- `feat` → new feature
- `fix` → bug fix
- `docs` → documentation changes
- `style` → formatting with no logic change
- `refactor` → code restructuring
- `chore` → maintenance tasks
- `test` → testing changes

---

## Code Style Guidelines

- Use **TypeScript only** — `.ts` and `.tsx` files
- Avoid `any` types
- Keep reusable data in `src/constants/`
- Keep interfaces and types in `src/types/`
- Prefer **Tailwind CSS** over inline styles
- Only use inline `style={{}}` for dynamic values like hex colors
- One main component per file
- Do not add new npm packages without opening an issue and
  getting approval first

---

## Project Structure

```bash
src/
├── assets/       # Images and static files
├── components/   # Reusable UI components
├── constants/    # All static data (events, projects, partners...)
├── hooks/        # Custom React hooks
├── lib/          # Utility functions and API helpers
├── pages/        # One file per route
├── types/        # TypeScript interfaces and types
└── App.tsx       # Router configuration
```

---

## Where to Get Help

If you are stuck:

- **GitHub Issues** — for bugs and feature discussions
- **WhatsApp Community** — for questions and code help → [Join here](https://chat.whatsapp.com/GimdjJcYLyyG62zpgsI0zB)
- **Email** — [opensourcekigali@gmail.com](mailto:opensourcekigali@gmail.com)
- **Discord** - [Open Source Kigali](https://discord.com/invite/3dTFZSn6Tq)

We aim to review all pull requests within **48 hours on weekdays**.

---

## ❤️ Thank You

Every contribution matters — whether it is code, design,
documentation, or feedback.

Welcome to Open Source Kigali 🚀
Together, we build in public and grow together.
