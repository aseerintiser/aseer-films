# Bohrscope · Films by Md Aseer Intiser

> Every shot is a memory I don’t want to forget.

The film portfolio of **Md Aseer Intiser**, a Bangladeshi filmmaker and UX designer. It brings together travel films, tributes and short stories made between 2016 and today, published on YouTube and Facebook.

**Bohrscope** is the name of his channel: the *bioscope*, the old street peep-show box, plus *Bohr*, his creative alter ego. The site is built as a bioscope you look into.

**Live site:** [aseer-films.vercel.app](https://aseer-films.vercel.app)
**Design portfolio:** [aseer.design](https://aseer.design)
**Channel:** [Bohrscope on YouTube](https://www.youtube.com/@bohrscope)

---

## The ride

| Scene | What happens |
| --- | --- |
| **The peephole** | A black screen with a small lens that follows the cursor. Through it, the films are already playing. Visitors enter with sound or in silence, and the lens irises open to full screen. |
| **Title card** | The BOHRSCOPE wordmark builds letter by letter over a trailer that cuts between real films, with gate weave, light leaks and a flash on every cut. With sound on, each film's own audio fades into the next. |
| **Now showing** | A projection room. A beam with drifting dust falls on a screen showing a live, muted preview of the selected films. |
| **Four reels** | Every film, newest first, told in Aseer's own words as subtitles: *Latest films*, *Stories, trips and life*, *Hits and hills*, *Where it started*. Each reel is a 35mm strip that slides sideways as you scroll. The frame in the gate lights up and flickers, and red grease-pencil notes mark real milestones. |
| **The archive** | Every film on an editing timeline. Clip length follows runtime, the playhead drives a preview monitor, and filters pick out travel films, shorts, tributes, the most watched films and early work. |
| **Theater** | Films play inside the site. The theater opens as an iris from the frame you clicked. Every film also has its own shareable page. |
| **End credits** | Credits roll over a photo of Aseer behind the camera, with real numbers: films, running time, views, years and languages. |
| **After the credits** | The newest film, revealed through an iris, and an invitation to make the next one together. |

## Features

- **Plays YouTube and Facebook videos on the site.** A single link is enough. The site detects the platform, builds the right embed and pulls YouTube thumbnails automatically.
- **One data file.** Every film lives in [`src/data/films.json`](src/data/films.json). Adding a film means adding one entry.
- **Shareable film pages.** Each film gets its own URL at `/films/<slug>/` with Open Graph previews and `VideoObject` structured data for search engines.
- **Combined reach.** Films posted on both platforms show their combined view count, always rounded down so the number never overstates.
- **Bangla and English.** Bangla titles and captions are tagged with the correct language and set in Noto Sans Bengali.
- **Sound is always a choice.** Off by default. The projector sounds are generated in the browser, so there are no audio files.
- **Accessible by default.** Semantic HTML, a skip link, visible focus states, keyboard access to every film (focused frames scroll into the gate), a native `<dialog>` for the player, a pause control for the trailer, subtitles that double as readable text, and a calm version for reduced motion with no pinned scrolling.
- **Light on data.** Static HTML, about 21 KB of JavaScript, no animation libraries, self-hosted fonts and lazy-loaded images. The trailer and previews only run on larger screens with a fine pointer. Phones and data-saver mode get slow poster crossfades instead.

## Tech stack

- [Astro 7](https://astro.build): static site generation
- Plain CSS with custom properties, and a small amount of TypeScript for interaction
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) and the [Facebook embedded video player](https://developers.facebook.com/docs/plugins/embedded-video-player/)
- [Jost](https://fontsource.org/fonts/jost), [IBM Plex Mono](https://fontsource.org/fonts/ibm-plex-mono), [Noto Sans Bengali](https://fontsource.org/fonts/noto-sans-bengali) and [Caveat](https://fontsource.org/fonts/caveat), self-hosted through Fontsource
- Web Audio for sound, the View Transitions API for page changes, and a small canvas for the projector dust
- Hosted on [Vercel](https://vercel.com). Every push to `main` deploys automatically.

No paid services, API keys or trackers are used.

## Project structure

```
aseer-films/
├── public/
│   ├── about/                Photo for the end credits
│   ├── favicon.svg
│   └── posters/              Stills for films without a YouTube thumbnail
├── src/
│   ├── components/
│   │   ├── Intro.astro       The peephole
│   │   ├── Hero.astro        Title card and trailer
│   │   ├── Story.astro       The four reels
│   │   ├── Projection.astro  Now showing
│   │   ├── Edit.astro        The archive timeline
│   │   ├── Theater.astro     Full-screen player
│   │   ├── Credits.astro     End credits and the scene after them
│   │   ├── Wordmark.astro, Orbit.astro   The Bohrscope mark
│   │   ├── Header.astro, Cursor.astro
│   │   └── Poster.astro      Still, or a typographic Bohrscope poster
│   ├── data/films.json       Films, chapters, the trailer and the selection
│   ├── layouts/Base.astro    Page shell and metadata
│   ├── lib/films.ts          Link parsing, chapters, notes and credits data
│   ├── pages/
│   │   ├── index.astro
│   │   └── films/[slug].astro  One page per film
│   ├── scripts/              Data, sound and shared helpers
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
| `note` | No | A short handwritten note on the film strip. Facts only. |

To feature a film, add its slug to `selected`. To include it in the opening reel, add it to `hero.reel` (YouTube films only).

### Chapters and notes

- A film lands in a reel by its year. Each chapter in `chapters` (listed oldest first in the file) has an `until` year and the subtitle `lines` shown while it plays. The site shows the reels newest first, and new films from 2025 on go into *Latest films* automatically.
- Grease-pencil notes appear for the newest film, for films watched 5,000+ times, and for any film with a `note` field, for example `"note": "first film on Bohrscope"`.

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
