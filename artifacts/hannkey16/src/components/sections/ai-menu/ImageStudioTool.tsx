import { useState } from 'react';
import { Loader2, Sparkles, Download, MessageCircle } from 'lucide-react';
import type { MascotState } from '../AIMascot';
import { buildWhatsAppLink } from './whatsapp';

const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'logo', label: 'Logo' },
  { id: 'banner', label: 'Banner' },
  { id: 'illustration', label: 'Ilustrasi' },
  { id: 'social', label: 'Sosial Media' },
  { id: 'uiux', label: 'UI/UX' },
  { id: 'website', label: 'Preview Website' },
];

interface ImageStudioToolProps {
  setMascotState: (state: MascotState) => void;
  queueMascotState: (state: MascotState, delayMs: number) => void;
}

export function ImageStudioTool({ setMascotState, queueMascotState }: ImageStudioToolProps) {
  const [category, setCategory] = useState('logo');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    const trimmed = description.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setImageDataUrl(null);
    setMascotState('thinking');

    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, description: trimmed }),
      });
      const data = await response.json();
      if (!response.ok || !data.b64Json) {
        throw new Error(data.error ?? 'Gagal membuat gambar.');
      }
      setImageDataUrl(`data:${data.mediaType};base64,${data.b64Json}`);
      setMascotState('success');
      queueMascotState('listening', 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat gambar.');
      setMascotState('error');
      queueMascotState('listening', 3000);
    } finally {
      setLoading(false);
    }
  }

  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;
  const whatsappMessage = `Halo, saya baru coba Image Studio di HANNKEY16 untuk kategori "${categoryLabel}" dengan deskripsi: "${description.trim()}". Saya mau diskusi lebih lanjut soal desain ini.`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              disabled={loading}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                category === c.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/5 text-white/70 border-white/10 hover:border-primary hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: ikon cangkir kopi minimalis untuk kedai kopi di Bandung..."
          maxLength={400}
          rows={3}
          disabled={loading}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors resize-none disabled:opacity-50"
        />

        <button
          onClick={generate}
          disabled={loading || !description.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-primary text-white text-sm font-semibold py-2.5 disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Membuat gambar...' : 'Buat Gambar'}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {imageDataUrl && (
          <div className="space-y-2">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-[repeating-conic-gradient(#2a2a2a_0%_25%,#1a1a1a_0%_50%)] bg-[length:16px_16px]">
              <img src={imageDataUrl} alt={`Hasil AI Image Studio: ${categoryLabel}`} className="w-full h-auto" />
            </div>
            <div className="flex gap-2">
              <a
                href={imageDataUrl}
                download={`hannkey16-${category}.png`}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-white/15 text-white text-xs font-semibold py-2 hover:border-primary transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Unduh
              </a>
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
