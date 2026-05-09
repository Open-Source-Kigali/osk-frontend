# Contributing to Open Source Kigali Website

Thank you for your interest in contributing to the **Open Source Kigali Website** 🎉  
We’re excited to have you here. This guide will help you go from setup to a successfully merged pull request.

---

## 📌 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What We Need Help With](#what-we-need-help-with)
- [Before You Start](#before-you-start)
- [Setting Up Locally](#setting-up-locally)
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

##  What We Need Help With

All work is tracked using GitHub Issues.

| Label              | Meaning |
|--------------------|--------|
| `good first issue` | Beginner-friendly tasks |
| `help wanted`      | Needs community support |
| `bug`              | Something is broken |
| `enhancement`      | Feature improvements |
| `documentation`    | Docs or README updates |
| `design`           | UI/UX improvements |

 Start here:  
https://github.com/opensourcekigali/osk-website/labels/good%20first%20issue

---

##  Before You Start

Before writing any code:

1. Check if an issue already exists.
2. If it exists, comment and assign yourself.
3. If not, create an issue first before starting work.
4. Keep each pull request focused on **one issue only**.

This makes reviews faster and easier.

---

##  Setting Up Locally

```bash
# 1. Fork the repository, then clone your fork
git clone https://github.com/YOUR_USERNAME/osk-website.git
cd osk-website

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

##  Making a Contribution

```bash
# 1. Create a new branch
git checkout -b feat/add-new-feature
git checkout -b fix/navbar-bug
git checkout -b docs/update-readme

# 2. Make your changes

# 3. Run checks before committing
npm run lint
npm run typecheck
npm run build

# 4. Commit your changes
git add .
git commit -m "feat: add new feature description"

# 5. Push your branch
git push origin feat/add-new-feature

# 6. Open a Pull Request on GitHub
```

---

##  Pull Request Checklist

Before submitting your PR:

- [ ] Code passes `npm run lint`
- [ ] Code passes `npm run typecheck`
- [ ] Project builds successfully (`npm run build`)
- [ ] Changes are tested locally
- [ ] No `console.log` left in code
- [ ] No hardcoded data in components (use `src/constants/`)
- [ ] Types are defined in `src/types/`
- [ ] PR is linked to an issue
- [ ] PR description clearly explains **what and why**

---

##  Commit Message Format

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
- `style` → formatting (no logic change)
- `refactor` → code restructuring
- `chore` → maintenance tasks
- `test` → testing changes

---

## Code Style Guidelines

- Use **TypeScript only** (`.ts` / `.tsx`)
- Avoid `any` types
- Keep reusable data in `src/constants/`
- Keep interfaces in `src/types/`
- Prefer **Tailwind CSS** over inline styles
- Only use inline styles for dynamic values
- One main component per file
- Avoid adding new libraries without discussion

---

##  Project Structure

```bash
src/
├── assets/       # Images & static files
├── components/   # Reusable UI components
├── constants/    # Static data (events, projects, partners)
├── hooks/        # Custom React hooks
├── lib/          # Utility functions & API helpers
├── pages/        # Route pages
├── types/        # TypeScript types
└── App.tsx       # Main router setup
```

---

##  Where to Get Help

If you’re stuck:

-  GitHub Issues — for bugs & feature discussions
-  Discord #code-review — for code help
-  Discord #general — for anything else

We aim to review all pull requests within **48 hours (weekdays)**.

---

## ❤️ Thank You

Every contribution matters — whether it's code, design, documentation, or feedback.

Welcome to Open Source Kigali 🚀
Together, we build in public and grow together.