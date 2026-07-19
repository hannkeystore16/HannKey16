import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import aboutBg from '@assets/generated_images/about.jpeg';
import { useLanguage } from '@/lib/i18n';

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24 md:py-32 relative bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-transparent blur-2xl rounded-full z-0"></div>
            <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10">
              <img 
                src={aboutBg} 
                alt="Abstract Tech" 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Stats Badge */}
            <div className="absolute -bottom-6 -right-6 bg-card border border-white/10 p-6 rounded-2xl shadow-xl z-20 hidden md:block">
              <p className="text-4xl font-extrabold text-primary mb-1 font-manrope">{t.about.statNumber}</p>
              <p className="text-sm text-white/70 font-medium">{t.about.statLabel}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">{t.about.kicker}</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {t.about.titleLine1} <br /> {t.about.titleLine2}
            </h3>
            <p className="text-white/60 mb-8 text-lg leading-relaxed">
              {t.about.body}
            </p>

            <ul className="space-y-4 mb-10">
              {t.about.bullets.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-white/80 font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <a href="#portfolio" className="inline-flex items-center gap-2 text-white font-bold hover:text-primary transition-colors group">
              {t.about.cta}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
