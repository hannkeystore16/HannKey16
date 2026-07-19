import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ecommerceImg from '@assets/generated_images/portfolio-ecommerce.jpg';
import corporateImg from '@assets/generated_images/portfolio-corporate.jpg';
import saasImg from '@assets/generated_images/portfolio-saas.jpg';
import landingImg from '@assets/generated_images/portfolio-landing.jpg';
import { useLanguage } from '@/lib/i18n';

const PROJECT_IMAGES = [ecommerceImg, corporateImg, saasImg, landingImg];

export function PortfolioSection() {
  const { t } = useLanguage();
  const PROJECTS = t.portfolio.items.map((item, i) => ({ ...item, img: PROJECT_IMAGES[i] }));

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-secondary/20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">{t.portfolio.kicker}</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              {t.portfolio.title}
            </h3>
          </div>
          <a href="#contact" className="inline-flex items-center gap-2 text-white font-bold hover:text-primary transition-colors pb-2 border-b border-white/20 hover:border-primary">
            {t.portfolio.cta} <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {PROJECTS.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group relative block"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-card border border-white/10 mb-6">
                <img 
                  src={project.img} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <span className="px-6 py-3 rounded-full bg-primary text-white font-bold tracking-wide flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    {t.portfolio.viewProject} <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">{project.title}</h4>
                  <p className="text-white/60">{project.desc}</p>
                </div>
                <span className="px-3 py-1 rounded-full border border-white/20 text-xs font-medium text-white/80 bg-white/5">
                  {project.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
