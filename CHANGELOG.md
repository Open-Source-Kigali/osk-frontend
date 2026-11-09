# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- Initial public release of the OSK website
- Homepage with hero, projects preview, events, testimonials, partners marquee, and FAQ
- About page with story, values, vision, and team sections
- Community page with channels, social platforms, and guidelines
- Projects page with filter by category and status
- Events page with upcoming and past events
- Resources page with tutorials, guides, tools, and learning paths
- Partners page with programme details and benefits
- Contact page
- Member application form (POST /members)
- Partner application form (POST /partner-applications) with logo upload
- Admin sign-in at /admin/login and a session-protected /admin shell with placeholder sections
- Admin dashboard counts for events, projects, partners, members, applications, and reviews
- Admin event list, create, edit, and delete
- Admin project list, create, edit, delete, and manual GitHub refresh
- Admin partner list, create, edit, and delete
- Admin member list, edit, and delete
- Admin partner application list, details, status update, and delete
- Admin review moderation for pending, approved, and rejected testimonials
- Lazy-loaded routing with React Router v6
- Fully typed data layer using TypeScript
- Centralised constants for all static data
- Custom hooks: useFilter, useAutoPlay, useScrolled, useDebounce