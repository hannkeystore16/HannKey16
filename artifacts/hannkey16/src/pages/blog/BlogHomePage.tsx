import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';
import { PostCard } from '@/components/blog/PostCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSeo, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { getAllPosts, getCategories } from '@/lib/blog';

export default function BlogHomePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const posts = useMemo(() => getAllPosts(), []);
  const categories = useMemo(() => getCategories(), []);

  useSeo({
    title: 'Blog',
    description:
      'Insights on web development, AI solutions, and SEO from the HANNKEY16 team — practical guidance for growing your business online.',
    path: '/blog',
    jsonLd: breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ]),
  });

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = !activeCategory || post.category === activeCategory;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.tags.some((tag) => tag.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="pt-36 pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/50">
            <a href={`${SITE_URL}/`} className="hover:text-primary transition-colors">Home</a>
            <span className="mx-2">/</span>
            <span className="text-white/80" aria-current="page">Blog</span>
          </nav>

          <header className="mb-12 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              The HANNKEY16 Blog
            </h1>
            <p className="text-white/60 text-lg">
              Practical guidance on web development, AI solutions, and SEO — written by the team building HANNKEY16.
            </p>
          </header>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
              <label htmlFor="blog-search" className="sr-only">Search articles</label>
              <Input
                id="blog-search"
                type="search"
                placeholder="Search articles..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              <button type="button" onClick={() => setActiveCategory(null)}>
                <Badge variant={activeCategory === null ? 'default' : 'outline'} className="cursor-pointer">
                  All
                </Badge>
              </button>
              {categories.map((category) => (
                <button key={category} type="button" onClick={() => setActiveCategory(category)}>
                  <Badge variant={activeCategory === category ? 'default' : 'outline'} className="cursor-pointer">
                    {category}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-white/60 py-16 text-center">No articles match your search yet. Try a different term.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
