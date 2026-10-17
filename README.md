# Md Aseer Intiser · Films

> Every shot is a memory I don’t want to forget.

The film portfolio of **Md Aseer Intiser**, a Bangladeshi filmmaker and UX designer based in Tampere, Finland. It brings together travel films, tributes and short stories made between 2016 and today, published on YouTube and Facebook.

**Live site:** [aseer-films.vercel.app](https://aseer-films.vercel.app)
**Design portfolio:** [aseer.design](https://aseer.design)
**Channel:** [Bohrscope on YouTube](https://www.youtube.com/@bohrscope)

---

## About the site

The site is built to feel like sitting in an edit suite rather than scrolling a video gallery.

| Section | What it does |
| --- | --- |
| **Opening reel** | A film-leader countdown, then letterbox bars open on a silent reel that cuts between real films, with a live timecode. |
| **Selected films** | The films I would show first, in large cinematic frames. Hovering over a frame plays a quiet, muted moment from the film. |
| **Every film** | All films on a horizontal editing timeline, oldest to newest. Each clip is sized by the film’s runtime. Scrubbing the playhead updates a large preview monitor. Filters highlight travel films, shorts, tributes, the most watched films and early work. |
| **Theater** | Films play full screen inside the site, with an ambient glow taken from the film’s own colours. Every film also has its own shareable page. |
| **End credits** | About, collaborators and contact, set like the closing credits of a film. |

## Features

- **Plays YouTube and Facebook videos on the site.** A single link is enough. The site detects the platform, builds the right embed and pulls YouTube thumbnails automatically.
- **One data file.** Every film lives in [`src/data/films.json`](src/data/films.json). Adding a film means adding one entry.
- **Shareable film pages.** Each film gets its own URL at `/films/<slug>/` with Open Graph previews and `VideoObject` structured data for search engines.
- **Combined reach.** Films posted on both platforms show their combined view count, always rounded down so the number never overstates.
- **Bangla and English.** Bangla titles and captions are tagged with the correct language and set in Noto Sans Bengali.
- **Accessible by default.** Semantic HTML, a skip link, visible focus states, keyboard control of the timeline (arrow keys, Home and End), a native `<dialog>` for the player, a pause control for the moving reel, and full support for reduced motion.
- **Light on data.** Static HTML, no framework runtime, self-hosted fonts, lazy-loaded images, and the background reel only runs on larger screens with a fine pointer. Phones and data-saver mode get slow poster crossfades instead.

## Tech stack

- [Astro 7](https://astro.build): static site generation
- Plain CSS with custom properties, and a small amount of TypeScript for interaction
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) and the [Facebook embedded video player](https://developers.facebook.com/docs/plugins/embedded-video-player/)
- [Jost](https://fontsource.org/fonts/jost), [IBM Plex Mono](https://fontsource.org/fonts/ibm-plex-mono) and [Noto Sans Bengali](https://fontsource.org/fonts/noto-sans-bengali), self-hosted through Fontsource
- Hosted on [Vercel](https://vercel.com). Every push to `main` deploys automatically.

No paid services, API keys or trackers are used.

## Project structure

```
aseer-films/
├── public/
│   ├── favicon.svg
│   └── posters/              Poster stills for films without a YouTube thumbnail
├── src/
│   ├── components/
│   │   ├── Hero.astro        Opening reel and title card
│   │   ├── Selected.astro    Selected films
│   │   ├── Edit.astro        Timeline, monitor and filters
│   │   ├── Theater.astro     Full-screen player
│   │   ├── Credits.astro     About and contact
│   │   ├── Header.astro
│   │   └── Poster.astro      Poster image with a title-card fallback
│   ├── data/
│   │   └── films.json        All films, the hero reel and the selection
│   ├── layouts/Base.astro    Page shell, metadata and intro countdown
│   ├── lib/films.ts          Link parsing, formatting and derived data
│   ├── pages/
│   │   ├── index.astro
│   │   └── films/[slug].astro  One page per film
│   ├── scripts/              Shared browser helpers
│   └── styles/global.css     Colour, type and motion tokens
└── astro.config.mjs
```

## Adding a film

1. Open [`src/data/films.json`](src/data/films.json) and add an entry to `films`:

   ```json
   {
     "slug": "my-new-film",
     "title": "My New Film",
     "url": "https://www.youtube.com/watch?v=VIDEO_ID",
     "date": "2026-11-02",
     "runtime": 95,
     "kind": "Travel",
     "logline": "One sentence about the film."
   }
   ```

2. Commit and push. Vercel publishes the change in about a minute.

| Field | Required | Notes |
| --- | --- | --- |
| `slug` | Yes | Lowercase with dashes. Becomes the film’s URL. |
| `title` | Yes | Bangla titles are fine. Add `titleLatin` and `"language": "bn"` alongside them. |
| `url` | Yes | The link that plays on the site. YouTube is preferred when a film is on both platforms. |
| `date` | Yes | `YYYY-MM-DD`, or just `YYYY` when the exact date is unknown. |
| `runtime` | Yes | Length in seconds. Sets the clip length on the timeline. |
| `kind` | Yes | `Travel`, `Short`, `Tribute`, `Teaser`, `Essay`, `Digital story`, `Sports` or `Campus`. |
| `facebook` | No | A second link when the film is also on Facebook. |
| `subtitle`, `logline`, `notes` | No | Short line, one-sentence summary and a longer note. |
| `place` | No | Where it was filmed. |
| `views` | No | `{ "youtube": 1200, "facebook": 4000 }`. Shown once the total passes 1,000. |
| `credits` | No | `[{ "role": "Music", "name": "Artist, \"Track\"" }]` |
| `early` | No | `true` puts the film under Early work. |

To feature a film, add its slug to `selected`. To include it in the opening reel, add it to `hero.reel` (YouTube films only).

### Facebook films

Facebook videos must be set to **Public** to play on the site. Facebook does not share thumbnails with other websites, so add a 16:9 still as `public/posters/<slug>.webp` (1600 × 900 works well) and `public/posters/<slug>-small.webp` (480 × 270). Until a poster exists, the film shows a typographic title card.

## Running locally

Requires **Node.js 22.22 or newer**.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Deployment

The repository is connected to Vercel. Vercel detects Astro automatically and needs no extra settings:

- Build command: `npm run build`
- Output directory: `dist`

Every push to `main` creates a production deployment, and pull requests get preview links.

## Licence

The **source code** is released under the MIT Licence.
The **films, posters, stills and written content** are © Md Aseer Intiser, all rights reserved. Clips from third-party films used in *Where the Past and Future Meet* belong to their respective owners.

See [LICENSE](LICENSE) for details.

## Contact

**Md Aseer Intiser** · [md.aseerintiser@gmail.com](mailto:md.aseerintiser@gmail.com) · [aseer.design](https://aseer.design) · [LinkedIn](https://www.linkedin.com/in/md-aseer-intiser/)
