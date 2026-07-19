// Regenerates public/sitemap.xml from the static route list plus blog post
// slugs in src/data/blogPosts.json. Runs automatically before dev/build so the
// sitemap never drifts from the actual blog content.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const SITE_URL = 'https://hannkey.com';

const blogPostsPath = path.join(rootDir, 'src', 'data', 'blogPosts.json');
const posts = JSON.parse(readFileSync(blogPostsPath, 'utf-8'));

const today = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: today },
  { path: '/blog', changefreq: 'daily', priority: '0.8', lastmod: today },
];

const postRoutes = posts.map((post) => ({
  path: `/blog/${post.slug}`,
  changefreq: 'monthly',
  priority: '0.6',
  lastmod: post.publishedAt,
}));

const urls = [...staticRoutes, ...postRoutes];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url.path}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const outPath = path.join(rootDir, 'public', 'sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');
console.log(`[generate-sitemap] wrote ${urls.length} URLs to ${path.relative(rootDir, outPath)}`);
