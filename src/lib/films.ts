import fs from 'node:fs';
import path from 'node:path';
import data from '../data/films.json';

export type Credit = { role: string; name: string };

type RawFilm = {
  slug: string;
  title: string;
  titleLatin?: string;
  subtitle?: string;
  url: string;
  facebook?: string;
  date: string;
  runtime: number;
  kind: string;
  place?: string;
  language?: string;
  accent?: string;
  thumb?: 'maxres' | 'sd' | 'hq';
  poster?: string;
  views?: { facebook?: number; youtube?: number };
  unconfirmed?: string[];
  early?: boolean;
  note?: string;
  logline?: string;
  loglineLang?: string;
  notes?: string;
  notesLang?: string;
  credits?: Credit[];
};

export type Platform = 'youtube' | 'facebook';

/** Pull the platform and id out of any common YouTube or Facebook link. */
export function parseVideoUrl(raw: string): { platform: Platform; id: string; href: string } {
  const url = new URL(raw.trim());
  const host = url.hostname.replace(/^(www|m|web|mbasic)\./, '');

  if (host === 'youtu.be') {
    return { platform: 'youtube', id: url.pathname.slice(1).split('/')[0], href: raw };
  }
  if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    const v = url.searchParams.get('v');
    if (v) return { platform: 'youtube', id: v, href: raw };
    const m = url.pathname.match(/\/(?:embed|shorts|live|v)\/([\w-]{6,})/);
    if (m) return { platform: 'youtube', id: m[1], href: raw };
  }
  if (host.endsWith('facebook.com') || host === 'fb.watch') {
    const v = url.searchParams.get('v');
    const m = url.pathname.match(/\/(?:videos|reel|watch)\/(?:[^/]+\/)?(\d{6,})/);
    const id = v || (m ? m[1] : url.pathname.replace(/\W+/g, '-'));
    return { platform: 'facebook', id, href: raw };
  }
  throw new Error(`Unsupported video link: ${raw}. Use a YouTube or Facebook link.`);
}

export function formatRuntime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** 15,054 becomes "15K", 5,319 becomes "5.3K". Rounded down so it never overstates. */
export function formatViews(n: number): string {
  if (n < 1000) return String(n);
  const k = Math.floor(n / 100) / 10;
  return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
}

const thumbName = { maxres: 'maxresdefault', sd: 'sddefault', hq: 'hqdefault' } as const;
const posterDir = path.resolve('public/posters');

function localPoster(slug: string): { large: string; small: string } | null {
  const large = path.join(posterDir, `${slug}.webp`);
  const small = path.join(posterDir, `${slug}-small.webp`);
  if (!fs.existsSync(large)) return null;
  return { large: `/posters/${slug}.webp`, small: fs.existsSync(small) ? `/posters/${slug}-small.webp` : `/posters/${slug}.webp` };
}

