import { Link } from 'wouter';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type BlogPost, formatDate, getReadingTime } from '@/lib/blog';

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group rounded-2xl border border-white/10 bg-card overflow-hidden hover:border-primary/40 transition-all">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="aspect-[16/9] overflow-hidden bg-secondary">
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt}
            loading="lazy"
            width={1200}
            height={675}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="flex items-center gap-1 text-xs text-white/50">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {getReadingTime(post)} min read
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="text-white/60 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{post.author}</span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </div>
      </div>
    </article>
  );
}
