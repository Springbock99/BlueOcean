# Blue Ocean Residential — Mozambique

A rebuild of [blueoceanmoz.site](https://blueoceanmoz.site/) — same content and
page structure, new logo, new design, and off the website builder.

Plain HTML, CSS and JavaScript. **No framework, no npm, no build step.** What is
in the repo is exactly what gets served.

## Structure

```
index.html                    home
accommodations/index.html     → /accommodations
dining/index.html             → /dining
experiences/index.html        → /experiences
contact/index.html            → /contact      (new — the old site had no contact page)
assets/site.css               all styling (design tokens at the top)
assets/site.js                theme toggle + scroll reveal
assets/logo.png               full lockup — master, transparent background
assets/emblem.png             circular mark — master
assets/logo.webp              what the pages load (133 KB vs 723 KB)
assets/emblem.webp            ditto (68 KB vs 368 KB)
assets/photos/*.webp          23 photos from the old site, resized and recompressed
assets/favicon-32.png
assets/apple-touch-icon.png
```

Each page is a folder containing `index.html`, which gives clean URLs like
`/dining` with no server config. To add a page, copy an existing folder, rename
it, and add a link to the nav and footer of **every** page.

## Where the content came from

The copy and photography were taken from the existing site. Text that appears
here is text that appeared there — nothing about the business has been invented.

Where the old site had nothing to say, the gap is marked `[in square brackets]`
rather than filled with plausible-sounding filler. Find them all with:

```sh
grep -rn "\[" --include="*.html" .
```

The **Experiences** page needs the most attention: on the old site it was an
empty page with only a heading, so its structure here is built around the
photographs and every description is a placeholder.

The old site's stock photos (one Unsplash, one Pexels) were dropped — only your
own photography was carried over. Some source images are genuinely low
resolution (360 px wide), so they are only used at small sizes in galleries.
Reshooting those is worthwhile.

## Running it locally

No install needed — just serve the folder:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. (Opening the `.html` files directly with
`file://` mostly works, but the folder-style links like `/dining/` will not, so
use the server.)

## Editing the design

Everything you are likely to change lives in the `:root` block at the top of
`assets/site.css` — colours, fonts, corner radius, spacing rhythm, page width.
The dark palette is the `[data-theme="dark"]` block right below it. Change a
token once and it updates every page.

The palette was sampled from the logo artwork itself:

| Token     | Value     | Where it comes from         |
| --------- | --------- | --------------------------- |
| `--ink`   | `#0d2440` | the wordmark navy           |
| `--coral` | `#d98a6c` | the sunset                  |
| `--sea`   | `#8eb4c7` | the water                   |
| `--bg`    | `#f8f8f6` | the logo's paper background |

Type is **Cormorant Garamond** (light, tracked out) for headings — matching the
high-contrast serif of the wordmark — and **Inter** for body text and the
tracked-caps labels, which echo "RESIDENTIAL MOZAMBIQUE". Both load from Google
Fonts in each page's `<head>`; swap the `<link>` and the `--font-display` /
`--font-body` tokens together.

## Still to do

- **Fill in the `[bracketed]` gaps** — room counts, serving times, the address,
  and everything on Experiences.
- **The address and a map.** The old site never said where it is. That is the
  first thing a guest wants to know.
- **Contact form** — `contact/index.html` posts to Formspree. Create a free form
  at [formspree.io](https://formspree.io) and replace `YOUR_FORM_ID` in the
  `action` attribute. Until then the form sends nothing; the WhatsApp and email
  links beside it work regardless.
- **Guest reviews** are carried over unattributed, as they were on the old site.
  Real names or a link to the source would make them land better.
- **Social preview image** — add `assets/og.png` (1200×630) and uncomment the
  `og:url` / `og:image` tags in each page's `<head>`.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site goes live at `https://<username>.github.io/<repo>/`.

All internal links are **relative** (`../dining/`), so the site works both at
that sub-path and at a domain root.

### Pointing blueoceanmoz.site at it

1. Add a file called `CNAME` at the repo root containing just `blueoceanmoz.site`
   — no `https://`, no trailing slash.
2. Move the domain's DNS from Hostinger to GitHub Pages.
3. Settings → Pages → Custom domain, and tick **Enforce HTTPS**.
4. Uncomment the `og:url` / `og:image` tags.

Do this last — the moment DNS moves, the old site is gone.
