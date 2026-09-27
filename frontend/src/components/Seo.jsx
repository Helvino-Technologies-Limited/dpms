import { useEffect } from 'react';

const SITE_URL = 'https://dental.helvino.org';
const DEFAULT_TITLE = 'DPMS | Dental Practice Management Software in Kenya';

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

// Updates the static tags in index.html for the current route.
// Logged-in pages pass noindex so they never show up in search results.
export default function Seo({ title, description, path = '/', noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | DPMS` : DEFAULT_TITLE;
    const url = `${SITE_URL}${path}`;

    document.title = fullTitle;
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setMeta('property', 'og:title', fullTitle);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('property', 'og:url', url);
    setCanonical(url);

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
  }, [title, description, path, noindex]);

  return null;
}
