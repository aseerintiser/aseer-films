# Aseer Intiser Niloy, films

A cinematic portfolio for my films. Built with [Astro](https://astro.build), hosted on Vercel.

## Add a new film

Everything lives in one file: `src/data/films.json`.

1. Copy any entry in `films` and paste it at the top of the list.
2. Change `slug` (short, lowercase, dashes), `title`, `url`, `date`, `runtime` (in seconds) and `kind`.
3. Optional: `logline`, `notes`, `place`, `views`, `credits`, `facebook` (a second link when the film is on both platforms).
4. Push to GitHub. Vercel rebuilds the site in about a minute.

YouTube links are preferred: they bring their own thumbnails and a better player.
Facebook links work too, as long as the video is **Public**. Facebook does not share thumbnails, so add a still to `public/posters/<slug>.webp` (1280 px wide). Without one, the film shows a title card.

To feature a film, add its slug to `selected`. To put it in the hero reel, add it to `hero.reel` (YouTube only).

## Run it locally

```bash
npm install
npm run dev
```

Needs Node 22.22 or newer.
