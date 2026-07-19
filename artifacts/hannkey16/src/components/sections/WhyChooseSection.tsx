import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function WhyChooseSection() {
  const { t } = useLanguage();
  const ADVANTAGES = t.whyChoose.items;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] z-0 pointer-events-none"></div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/3">
            <h2 className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">{t.whyChoose.kicker}</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
              {t.whyChoose.titleLine1} {t.whyChoose.titleLine2}
            </h3>
            <p className="text-white/60 mb-8 text-lg">
              {t.whyChoose.body}
            </p>
            <div className="h-[1px] w-full bg-gradient-to-r from-primary/50 to-transparent"></div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {ADVANTAGES.map((adv, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <span className="text-white font-medium">{adv}</span>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
