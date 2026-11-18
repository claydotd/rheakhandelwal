# Rhea Khandelwal — website

React + Vite multi-page site with a simple admin CMS. Content is driven by a JSON document: **localStorage + seed file** for local prototyping, and **Netlify Blobs** (via Functions) in production.

**Production:** [https://rheakhandelwal.netlify.app](https://rheakhandelwal.netlify.app)

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/approach` | Approach (includes FAQ section) |
| `/about` | About Me |
| `/contact` | Contact (Netlify Forms) |
| `/admin` | Content admin (not linked in the public nav) |

## Deploy (Netlify)

1. Connect the GitHub repo `claydotd/rheakhandelwal` in Netlify (**Add new site → Import from Git**).
2. Site name: `rheakhandelwal` → `https://rheakhandelwal.netlify.app`.
3. Build settings come from [`netlify.toml`](netlify.toml) (Node 22, publish `dist`, functions in `netlify/functions`).
4. Set environment variables (Site configuration → Environment variables), then redeploy if needed:

| Variable | Description |
| --- | --- |
| `ADMIN_PASSWORD` | Password for the admin interface |
| `ADMIN_SESSION_SECRET` | Secret for signing admin session tokens (use a value distinct from the password) |

5. Disable GitHub Pages for this repo so Netlify is the only live host.

Admin at `/admin` prompts for the shared password. Content and images are stored in Netlify Blobs via `/api/content` and `/api/image`. Contact submissions appear under Netlify → Forms.

## Content model

See `SiteContent` in [`src/content/types.ts`](src/content/types.ts). Page bodies and FAQ answers support markdown.
