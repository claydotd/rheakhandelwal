# Rhea Khandelwal — website

React + Vite multi-page site with a simple admin CMS. Content is driven by a JSON document: **localStorage + seed file** for local/GitHub Pages prototyping, and **Netlify Blobs** (via Functions) in production.

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/how-i-work` | How I Work (includes FAQ section) |
| `/fees` | Fees |
| `/about` | About Me |
| `/contact` | Contact (Will use Netlify forms) |
| `/admin` | Content admin (not linked in the public nav) |

## Netlify Environment Variables

| Variable | Description |
| --- | --- |
| `ADMIN_PASSWORD` | Password for the admin interface |
| `ADMIN_SESSION_SECRET` | Secret for signing admin session tokens |

Admin at `/admin` prompts for the shared password. Content and images are stored in Netlify Blobs via `/api/content` and `/api/image`.

## Content model

See `SiteContent` in [`src/content/types.ts`](src/content/types.ts). Page bodies and FAQ answers support markdown.
