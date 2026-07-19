import { Switch, Route } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Navbar } from '@/components/sections/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { WhyChooseSection } from '@/components/sections/WhyChooseSection';
import { PortfolioSection } from '@/components/sections/PortfolioSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { Footer } from '@/components/sections/Footer';
import { FloatingButtons } from '@/components/sections/FloatingButtons';
import { AIMenuWidget } from '@/components/sections/ai-menu/AIMenuWidget';
import { LanguageProvider } from '@/lib/i18n';
import { useSeo, organizationJsonLd, websiteJsonLd, webPageJsonLd, serviceJsonLd } from '@/lib/seo';
import BlogHomePage from '@/pages/blog/BlogHomePage';
import BlogPostPage from '@/pages/blog/BlogPostPage';
import OrderPage from '@/pages/OrderPage';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function HomePage() {
  useSeo({
    title: 'HANNKEY16 Digital Agency Indonesia | Official Website',
    description:
      'HANNKEY adalah digital agency Indonesia yang menyediakan jasa pembuatan website profesional, aplikasi web, UI/UX, branding, SEO, integrasi AI, dan solusi digital untuk UMKM, startup, hingga perusahaan.',
    path: '/',
    jsonLd: [
      organizationJsonLd(),
      websiteJsonLd(),
      webPageJsonLd({
        name: 'HANNKEY16 Digital Agency Indonesia | Official Website',
        description:
          'HANNKEY adalah digital agency Indonesia yang menyediakan jasa pembuatan website profesional, aplikasi web, UI/UX, branding, SEO, integrasi AI, dan solusi digital untuk UMKM, startup, hingga perusahaan.',
        path: '/',
      }),
      serviceJsonLd(),
    ],
  });

  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <WhyChooseSection />
      <PortfolioSection />
      <ProcessSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <FloatingButtons />
      <AIMenuWidget />
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/blog" component={BlogHomePage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/order" component={OrderPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
