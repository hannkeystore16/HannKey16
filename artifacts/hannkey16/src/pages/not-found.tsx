import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';
import { useSeo } from '@/lib/seo';

export default function NotFound() {
  useSeo({
    title: 'Page Not Found',
    description: 'The page you are looking for could not be found.',
    path: '/404',
    noindex: true,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 w-full flex items-center justify-center px-6 pt-32 pb-24">
        <Card className="w-full max-w-md bg-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-primary" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-white/60 mb-6">
              The page you're looking for doesn't exist or may have been moved.
            </p>
            <Link href="/" className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all">
              Back to homepage
            </Link>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
