import type { ClientFilm } from '../lib/films';

let cache: ClientFilm[] | null = null;

export function getFilms(): ClientFilm[] {
  if (!cache) {
    const el = document.getElementById('film-data');
    cache = el ? (JSON.parse(el.textContent || '[]') as ClientFilm[]) : [];
  }
  return cache;
}

export function findFilm(slug: string): ClientFilm | undefined {
  return getFilms().find((f) => f.slug === slug);
}

/** Ask the theater to open a film. Any component can call this. */
export function openFilm(slug: string, trigger?: HTMLElement | null) {
  window.dispatchEvent(new CustomEvent('film:open', { detail: { slug, trigger } }));
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 24 fps SMPTE-style timecode, the way an edit suite shows it. */
export function timecode(seconds: number, fps = 24): string {
  const total = Math.max(0, seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  const f = Math.floor((total % 1) * fps);
  return [h, m, s, f].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Hand the image a fallback if the large YouTube thumbnail is missing. */
export function withFallback(img: HTMLImageElement, fallback: string) {
  img.addEventListener(
    'load',
    () => {
      // YouTube serves a 120x90 grey image instead of a 404 when maxres is missing.
      if (img.naturalWidth <= 120 && fallback && img.src !== fallback) img.src = fallback;
    },
    { once: true },
  );
  img.addEventListener('error', () => fallback && img.src !== fallback && (img.src = fallback), {
    once: true,
  });
}

/** Minimal loader for the YouTube IFrame API. */
let ytPromise: Promise<any> | null = null;
export function loadYouTubeApi(): Promise<any> {
  if (ytPromise) return ytPromise;
  ytPromise = new Promise((resolve, reject) => {
    const w = window as any;
    if (w.YT && w.YT.Player) return resolve(w.YT);
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(w.YT);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return ytPromise;
}
