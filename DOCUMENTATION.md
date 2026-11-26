# Portfolio Documentation

**Owner:** Abhoy Mallik, Flutter Developer
**Live site:** https://abhoy84.github.io/
**Source code:** https://github.com/Abhoy84/Abhoy84.github.io
**Public CV:** https://abhoy84.github.io/assets/cv/Abhoy_Mallik_CV.pdf

---

## Contents

1. [What this project is](#1-what-this-project-is)
2. [Features](#2-features)
3. [Technology](#3-technology)
4. [Folder structure](#4-folder-structure)
5. [How it works](#5-how-it-works)
6. [First-time setup on a new PC](#6-first-time-setup-on-a-new-pc)
7. [Everyday workflow: make a change and publish it](#7-everyday-workflow-make-a-change-and-publish-it)
8. [How to make common changes](#8-how-to-make-common-changes)
9. [Updating the CV](#9-updating-the-cv)
10. [Testing checklist](#10-testing-checklist)
11. [Troubleshooting](#11-troubleshooting)
12. [Privacy rules](#12-privacy-rules)
13. [Still to do](#13-still-to-do)

---

## 1. What this project is

A personal portfolio website with one big idea: **"One Codebase, Four Platforms."**
Just like a Flutter app, the same website re-skins itself to look like **Android, iOS, Windows or macOS**.

It is a static website: plain **HTML, CSS and a little JavaScript**.
There is no framework, no `npm install` and no build step. You edit the files and push them, and GitHub Pages publishes the site.

---

## 2. Features

| Section | What it shows |
|---|---|
| **Top controls** | Platform switcher (Android / iOS / Windows / macOS), Recruiter mode switch, light/dark theme button |
| **Platform chrome** | macOS menu bar + dock (icons grow on hover), Windows taskbar + Start menu, Android status bar + bottom navigation + floating contact button, iOS status bar + Dynamic Island + tab bar |
| **Hero** | Name, role, key facts, and a working **Hot Reload editor**: edit the colour or greeting in the Dart code, press `r` and the profile card updates. `R` restarts. A terminal prints Flutter-style logs |
| **Selected work** | Horizontal **carousel** of project cards (snap scrolling, arrows, mouse drag, progress bar). Each card opens a full **case study** pop-up |
| **Experience & milestones** | Job details at Solution Infotech plus achievement cards styled as notifications |
| **Deployment** | Build-and-release pipeline for all 4 platforms (click any stage for details), platform matrix, release history, CI/CD workflow example |
| **Results** | Animated numbers (−35%, −40%, +30%, +25%), frame-timing chart, optional live FPS meter |
| **Skills** | 3D Clean Architecture layers, animated Bloc loop, grouped skill chips, education, languages |
| **Contact** | Email, LinkedIn, GitHub, CV download, and a contact form |
| **Recruiter mode** | Removes all effects and shows a clean one-page view with a CV download and print button |

**Useful extras**

- Add `?platform=ios` (or `android`, `windows`, `macos`) to the link to open a specific style, e.g. `https://abhoy84.github.io/?platform=macos`.
- The visitor's choice of platform, theme and recruiter mode is remembered in their browser.
- Works on phones, tablets and desktops. Respects the "reduce motion" accessibility setting.

---

## 3. Technology

| Area | Used |
|---|---|
| Markup | Semantic HTML5, `<dialog>` for case studies, Popover API for pipeline details and the Start menu |
| Styling | CSS custom properties, cascade layers (`@layer`), `@property`, container queries, `:has()`, scroll-snap, CSS 3D transforms |
| Animation | View Transitions API (platform/theme switching), scroll-driven animations (`animation-timeline: view()`), SVG `animateMotion` |
| JavaScript | Vanilla JS only, split into 3 small files |
| Hosting | GitHub Pages (free), HTTPS by default |
| CV | HTML template printed to PDF with Microsoft Edge by a PowerShell script |

Newer browser features are **progressive enhancements**: older browsers still show all the content, just with simpler effects.

---

## 4. Folder structure

```
Abhoy84.github.io/
├─ index.html               All page content (text, projects, case studies, skills...)
├─ DOCUMENTATION.md         This file
├─ README.md                Short overview
├─ .nojekyll                Tells GitHub Pages to serve files as they are
├─ css/
│  ├─ tokens.css            Layer order, fonts, spacing, light/dark colours
│  ├─ base.css              Reset, buttons, badges, chips, shared pieces, utilities
│  ├─ platforms.css         The 4 skins: colours, wallpapers, system bar, dock/taskbar/nav,
│  │                        window title bars, Dynamic Island, Start menu
│  ├─ sections.css          Hero/IDE, carousel, projects, experience, deployment,
│  │                        results, skills, contact, case-study dialogs, animations
│  └─ recruiter.css         Recruiter mode and print (Ctrl+P) styles
├─ js/
│  ├─ platform-switch.js    Switching platforms (with View Transitions)
│  ├─ hot-reload.js         Code editor, terminal, r / R keys
│  └─ main.js               Theme, recruiter mode, clocks, dialogs, active dock item,
│                           counters, frame chart, FPS meter, carousel, contact form
├─ assets/
│  ├─ cv/Abhoy_Mallik_CV.pdf  Public CV (no phone number)
│  ├─ icons/favicon.svg     Browser tab icon
│  └─ img/                  Put app screenshots here
└─ tools/
   ├─ build-cv.ps1          Rebuilds the CV PDFs
   └─ cv/cv-source.html     The CV content (edit this to change the CV)
```

---

## 5. How it works

### Platform skins
The `<html>` tag carries `data-platform="android" | "ios" | "windows" | "macos"`.
In `css/platforms.css`, each platform sets its own variables: accent colour, wallpaper, corner radius, blur, font and bar heights. Every section uses those variables, so changing one attribute re-skins the whole site.
Elements that belong to only one platform use helper classes: `only-mac`, `only-win`, `only-android`, `only-ios`, `only-phone`.

### Light / dark theme
`data-theme="light" | "dark"` on `<html>`. Dark colours are in `tokens.css` and in the `[data-theme="dark"]` blocks in `platforms.css`.

### No flash on load
A tiny script in `<head>` reads the saved platform/theme (or detects the visitor's device) **before** the page draws, so the right skin appears immediately.

### Recruiter mode
The `#recruiter` switch adds `data-recruiter` to `<html>`. `css/recruiter.css` hides decoration and turns the carousel back into a grid. It also works without JavaScript thanks to `:has(#recruiter:checked)`.

### Hot reload editor
`js/hot-reload.js` reads the two highlighted values in the code (`data-edit="accent"` and `data-edit="greeting"`) and applies them to the profile card when you press `r`. An invalid colour shows an error in the terminal.

### Carousel
`.apps` is a horizontal grid with `scroll-snap`. `main.js` adds the arrow buttons, mouse dragging and the progress bar. Cards fade in using `animation-timeline: view(inline)`.

### Case studies
Each project has a `<dialog class="case" id="case-...">` near the bottom of `index.html`. Any button with `data-open="case-..."` opens it.

---

## 6. First-time setup on a new PC

You only need to do this once per computer.

### Step 1: Install the tools

| Tool | Why | Install (PowerShell) |
|---|---|---|
| **Git** | Download and upload the code | `winget install --id Git.Git -e` |
| **VS Code** | Edit the files | `winget install --id Microsoft.VisualStudioCode -e` |
| **Live Server** (VS Code extension) | Preview the site with auto-refresh | In VS Code: Extensions → search "Live Server" (by Ritwick Dey) → Install |
| **GitHub CLI** *(optional)* | Easy GitHub sign-in | `winget install --id GitHub.cli -e` |

Alternative to Live Server: if Python is installed, `python -m http.server 5500` also works.

### Step 2: Download the project from GitHub

```powershell
cd $HOME\Documents
git clone https://github.com/Abhoy84/Abhoy84.github.io.git
cd Abhoy84.github.io
```

### Step 3: Set your name for commits (inside the project folder)

```powershell
git config user.name "Abhoy Mallik"
git config user.email "162316791+Abhoy84@users.noreply.github.com"
```

The email above is GitHub's private "noreply" address for your account, so your real email stays hidden.

### Step 4: Sign in to GitHub (so you can push)

```powershell
gh auth login
```

Choose **GitHub.com → HTTPS → Yes (authenticate Git) → Login with a web browser**, then approve in the browser.
Without GitHub CLI: just run `git push` later. Git Credential Manager will open a browser window to sign in.

---

## 7. Everyday workflow: make a change and publish it

```
pull latest  →  run locally  →  edit  →  check in browser  →  commit  →  push  →  live in ~1 minute
```

**1. Open the project and get the latest version**
```powershell
cd $HOME\Documents\abhoy84.github.io
git pull
code .
```

**2. Run it locally**

- In VS Code, right-click `index.html` → **Open with Live Server**. The page reloads every time you save.
- Or in a terminal: `python -m http.server 5500`, then open http://localhost:5500

> Opening `index.html` by double-clicking also works, but a local server behaves exactly like the real site.

**3. Make your changes** (see section 8), save, and check them in the browser.
Check all 4 platform styles, dark mode, recruiter mode and a phone size (in the browser press `F12` → device toolbar `Ctrl+Shift+M`).

**4. Publish**
```powershell
git add -A
git commit -m "Describe what you changed"
git push
```

**5. Check the live site** after about a minute: https://abhoy84.github.io/
Press `Ctrl+F5` to bypass the browser cache.
Build status: GitHub repo → **Actions** tab (or **Settings → Pages**).

---

## 8. How to make common changes

All page content is in **`index.html`**. Use `Ctrl+F` in VS Code to find the text you want to change.

### Change any text
Find the sentence in `index.html` and edit it. Keep the HTML tags around it.

### Update a number (users, apps, results)
Search for the number (e.g. `20,000+` or `30+`). It can appear in several places: hero facts, profile card, project card, notifications, case study, the `<meta name="description">` at the top, and `js/hot-reload.js` (terminal lines).
Animated result numbers use `data-count`, e.g. `<p class="stat__num" data-count="35" data-prefix="&minus;" data-suffix="%">`. Change `data-count` and the text inside.

### Add a new project

1. **Card:** copy one `<article class="app-card">…</article>` inside `<div class="apps">` and edit the name, text, badges, pills, metric and colour (`--app: linear-gradient(...)`).
2. **Case study:** copy one `<dialog class="case" id="case-...">…</dialog>` near the bottom, give it a new id (e.g. `case-newapp`), and edit the content.
3. Point the card's button to it: `data-open="case-newapp"`.
4. *(Optional)* Add it to the Windows Start menu (`id="start-menu"`) and the platform matrix table.

### Add real screenshots

1. Save images as **WebP** (use https://squoosh.app) in `assets/img/`, e.g. `dth-phone.webp`.
2. In the case study, replace the `<div class="mock" aria-hidden="true">…</div>` block with:
   ```html
   <img src="assets/img/dth-phone.webp" alt="DTH LMS Pro course list on Android" loading="lazy" width="390" height="844">
   ```

3. Always write a meaningful `alt` text.

### Add a Play Store / App Store link
In the case study there is a commented-out link (search for `TODO: add the Play Store link`). Remove the `<!--` and `-->` around it and paste the real URL.

### Add or remove a skill
Find the skill group under `<section ... id="skills">` and add or remove `<li>Skill</li>` items.

### Add an experience notification
Copy one `<li class="notif reveal">…</li>` inside `<ol class="notifs">` and edit the app name, time, title and text.

### Change platform colours or wallpapers
Edit the variables in `css/platforms.css`, e.g. `--accent`, `--accent-text`, `--wallpaper` for each `[data-platform="..."]` block (light) and `[data-platform="..."][data-theme="dark"]` block (dark).
Keep enough contrast between text and background.

### Connect the contact form

1. Create a free form at https://formspree.io and copy its ID.
2. In `index.html`, replace `YOUR_FORM_ID` in `action="https://formspree.io/f/YOUR_FORM_ID"`.
Until then, the form opens the visitor's email app instead.

### Add a social preview image
Make a 1200×630 screenshot, save it as `assets/img/og-image.png`, then uncomment the `og:image` line in the `<head>` of `index.html`. This controls the picture shown when the link is shared on LinkedIn or WhatsApp.

### Use a custom domain (optional)
Buy a domain, then in GitHub → repo **Settings → Pages → Custom domain**, enter it and add the DNS records GitHub shows you. Tick **Enforce HTTPS**.

---

## 9. Updating the CV

The CV content lives in **`tools/cv/cv-source.html`** (it has a `{{PHONE}}` placeholder; your number is never stored in the repo).

1. Edit `tools/cv/cv-source.html` in VS Code.
2. Rebuild the PDFs from the project folder:
   ```powershell
   # Public CV for the website (no phone number):
   .\tools\build-cv.ps1

   # Also a private CV with your phone number, saved to Documents (not uploaded):
   .\tools\build-cv.ps1 -Phone "+91-XXXXXXXXXX"
   ```
   If PowerShell blocks the script, run this once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

3. Open the PDFs and check they still fit on **one page**. If not, shorten text or reduce the `font-size` at the top of `cv-source.html`.
4. Commit and push (section 7). The website's "Download CV" buttons automatically use the new `assets/cv/Abhoy_Mallik_CV.pdf`.

---

## 10. Testing checklist

Before every push:

- [ ] All 4 platform styles look right (Android, iOS, Windows, macOS)
- [ ] Light and dark theme
- [ ] Recruiter mode on and off
- [ ] Phone size (`F12` → `Ctrl+Shift+M`) and desktop size
- [ ] Carousel arrows, swipe and drag work; case studies open and close (Esc or ×)
- [ ] Press `r` in the hero: hot reload still works
- [ ] No red errors in the browser console (`F12` → Console)
- [ ] Every number matches your CV
- [ ] Links work (email, LinkedIn, GitHub, CV download)

Occasionally: run **Lighthouse** (`F12` → Lighthouse → Analyze) and aim for 90+ in all categories.

---

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| Changes don't appear on the live site | Wait 1–2 minutes, then `Ctrl+F5`. Check the build in the repo's **Actions** tab |
| `git push` is rejected ("fetch first") | Run `git pull`, then `git push` again |
| `git push` asks for a password | Run `gh auth login`, or let Git Credential Manager open the browser sign-in. GitHub does not accept your account password in the terminal |
| "Permission denied" / 403 on push | You're signed in to a different GitHub account. Run `gh auth status` and sign in as **Abhoy84** |
| The site looks unstyled locally | Make sure you opened the folder that contains `index.html`, and use Live Server or `python -m http.server` |
| A platform switch has no animation | Your browser doesn't support View Transitions yet. It still switches, just instantly |
| `build-cv.ps1` won't run | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then try again |
| The CV became 2 pages | Shorten some bullets or reduce `font-size` in `tools/cv/cv-source.html` |
| I broke something | `git status` shows changed files; `git restore index.html` undoes uncommitted changes to a file. Every pushed version is also in the repo history on GitHub |

---

## 12. Privacy rules

- **Never** put your phone number in any file inside this repository: it is public.
- The public CV is built **without** the phone number. Use `-Phone` only for the private copy, which is saved outside the repo.
- Contact on the website goes through email, LinkedIn and the contact form.
- Commits use your GitHub noreply email (section 6, step 3).

---

## 13. Still to do

Search the code for `TODO` to find these:

1. Replace the drawn mockups in the case studies with real app screenshots.
2. Add the Google Play / App Store links in the case studies.
3. Connect the contact form to Formspree.
4. Add a social preview image (`og:image`).
5. Add platform badges for the Franchise & Teacher Admin app.
6. Check the order of the release history entries and add dates.
7. Remove the "Open to new opportunities" badge when you're not job hunting.
