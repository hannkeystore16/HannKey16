import { useEffect } from 'react';

export const SITE_URL = 'https://hannkey.com';
export const SITE_NAME = 'HANNKEY16';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface JsonLd {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: unknown;
}

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: JsonLd | JsonLd[];
  noindex?: boolean;
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSON_LD_ID = 'seo-jsonld';

function setJsonLd(data?: JsonLd | JsonLd[]) {
  const existing = document.getElementById(JSON_LD_ID);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = JSON_LD_ID;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Sets per-route document title, meta description, canonical URL, Open Graph /
 * Twitter tags, and JSON-LD structured data. This app is a client-rendered SPA,
 * so these tags update after mount — fine for Google (which executes JS) but a
 * known limitation for crawlers that don't run JS (see replit.md Gotchas).
 */
export function useSeo({ title, description, path, image, type = 'website', jsonLd, noindex }: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path}`;
    const ogImage = image ?? DEFAULT_OG_IMAGE;

    document.title = fullTitle;
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
    setLinkTag('canonical', url);

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', SITE_NAME);

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    setJsonLd(jsonLd);

    return () => {
      setJsonLd(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, type, noindex, JSON.stringify(jsonLd ?? null)]);
}

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HANNKEY16 Digital Agency Indonesia',
    alternateName: ['HANNKEY16', 'HANNKEY', 'hannkey.com'],
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    description:
      'HANNKEY adalah digital agency Indonesia yang menyediakan jasa pembuatan website profesional, aplikasi web, UI/UX, branding, SEO, integrasi AI, dan solusi digital untuk UMKM, startup, hingga perusahaan.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ID',
    },
    sameAs: [],
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'HANNKEY16 Digital Agency Indonesia',
    alternateName: ['HANNKEY16', 'HANNKEY', 'hannkey.com'],
    url: SITE_URL,
    publisher: { '@type': 'Organization', name: 'HANNKEY16 Digital Agency Indonesia' },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/blog?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webPageJsonLd(opts: { name: string; description: string; path: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };
}

const CORE_SERVICES = [
  'Website Development',
  'AI Development',
  'UI/UX Design',
  'SEO Optimization',
  'Mobile Applications',
  'Digital Solutions',
];

export function serviceJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: CORE_SERVICES,
    provider: {
      '@type': 'Organization',
      name: 'HANNKEY16 Digital Agency Indonesia',
      alternateName: ['HANNKEY16', 'hannkey.com'],
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Indonesia',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'HANNKEY16 Digital Services',
      itemListElement: CORE_SERVICES.map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function articleJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage: string;
  author: string;
  publishedAt: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [post.featuredImage],
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.png` },
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };
}
