import { useEffect, useMemo, useState } from 'react';
import { useSearch } from 'wouter';
import { Check, ChevronDown, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';
import { useLanguage } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';

interface OrderResponse {
  orderId: string;
  checkoutUrl: string;
}

interface ErrorResponse {
  error?: string;
}

type FinishStatus = 'paid' | 'expired' | 'failed' | 'cancelled' | null;

function StatusBanner({ status }: { status: FinishStatus }) {
  const { t } = useLanguage();
  if (!status) return null;

  const map: Record<Exclude<FinishStatus, null>, { title: string; body: string; tone: string }> = {
    paid: { title: t.order.statusPaidTitle, body: t.order.statusPaidBody, tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
    expired: { title: t.order.statusExpiredTitle, body: t.order.statusExpiredBody, tone: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
    failed: { title: t.order.statusFailedTitle, body: t.order.statusFailedBody, tone: 'border-red-500/30 bg-red-500/10 text-red-300' },
    cancelled: { title: t.order.statusFailedTitle, body: t.order.statusFailedBody, tone: 'border-red-500/30 bg-red-500/10 text-red-300' },
  };
  const info = map[status];

  return (
    <div className={`mb-10 rounded-2xl border p-6 ${info.tone}`} role="status">
      <p className="font-bold text-lg mb-1">{info.title}</p>
      <p className="text-sm opacity-90">{info.body}</p>
    </div>
  );
}

export default function OrderPage() {
  const { t } = useLanguage();
  const search = useSearch();

  useSeo({
    title: 'Order Now',
    description: 'Choose a HANNKEY16 package, see exactly what you get, and pay securely online via QRIS.',
    path: '/order',
    noindex: true,
  });

  const finishStatus = useMemo<FinishStatus>(() => {
    const params = new URLSearchParams(search);
    const status = params.get('status');
    return status === 'paid' || status === 'expired' || status === 'failed' || status === 'cancelled' ? status : null;
  }, [search]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPackage = t.order.packages.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    if (finishStatus) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [finishStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPackage || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const data = (await response.json()) as OrderResponse & ErrorResponse;

      if (!response.ok) {
        setError(data.error ?? t.order.errorGeneric);
        setIsSubmitting(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError(t.order.errorGeneric);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="pt-36 pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          <StatusBanner status={finishStatus} />

          <header className="mb-14 max-w-2xl">
            <h2 className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">{t.order.kicker}</h2>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">{t.order.title}</h1>
            <p className="text-white/60 text-lg">{t.order.subtitle}</p>
          </header>

          {!selectedPackage ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.order.packages.map((pkg) => {
                const isBestSeller = 'bestSeller' in pkg && pkg.bestSeller === true;
                const isExpanded = expandedId === pkg.id;
                const detail = 'detail' in pkg ? pkg.detail : undefined;
                return (
                  <div
                    key={pkg.id}
                    className={`relative flex flex-col bg-card border rounded-2xl p-8 pt-10 shadow-xl transition-colors ${
                      isBestSeller ? 'border-primary/60 shadow-[0_0_40px_rgba(37,99,235,0.25)]' : 'border-white/10 hover:border-primary/40'
                    }`}
                  >
                    {isBestSeller && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-xs font-extrabold text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                        {t.order.bestSeller}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-white mb-4">{pkg.name}</h3>
                    <div className="mb-1">
                      <p className="text-3xl font-extrabold text-white">{pkg.price}</p>
                    </div>
                    {'renewal' in pkg && pkg.renewal && (
                      <p className="text-xs text-white/40 mb-6">{pkg.renewal}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedId(pkg.id)}
                      className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] mb-6"
                    >
                      {t.order.bookNow}
                    </button>
                    <p className="text-sm font-semibold text-white/80 mb-3">{t.order.whatsYouGet}</p>
                    <ul className="space-y-2 mb-4 flex-1">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {detail && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : pkg.id)}
                        aria-expanded={isExpanded}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2"
                      >
                        {isExpanded ? t.order.hideDetails : t.order.viewDetails}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                    )}

                    <AnimatePresence initial={false}>
                      {isExpanded && detail && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <ul className="space-y-3 pt-3 border-t border-white/10 mt-1">
                            {detail.map((line, i) => (
                              <li key={i} className="text-xs leading-relaxed text-white/60">
                                <span className="font-semibold text-white/80">{pkg.features[i]}</span>
                                {' — '}
                                {line}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="max-w-xl mx-auto bg-card border border-white/10 rounded-2xl p-8 shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-sm text-white/50 hover:text-primary transition-colors mb-6"
              >
                &larr; {t.order.backToPackages}
              </button>

              <h2 className="text-2xl font-bold text-white mb-1">{t.order.formTitle}</h2>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wide">{t.order.selectedPackage}</p>
                  <p className="text-white font-bold">{selectedPackage.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-xs text-primary hover:underline"
                >
                  {t.order.changePackage}
                </button>
              </div>

              <p className="text-sm text-white/60 mb-6">
                {'billing' in selectedPackage && selectedPackage.billing === 'monthly'
                  ? t.order.fullPaymentNote
                  : t.order.dpNote(50)}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="order-name" className="text-sm font-medium text-white/70">{t.order.name}</label>
                  <input
                    id="order-name"
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.order.namePlaceholder}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="order-email" className="text-sm font-medium text-white/70">{t.order.email}</label>
                  <input
                    id="order-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.order.emailPlaceholder}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="order-phone" className="text-sm font-medium text-white/70">{t.order.phone}</label>
                  <input
                    id="order-phone"
                    type="tel"
                    required
                    minLength={8}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.order.phonePlaceholder}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="order-notes" className="text-sm font-medium text-white/70">{t.order.notes}</label>
                  <textarea
                    id="order-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.order.notesPlaceholder}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> {t.order.submitting}
                    </>
                  ) : (
                    t.order.submit
                  )}
                </button>

                <p className="flex items-center justify-center gap-2 text-xs text-white/40 pt-2">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" /> {t.order.securedBy}
                </p>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
