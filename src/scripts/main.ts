import { withFallback } from './data';

// Swap in a smaller YouTube still when the large one does not exist.
document.querySelectorAll<HTMLImageElement>('img[data-fallback]').forEach((img) => {
  const fallback = img.dataset.fallback;
  if (!fallback) return;
  if (img.complete && img.naturalWidth > 0 && img.naturalWidth <= 120) img.src = fallback;
  else withFallback(img, fallback);
});
