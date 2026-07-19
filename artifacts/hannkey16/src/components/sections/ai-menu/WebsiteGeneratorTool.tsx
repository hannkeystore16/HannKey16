import { useState } from 'react';
import { Loader2, Sparkles, MessageCircle } from 'lucide-react';
import type { MascotState } from '../AIMascot';
import { buildWhatsAppLink } from './whatsapp';

interface WebsiteConcept {
  headline: string;
  subheadline: string;
  colorTheme: { primary: string; secondary: string; accent: string };
  toneWord: string;
  sections: Array<{ title: string; description: string }>;
}

interface WebsiteGeneratorToolProps {
  setMascotState: (state: MascotState) => void;
  queueMascotState: (state: MascotState, delayMs: number) => void;
}

export function WebsiteGeneratorTool({ setMascotState, queueMascotState }: WebsiteGeneratorToolProps) {
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [concept, setConcept] = useState<WebsiteConcept | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    const trimmed = brief.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setMascotState('thinking');

    try {
      const response = await fetch('/api/ai/website-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: trimmed }),
      });
      const data = await response.json();
      if (!response.ok || !data.concept) {
        throw new Error(data.error ?? 'Gagal membuat preview.');
      }
      setConcept(data.concept);
      setMascotState('success');
      queueMascotState('listening', 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat preview.');
      setMascotState('error');
      queueMascotState('listening', 3000);
    } finally {
      setLoading(false);
    }
  }

  const whatsappMessage = concept
    ? `Halo, saya baru coba Website Generator di HANNKEY16 dan dapat konsep: "${concept.headline}" (${concept.toneWord}). Saya mau diskusi lebih lanjut untuk mewujudkannya jadi website nyata.`
    : '';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-xs text-white/50 leading-relaxed">
          Ceritakan bisnis/ide website Anda, AI akan membuat gambaran konsep instan (bukan website nyata) sebagai titik awal diskusi.
        </p>

        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Contoh: Website untuk kedai kopi kecil di Bandung, suasana hangat dan homey..."
          maxLength={600}
          rows={3}
          disabled={loading}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors resize-none disabled:opacity-50"
        />

        <button
          onClick={generate}
          disabled={loading || !brief.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-primary text-white text-sm font-semibold py-2.5 disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Membuat konsep...' : 'Buat Preview Konsep'}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {concept && (
          <div
            className="rounded-xl overflow-hidden border border-white/10"
            style={{ background: `linear-gradient(135deg, ${concept.colorTheme.primary}, ${concept.colorTheme.secondary})` }}
          >
            <div className="p-4 space-y-1">
              <span
                className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: concept.colorTheme.accent, color: '#161616' }}
              >
                {concept.toneWord}
              </span>
              <p className="text-white font-bold text-base leading-snug drop-shadow">{concept.headline}</p>
              <p className="text-white/90 text-xs leading-relaxed">{concept.subheadline}</p>
            </div>
            <div className="bg-[#161616]/80 p-3 space-y-2">
              {concept.sections.map((section, i) => (
                <div key={i} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                  <p className="text-white text-xs font-semibold">{section.title}</p>
                  <p className="text-white/60 text-[11px] leading-relaxed">{section.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {concept && (
          <a
            href={buildWhatsAppLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-primary text-primary text-sm font-semibold py-2.5 hover:bg-primary/10 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Wujudkan Konsep Ini via WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
