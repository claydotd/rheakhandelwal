# Rhea Khandelwal — website

React + Vite multi-page site with a simple admin CMS. Content is driven by a JSON document: **localStorage + seed file** for local/GitHub Pages prototyping, and **Netlify Blobs** (via Functions) in production.

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/how-i-work` | How I Work (includes FAQ section) |
| `/fees` | Fees |
| `/about` | About Me |
| `/contact` | Contact (Netlify Forms) |
| `/admin` | Content admin (not linked in the public nav) |

## Develop locally

```bash
npm install
npm run dev
```

Open `/admin` to edit content. Saves go to **localStorage** in this browser. While `npm run dev` is running, saves also write the committed seed at [`public/content/site.json`](public/content/site.json) (and the Netlify default seed), so a normal git commit/deploy includes your latest content.

Reset prototype edits in the browser console (then reload to fall back to the seed file):

```js
localStorage.removeItem('rk-site-content')
```

## Deploy to GitHub Pages (prototype)

Deploys via GitHub Actions on every push to `main` (workflow: [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)). Build keeps `base: /rheakhandelwal/` and `VITE_CONTENT_BACKEND=local`.

1. Push this repo to GitHub (repo name should match the Vite base: `rheakhandelwal`).
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually under **Actions**). Site URL: `https://<user>.github.io/rheakhandelwal/`.

Admin works on GitHub Pages with localStorage only (per visitor/browser). Contact form UI works; submissions are not delivered until Netlify.

If you use a **custom domain** on GitHub Pages, set `VITE_BASE=/` in the workflow build step and set `pathSegmentsToKeep = 0` in `public/404.html`.

## Deploy to Netlify (production)

1. Connect the repo in Netlify (build settings come from [`netlify.toml`](netlify.toml)).
2. Set environment variable **`ADMIN_PASSWORD`** (required). Optionally set `ADMIN_SESSION_SECRET` for signing admin session tokens (falls back to `ADMIN_PASSWORD`).
3. Enable **Form detection** (Forms are declared in `index.html` + the Contact page). Submissions appear under **Forms → contact**.
4. Deploy. Build uses `VITE_CONTENT_BACKEND=netlify` and `VITE_BASE=/`.

Admin at `/admin` prompts for the shared password. Content and images are stored in Netlify Blobs via `/api/content` and `/api/image`.

### API (Netlify only)

| Endpoint | Methods | Auth |
| --- | --- | --- |
| `/api/auth` | `POST` `{ password }` → `{ token }` | — |
| `/api/content` | `GET` public, `PUT` body = site JSON | Bearer token on `PUT` |
| `/api/image` | `GET ?key=`, `POST` `{ dataUrl, contentType }` | Bearer token on `POST` |

## Content model

See `SiteContent` in [`src/content/types.ts`](src/content/types.ts). Page bodies and FAQ answers support markdown.
