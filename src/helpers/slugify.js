import sanitizeFileName from './sanitizeFileName';

export default function slugify(title) {
  const base = sanitizeFileName((title || 'tournament').toLowerCase().replace(/\s+/g, '-'));
  return base || 'tournament';
}
