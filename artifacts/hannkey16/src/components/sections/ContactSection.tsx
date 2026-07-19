import { Mail, MapPin, Send } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// Depok, West Java, Indonesia
const DEPOK_LAT = -6.4025;
const DEPOK_LON = 106.7942;
const OSM_BBOX = `${DEPOK_LON - 0.05}%2C${DEPOK_LAT - 0.04}%2C${DEPOK_LON + 0.05}%2C${DEPOK_LAT + 0.04}`;
const OSM_EMBED_SRC = `https://www.openstreetmap.org/export/embed.html?bbox=${OSM_BBOX}&layer=mapnik&marker=${DEPOK_LAT}%2C${DEPOK_LON}`;
const OSM_LINK = `https://www.openstreetmap.org/?mlat=${DEPOK_LAT}&mlon=${DEPOK_LON}#map=13/${DEPOK_LAT}/${DEPOK_LON}`;

export function ContactSection() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-secondary/20">
      <div className="absolute right-0 top-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          
          <div>
            <h2 className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">{t.contact.kicker}</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {t.contact.titleLine1} <br /> {t.contact.titleLine2}
            </h3>
            <p className="text-white/60 mb-10 text-lg">
              {t.contact.subtitle}
            </p>

            <div className="space-y-8 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{t.contact.emailUs}</h4>
                  <a href="mailto:hello@hannkey16.com" className="text-white/60 hover:text-primary transition-colors">hello@hannkey16.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{t.contact.headquarters}</h4>
                  <p className="text-white/60">{t.contact.address}</p>
                </div>
              </div>
            </div>
            
            {/* WhatsApp Link Styled as a prominent element */}
            <a href="https://wa.me/6289696263297" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-bold transition-colors border border-[#25D366]/20">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              {t.contact.whatsapp}
            </a>
          </div>

          {/* Form */}
          <div className="bg-card border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h4 className="text-2xl font-bold text-white mb-6">{t.contact.formTitle}</h4>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="text-sm font-medium text-white/70">{t.contact.name}</label>
                  <input id="contact-name" type="text" className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder={t.contact.namePlaceholder} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-sm font-medium text-white/70">{t.contact.email}</label>
                  <input id="contact-email" type="email" className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder={t.contact.emailPlaceholder} />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-subject" className="text-sm font-medium text-white/70">{t.contact.subject}</label>
                <input id="contact-subject" type="text" className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder={t.contact.subjectPlaceholder} />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-message" className="text-sm font-medium text-white/70">{t.contact.message}</label>
                <textarea id="contact-message" rows={4} className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none" placeholder={t.contact.messagePlaceholder}></textarea>
              </div>
              <button className="w-full bg-primary text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                {t.contact.send} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* OpenStreetMap embed — Depok, West Java */}
        <div className="mt-16 h-[300px] w-full rounded-2xl bg-card border border-white/10 overflow-hidden relative">
          <iframe
            title={t.contact.mapTitle}
            src={OSM_EMBED_SRC}
            className="w-full h-full border-0 grayscale-[20%] contrast-[1.1] brightness-[0.9]"
            loading="lazy"
          />
          <a
            href={OSM_LINK}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-4 right-4 px-5 py-2.5 bg-background/90 rounded-full border border-white/20 text-white text-sm font-medium shadow-xl backdrop-blur-md hover:border-primary hover:text-primary transition-colors"
          >
            {t.contact.viewOnMap}
          </a>
        </div>

      </div>
    </section>
  );
}
