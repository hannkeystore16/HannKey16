import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';

/** Section anchors only exist on the homepage — from any other route, route home first. */
function useSectionHref() {
  const [location] = useLocation();
  return (href: string) => (href.startsWith('#') && location !== '/' ? `/${href}` : href);
}

function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className={`flex items-center rounded-full border border-white/15 bg-white/5 p-1 text-xs font-bold ${className}`} role="group" aria-label={t.nav.languageSwitcher}>
      <button
        type="button"
        onClick={() => setLang('id')}
        aria-pressed={lang === 'id'}
        className={`px-3 py-1.5 rounded-full transition-colors ${lang === 'id' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`px-3 py-1.5 rounded-full transition-colors ${lang === 'en' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
      >
        EN
      </button>
    </div>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(88);
  const headerRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const sectionHref = useSectionHref();
  const NAV_LINKS = [...t.nav.links, { name: 'Blog', href: '/blog' }, { name: t.order.orderNow, href: '/order' }];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Measure the actual header height so the mobile menu always sits flush below it,
  // whether the header is in its tall (top of page) or compact (scrolled) state.
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isScrolled, isMobileMenuOpen]);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-xl border-b border-white/5 py-4 shadow-lg' : 'bg-transparent py-6'}`}
    >
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="text-2xl md:text-3xl font-extrabold tracking-tighter text-white font-manrope relative z-50">
          HANNKEY<span className="text-primary">16</span>
        </Link>
        
        {/* Desktop Nav — only shown at laptop/desktop widths so tablets get the hamburger menu instead of a cramped row */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {NAV_LINKS.map(link => (
            <a key={link.name} href={sectionHref(link.href)} className="text-sm font-medium text-white/70 hover:text-white transition-colors whitespace-nowrap">
              {link.name}
            </a>
          ))}
          <LanguageSwitcher />
          <a href={sectionHref('#contact')} className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] whitespace-nowrap">
            {t.nav.talk}
          </a>
        </nav>

        {/* Tablet + Mobile: language switcher + toggle */}
        <div className="lg:hidden flex items-center gap-3">
          <LanguageSwitcher />
          <button className="text-white relative z-50" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label={t.nav.toggleMenu}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ top: headerHeight }}
            className="fixed inset-x-0 bottom-0 bg-background/98 backdrop-blur-xl border-t border-white/10 flex flex-col p-6 shadow-2xl lg:hidden z-40 overflow-y-auto"
          >
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map(link => (
                <a 
                  key={link.name} 
                  href={sectionHref(link.href)} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-4 px-4 text-xl font-bold text-white/90 border-b border-white/5 active:bg-white/5 rounded-lg transition-colors font-manrope"
                >
                  {link.name}
                </a>
              ))}
              <a href={sectionHref('#contact')} onClick={() => setIsMobileMenuOpen(false)} className="mt-8 w-full text-center py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                {t.nav.freeConsultation}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
