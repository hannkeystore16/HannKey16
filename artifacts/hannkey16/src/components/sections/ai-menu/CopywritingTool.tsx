import { useState } from 'react';
import { Loader2, Sparkles, Copy, Check, MessageCircle } from 'lucide-react';
import type { MascotState } from '../AIMascot';
import { buildWhatsAppLink } from './whatsapp';

const CONTENT_TYPES: Array<{ id: string; label: string }> = [
  { id: 'social_caption', label: 'Caption Sosmed' },
  { id: 'product_description', label: 'Deskripsi Produk' },
  { id: 'short_article', label: 'Artikel Pendek' },
  { id: 'ad_copy', label: 'Ad Copy' },
];

interface CopywritingToolProps {
  setMascotState: (state: MascotState) => void;
  queueMascotState: (state: MascotState, delayMs: number) => void;
}

export function CopywritingTool({ setMascotState, queueMascotState }: CopywritingToolProps) {
  const [contentType, setContentType] = useState('social_caption');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('');
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    const trimmed = context.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setText(null);
    setCopied(false);
    setMascotState('thinking');

    try {
      const response = await fetch('/api/ai/copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, context: trimmed, tone: tone.trim() || undefined }),
      });
      const data = await response.json();
      if (!response.ok || !data.text) {
        throw new Error(data.error ?? 'Gagal membuat teks.');
      }
      setText(data.text);
      setMascotState('success');
      queueMascotState('listening', 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat teks.');
      setMascotState('error');
      queueMascotState('listening', 3000);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappMessage = `Halo, saya baru pakai Copywriting AI di HANNKEY16 dan mau diskusi lebih lanjut soal konten ini:\n\n${text ?? ''}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map((c) => (
            <button
              key={c.id}
              onClick={() => setContentType(c.id)}
              disabled={loading}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                contentType === c.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/5 text-white/70 border-white/10 hover:border-primary hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Ceritakan produk/bisnis/promo yang mau ditulis..."
          maxLength={500}
          rows={3}
          disabled={loading}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors resize-none disabled:opacity-50"
        />

        <input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="Tone (opsional): santai, profesional, playful..."
          maxLength={60}
          disabled={loading}
          className="w-full bg-white/5 border border-white/10 rounded-full px-3.5 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
        />

        <button
          onClick={generate}
          disabled={loading || !context.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-primary text-white text-sm font-semibold py-2.5 disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Menulis...' : 'Buat Teks'}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {text && (
          <div className="space-y-2">
            <div className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-3 text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
              {text}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-white/15 text-white text-xs font-semibold py-2 hover:border-primary transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
              <a
                href={buildWhatsAppLink(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-primary text-primary text-xs font-semibold py-2 hover:bg-primary/10 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Diskusi
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
