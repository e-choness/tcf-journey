# TCF Journey

A personal study journal for preparing for the **TCF Canada exam** (C1 level).

The site tracks:
- **Drill progress** by tâche (listening, reading, speaking, writing)
- **Flashcards** for French vocabulary and grammar
- **Study journal** with reflection posts on what's working

## Features

- **Dark/light theme** toggle with persistent preference
- **Progress tracking** stored in browser localStorage (drills marked done persist across visits)
- **3D cube visualization** showing progress per section
- **Cursor spotlight** effect following mouse movement
- **Responsive design** with mobile navigation
- **Automatic GitHub Pages deployment** on push to main

## Tech Stack

- **Jekyll 4.4** — static site generator
- **SCSS** — styling with CSS custom properties for theming
- **Vanilla JS** — no framework dependencies
- **GitHub Pages** — free hosting with Actions CI/CD

## Local Development

### Setup

```bash
# Install dependencies
bundle install

# Start local server with live reload
docker-compose up
```

Site runs at `http://localhost:4000`

### Key Files

- `_config.yml` — site config, collections, variables
- `_data/` — YAML data files (about, TCF metadata, French cards)
- `_includes/sections/` — page sections (home, TCF, French, blog)
- `_sass/` — stylesheets organized by component/page
- `assets/js/` — JavaScript for interactive features
- `.github/workflows/build.yml` — GitHub Actions CI/CD pipeline

## Deployment

1. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"
   
2. Push to `main` branch:
   ```bash
   git push origin main
   ```
   
   GitHub Actions will automatically build and deploy the site.

## Content Structure

- **Drills** — Jekyll collection in `_tcf/`, grouped by tâche with progress tracking
- **French cards** — Jekyll collection in `_french/`, flip cards with term/meaning
- **Posts** — Blog posts in `_posts/`, date-based Jekyll convention

## Exam Goal

- **Level:** C1 (400+ per section)
- **Exam Date:** TBD (update in `_data/about.yml`)
- **Study Time:** Tracked locally in localStorage
