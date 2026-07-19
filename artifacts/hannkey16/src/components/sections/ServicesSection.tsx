import { motion } from 'framer-motion';
import { 
  Laptop, 
  Building2, 
  ShoppingCart, 
  AppWindow, 
  PenTool, 
  Search, 
  Cpu, 
  Zap, 
  Wrench,
  Globe,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const SERVICE_ICONS = [Globe, Laptop, Building2, ShoppingCart, AppWindow, PenTool, Search, Cpu, Zap, Wrench, Smartphone];

// Maps each service item (by index, order is identical across locales) to one of the
// six core service categories HANNKEY16 wants surfaced as H2 headings for SEO.
const CATEGORY_BY_INDEX = [
  'Website Development',
  'Website Development',
  'Website Development',
  'Digital Solutions',
  'Website Development',
  'UI/UX Design',
  'SEO Optimization',
  'AI Development',
  'SEO Optimization',
  'Digital Solutions',
  'Mobile Applications',
] as const;

const CATEGORY_ORDER = [
  'Website Development',
  'AI Development',
  'UI/UX Design',
  'SEO Optimization',
  'Mobile Applications',
  'Digital Solutions',
] as const;

export function ServicesSection() {
  const { t } = useLanguage();
  const SERVICES = t.services.items.map((item, i) => ({
    ...item,
    icon: SERVICE_ICONS[i],
    category: CATEGORY_BY_INDEX[i],
  }));

  return (
    <section id="services" className="py-24 md:py-32 bg-secondary/30 relative">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">{t.services.kicker}</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            {t.services.title}
          </h3>
          <p className="text-white/60 text-lg">
            {t.services.subtitle}
          </p>
        </div>

        <div className="space-y-16">
          {CATEGORY_ORDER.map((category) => {
            const items = SERVICES.filter((service) => service.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6 pl-1 border-l-4 border-primary">
                  <span className="pl-4">{category}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {items.map((service, idx) => (
                    <motion.div
                      key={service.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05, duration: 0.5 }}
                      className="bg-card border border-white/5 rounded-2xl p-6 hover:bg-card/80 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(37,99,235,0.15)] hover:border-primary/30 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors"></div>

                      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors relative z-10">
                        <service.icon className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3 relative z-10">{service.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed relative z-10">{service.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
