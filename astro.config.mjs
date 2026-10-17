import { defineConfig } from 'astro/config';

// Change `site` if the final address is different.
export default defineConfig({
  site: 'https://films.aseer.design',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