function build(f: RawFilm) {
  const { platform, id, href } = parseVideoUrl(f.url);
  const year = Number(f.date.slice(0, 4));
  let embed: string;
  let posterLarge = '';
  let posterSmall = '';
  let posterFallback = '';
  const local = localPoster(f.slug);

  if (platform === 'youtube') {
    embed = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&color=white&iv_load_policy=3`;
    posterLarge = `https://i.ytimg.com/vi/${id}/${thumbName[f.thumb ?? 'maxres']}.jpg`;
    posterSmall = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    posterFallback = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  } else {
    // The width is filled in by the player script to match the screen.
    embed = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&autoplay=true&allowfullscreen=true`;
  }
  if (local) {
    posterLarge = local.large;
    posterSmall = local.small;
  } else if (f.poster) {
    posterLarge = posterSmall = f.poster;
  }

  const views = (f.views?.facebook ?? 0) + (f.views?.youtube ?? 0);
  const platforms = [platform === 'youtube' || f.views?.youtube ? 'YouTube' : null, f.facebook || platform === 'facebook' ? 'Facebook' : null].filter(Boolean);

  return {
    ...f,
    year,
    platform,
    videoId: id,
    embed,
    watchUrl: href,
    facebookUrl: f.facebook ?? (platform === 'facebook' ? href : null),
    youtubeUrl: platform === 'youtube' ? href : null,
    posterLarge,
    posterSmall,
    posterFallback,
    accent: f.accent ?? '#e8a23a',
    runtimeLabel: formatRuntime(f.runtime),
    plainTitle: f.titleLatin ?? f.title,
    views,
    // Only shown once a film has reached a real audience.
    viewsLabel: views >= 1000 ? `${formatViews(views)} views` : null,
    viewsWhere: platforms.join(' and '),
    early: Boolean(f.early),
  };
}

export type Film = ReturnType<typeof build>;

export const films: Film[] = (data.films as RawFilm[])
  .map(build)
  .sort((a, b) => b.date.localeCompare(a.date));

/** Oldest first, the way an edit timeline reads. */
export const chronological: Film[] = [...films].reverse();

const bySlug = (slug: string) => films.find((f) => f.slug === slug);

export const reel: Film[] = data.hero.reel.map(bySlug).filter((f): f is Film => Boolean(f));
export const selected: Film[] = data.selected.map(bySlug).filter((f): f is Film => Boolean(f));

export const MOST_WATCHED = 3000;

type RawChapter = { id: string; title: string; until: number; lines: string[] };

/** The story, told in chapters. Each film lands in a chapter by its year. */
export const chapters = (() => {
  const list = (data as { chapters: RawChapter[] }).chapters;
  let from = -Infinity;
  const chapters = list.map((c) => {
    const inChapter = chronological.filter((f) => f.year > from && f.year <= c.until);
    const years = inChapter.map((f) => f.year);
    const range = years.length ? [Math.min(...years), Math.max(...years)] : [];
    from = c.until;
    return { ...c, films: [...inChapter].reverse(), range };
  });
  // Newest first: the strongest work is what visitors meet first.
  return chapters.reverse();
})();

/** A grease-pencil note for a film, only from real facts. */
export function noteFor(f: Film): string | null {
  if (f.note) return f.note;
  if (f.slug === films[0]?.slug) return 'newest';
  if (f.views >= 5000) return `watched ${formatViews(f.views)} times`;
  return null;
}

/** Filters for the timeline, only the ones that have films in them. */
export const filters = (() => {
  const order = ['Travel', 'Short', 'Tribute', 'Teaser', 'Sports', 'Campus', 'Essay', 'Digital story'];
  const label: Record<string, string> = {
    Travel: 'Travel',
    Short: 'Shorts',
    Tribute: 'Tributes',
    Teaser: 'Teasers',
    Sports: 'Sports',
    Campus: 'Campus',
    Essay: 'Essays',
    'Digital story': 'Digital stories',
  };
  const kinds = order
    .map((k) => ({ id: `kind:${k}`, label: label[k] ?? k, count: films.filter((f) => f.kind === k).length }))
    .filter((k) => k.count > 0);
  return [
    { id: 'all', label: 'All films', count: films.length },
    { id: 'watched', label: 'Most watched', count: films.filter((f) => f.views >= MOST_WATCHED).length },
    ...kinds,
    { id: 'early', label: 'Early work', count: films.filter((f) => f.early).length },
  ];
})();

export function filterTags(f: Film): string {
  return ['all', `kind:${f.kind}`, f.views >= MOST_WATCHED ? 'watched' : '', f.early ? 'early' : '']
    .filter(Boolean)
    .join(' ');
}

export const firstYear = Math.min(...films.map((f) => f.year));
export const lastYear = Math.max(...films.map((f) => f.year));
export const totalViews = films.reduce((n, f) => n + f.views, 0);
export const totalRuntime = films.reduce((n, f) => n + f.runtime, 0);

/** Where the films were made, as short place names. */
export const places = [
  ...new Set(
    chronological
      .map((f) => f.place?.split(',').map((p) => p.trim()) ?? [])
      .filter((parts) => parts.length >= 2)
      .map((parts) => parts[parts.length - 2].replace(/ University$/, '')),
  ),
];

export const languages = films.some((f) => f.language === 'bn') ? ['Bangla', 'English'] : ['English'];

/** Music credited in the films. */
export const music = [
  ...new Set(
    films.flatMap((f) => (f.credits ?? []).filter((c) => c.role === 'Music').map((c) => c.name.split(',')[0].trim())),
  ),
];

/** The slice of data the browser scripts need. */
export function clientFilm(f: Film) {
  return {
    slug: f.slug,
    title: f.title,
    titleLatin: f.titleLatin ?? null,
    subtitle: f.subtitle ?? null,
    year: f.year,
    kind: f.kind,
    place: f.place ?? null,
    runtime: f.runtime,
    runtimeLabel: f.runtimeLabel,
    platform: f.platform,
    videoId: f.videoId,
    embed: f.embed,
    youtubeUrl: f.youtubeUrl,
    facebookUrl: f.facebookUrl,
    posterLarge: f.posterLarge,
    posterSmall: f.posterSmall,
    posterFallback: f.posterFallback,
    accent: f.accent,
    viewsLabel: f.viewsLabel,
    viewsWhere: f.viewsWhere,
    logline: f.logline ?? '',
    loglineLang: f.loglineLang ?? null,
    notes: f.notes ?? '',
    notesLang: f.notesLang ?? null,
    credits: f.credits ?? [],
    language: f.language ?? null,
  };
}

export type ClientFilm = ReturnType<typeof clientFilm>;

export const site = {
  name: 'Md Aseer Intiser',
  description:
    'Travel films, tributes and short stories by Md Aseer Intiser, a Bangladeshi filmmaker based in Tampere, Finland.',
  email: 'md.aseerintiser@gmail.com',
  links: [
    { label: 'Bohrscope on YouTube', href: 'https://www.youtube.com/@bohrscope' },
    { label: 'iAMBOHRED on YouTube', href: 'https://www.youtube.com/@iambohred8588' },
    { label: 'Facebook', href: 'https://www.facebook.com/aseer.intiser.niloy' },
    { label: 'Bohrscope on Facebook', href: 'https://www.facebook.com/profile.php?id=61578870155341' },
  ],
  designSite: 'https://aseer.design',
};
