import { useMemo } from 'react';
import { Link, useParams } from 'wouter';
import { Clock, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';
import { PostCard } from '@/components/blog/PostCard';
import { Badge } from '@/components/ui/badge';
import { useSeo, articleJsonLd, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { getPostBySlug, getReadingTime, getRelatedPosts, formatDate } from '@/lib/blog';
import NotFound from '@/pages/not-found';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = useMemo(() => (slug ? getPostBySlug(slug) : undefined), [slug]);

  if (!post) {
    return <NotFound />;
  }

  const related = getRelatedPosts(post);

  useSeo({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.featuredImage,
    type: 'article',
    jsonLd: [
      articleJsonLd(post),
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="pt-36 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/50">
            <a href={`${SITE_URL}/`} className="hover:text-primary transition-colors">Home</a>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80" aria-current="page">{post.title}</span>
          </nav>

          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to all articles
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge>{post.category}</Badge>
              <span className="flex items-center gap-1 text-xs text-white/50">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {getReadingTime(post)} min read
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span>{post.author}</span>
              <span aria-hidden="true">&middot;</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </div>
          </header>

          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-secondary">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt}
              width={1200}
              height={675}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-manrope prose-headings:font-bold prose-a:text-primary">
            {post.content.map((block, index) =>
              block.type === 'h2' ? (
                <h2 key={index}>{block.text}</h2>
              ) : (
                <p key={index}>{block.text}</p>
              ),
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/10">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related-heading" className="mt-16">
              <h2 id="related-heading" className="text-2xl font-bold text-white mb-6">Related articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {related.map((relatedPost) => (
                  <PostCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
