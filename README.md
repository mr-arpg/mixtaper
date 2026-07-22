# Mixtaper

**[mr-arpg.github.io/mixtaper](https://mr-arpg.github.io/mixtaper/)** — turn a YouTube playlist into a nostalgic mixtape CD you can share.

Paste a playlist link, write a handwritten title on the disc, and send someone a URL. Everything lives in the link — no accounts, no backend, no tracking.

## How it works

1. Open [Mixtaper](https://mr-arpg.github.io/mixtaper/)
2. Paste a YouTube playlist URL or ID
3. Add a title (shown on the CD label)
4. Share the URL — the recipient gets their CD

Example:

```
https://mr-arpg.github.io/mixtaper/?list=YOUR_PLAYLIST_ID&title=Awesome%20Mix%20for%20Melina
```

| Param   | Description                          |
| ------- | ------------------------------------ |
| `list`  | YouTube playlist ID (required)       |
| `title` | Handwritten label text (optional)    |

## Features

- Spinning CD with click-to-play / pause
- Handwritten title on the disc (Sedgwick Ave Display)
- 7-segment LED track counter
- Prev / next controls with playlist loop
- Fully responsive — text scales with the disc via container queries

## Development

Requires [Node.js](https://nodejs.org) 22+ (or [Bun](https://bun.sh)).

```sh
git clone https://github.com/mr-arpg/mixtaper
cd mixtaper
npm install
npm run dev
```

Other scripts:

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run build`    | Production build               |
| `npm run build:pages` | Static build for GitHub Pages |
| `npm run preview`  | Preview production build       |
| `npm run lint`     | Run ESLint                     |

## GitHub Pages

The site deploys automatically on every push to `main` via [GitHub Actions](.github/workflows/deploy-github-pages.yml).

**Live URL:** [https://mr-arpg.github.io/mixtaper/](https://mr-arpg.github.io/mixtaper/)

### One-time repo setup

1. Open **[Settings → Pages](https://github.com/mr-arpg/mixtaper/settings/pages)** in the GitHub repo
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. Set **Branch** to `gh-pages` and folder **`/ (root)`**, then click **Save**

The workflow pushes the built site to the `gh-pages` branch on every push to `main`. The first successful run creates that branch — if it does not appear yet, re-run the workflow from the **Actions** tab after it completes.

> **Note:** If you previously set Source to **GitHub Actions**, switch it to **Deploy from a branch** → `gh-pages` as described above.

### Local Pages build

```sh
# Linux / macOS
VITE_BASE_PATH=/mixtaper/ VITE_PRERENDER=true npm run build:pages

# Windows PowerShell
$env:VITE_BASE_PATH="/mixtaper/"; $env:VITE_PRERENDER="true"; npm run build:pages
```

Output goes to `.output/public/`.

## License

Mixtaper is **dual-licensed**:

- **Non-commercial use** — free under the [PolyForm Noncommercial License 1.0.0](LICENSE) (personal projects, hobbies, education, non-profits, etc.)
- **Commercial use** — requires a separate license; see [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md)

Copyright © 2026 [Armando Gonçalves](https://github.com/mr-arpg).

## Built with

- [TanStack Start](https://tanstack.com/start)
- TypeScript · React · Tailwind CSS
- YouTube IFrame API
