import { defineConfig } from 'astro/config';

// Change `site` if the final address is different.
export default defineConfig({
  site: 'https://aseer-films.vercel.app',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
