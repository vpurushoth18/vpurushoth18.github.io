# Purushoth Velayuthan, personal academic website

A plain HTML/CSS/JS site. No build step, no frameworks, no paid services. It runs free on GitHub Pages.

Design: a classic faculty-page layout with a profile sidebar, serif type and citation-style publication lists.

## Files

```
index.html          Home page: about, research interests, news, selected publications, experience, teaching, education, honors
publications.html   Full publication list with filter buttons
styles.css          All colors, fonts and layout (colors are at the top under :root)
script.js           Dark mode, mobile menu, publication filter, hides unfilled links
assets/img/         profile.jpg (your photo) and favicon.svg
assets/fonts/       Self-hosted Source Serif 4 and Inter fonts (SIL Open Font License)
assets/cv.pdf       Your CV, linked from the nav and sidebar
.nojekyll           Tells GitHub Pages to serve the files as they are
```

## Put it online for free (about 10 minutes)

1. Sign in to GitHub. Note your username exactly, for example `puru-v`.
2. Create a new repository named **`<your-username>.github.io`** (for example `puru-v.github.io`). Set it to **Public**. Don't add a README.
3. On the new repo page, click **uploading an existing file**. Drag in everything from this folder, including the `assets` folder and the `.nojekyll` file. Click **Commit changes**.
   - On a Mac, press Cmd+Shift+. in Finder to see `.nojekyll`. If it won't upload, skip it; the site still works.
4. Go to **Settings > Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**. Click **Save**.
5. Wait one or two minutes, then open `https://<your-username>.github.io`.

Every later edit you commit (on github.com or with `git push`) goes live within a minute or two.

### Using git instead of the web upload

```bash
cd path/to/this/folder
git init
git add .
git commit -m "First version of my site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-username>.github.io.git
git push -u origin main
```

## Still to add

- [ ] **Photo:** save a portrait as `assets/img/profile.jpg`. Your initials show until then.
- [ ] **CV:** `assets/cv.pdf` is the CV linked from the site. Replace it whenever your CV changes.

## Common edits

- **Add a news item:** copy one `<li><time>...</time>...</li>` line to the top of the news list. Tag classes: `accepted`, `review`, `talk`.
- **Add a paper:** copy a `<li class="pub">` block. The small box on the left is the venue (`<div class="venue">EMNLP<small>2026</small></div>`). On the publications page, `data-tags` decides which filter buttons show it (`audio`, `vl`, `behavior`, `conference`, `journal`).
- **Sidebar (photo, title, links):** it appears at the top of both `index.html` and `publications.html`, so edit it in both files.
- **Change colors:** edit the variables at the top of `styles.css`. `--navy` is for links, `--rust` for the small accents.
- **Remove the collaboration note:** delete the `<div class="notice">` block in `index.html`.

## Custom domain (optional, not free)

`<username>.github.io` costs nothing. If you later buy a domain, add a file named `CNAME` containing just the domain, and set it under Settings > Pages.
