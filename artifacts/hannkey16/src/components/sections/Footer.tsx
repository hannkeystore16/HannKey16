import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';

export function Footer() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const sectionHref = (href: string) => (href.startsWith('#') && location !== '/' ? `/${href}` : href);

  return (
    <footer className="bg-background border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="lg:col-span-2">
            <Link href="/" className="text-3xl font-extrabold tracking-tighter text-white font-manrope mb-6 inline-block">
              HANNKEY<span className="text-primary">16</span>
            </Link>
            <p className="text-white/60 text-lg max-w-md mb-8">
              {t.footer.tagline} <br />
              {t.footer.body}
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Twitter / X" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-all border border-white/10">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-all border border-white/10">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-all border border-white/10">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-all border border-white/10">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">{t.footer.quickLinks}</h4>
            <ul className="space-y-4">
              {[
                { name: t.footer.quickLinksItems[0], href: '#about' },
                { name: t.footer.quickLinksItems[1], href: '#services' },
                { name: t.footer.quickLinksItems[2], href: '#portfolio' },
                { name: t.footer.quickLinksItems[3], href: '#process' },
                { name: 'Blog', href: '/blog' },
              ].map((link) => (
                <li key={link.href}><a href={sectionHref(link.href)} className="text-white/60 hover:text-primary transition-colors">{link.name}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">{t.footer.legal}</h4>
            <ul className="space-y-4">
              {t.footer.legalLinks.map((label) => (
                <li key={label}><a href="#" className="text-white/60 hover:text-primary transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} HANNKEY16 Digital Agency Indonesia. {t.footer.rights} — <a href="https://hannkey.com" className="hover:text-primary transition-colors">hannkey.com</a>
          </p>
          <p className="text-white/40 text-sm flex items-center gap-1">
            {t.footer.engineered}
          </p>
        </div>
      </div>
    </footer>
  );
}
