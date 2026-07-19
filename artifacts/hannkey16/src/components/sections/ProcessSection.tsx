import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';

const STEP_NUMS = ['01', '02', '03', '04', '05', '06', '07'];

export function ProcessSection() {
  const { t } = useLanguage();
  const STEPS = t.process.steps.map((step, i) => ({ ...step, num: STEP_NUMS[i] }));

  return (
    <section id="process" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">{t.process.kicker}</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            {t.process.title}
          </h3>
          <p className="text-white/60 text-lg">
            {t.process.subtitle}
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-[28px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-white/5"></div>
          <div className="absolute left-[28px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent scale-y-50 origin-top"></div>

          <div className="space-y-12 md:space-y-0 relative">
            {STEPS.map((step, idx) => {
              const isEven = idx % 2 !== 0;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  
                  {/* Content Box */}
                  <div className={`pl-20 md:pl-0 md:w-1/2 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                    <div className="bg-card border border-white/10 rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-colors shadow-lg">
                      <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                      <p className="text-white/60 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-background border-4 border-primary text-primary font-bold text-lg z-10 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    {step.num}
                  </div>
                  
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
