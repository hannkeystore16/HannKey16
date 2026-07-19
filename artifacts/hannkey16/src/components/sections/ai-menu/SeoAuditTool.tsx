import { useState, type ReactElement } from 'react';
import { Loader2, Search, MessageCircle, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { MascotState } from '../AIMascot';
import { buildWhatsAppLink } from './whatsapp';

interface SeoCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

interface AuditResult {
  url: string;
  checks: SeoCheck[];
  summary: string | null;
  recommendations: Array<{ priority: 'high' | 'medium' | 'low'; text: string }>;
}

const STATUS_ICON: Record<SeoCheck['status'], ReactElement> = {
  pass: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />,
  warn: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />,
  fail: <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />,
};

const PRIORITY_LABEL: Record<'high' | 'medium' | 'low', string> = {
  high: 'Prioritas Tinggi',
  medium: 'Prioritas Sedang',
  low: 'Prioritas Rendah',
};

const PRIORITY_COLOR: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-red-500/15 text-red-300 border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  low: 'bg-white/10 text-white/60 border-white/15',
};

interface SeoAuditToolProps {
  setMascotState: (state: MascotState) => void;
  queueMascotState: (state: MascotState, delayMs: number) => void;
}

export function SeoAuditTool({ setMascotState, queueMascotState }: SeoAuditToolProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function audit() {
    const trimmed = url.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setMascotState('thinking');

    try {
      const response = await fetch('/api/ai/seo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Gagal mengaudit website.');
      }
      setResult(data);
      setMascotState('success');
      queueMascotState('listening', 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengaudit website.');
      setMascotState('error');
      queueMascotState('listening', 3000);
    } finally {
      setLoading(false);
    }
  }

  const whatsappMessage = result
    ? `Halo, saya baru audit SEO website saya (${result.url}) di HANNKEY16 dan mau diskusi soal perbaikannya.`
    : '';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && audit()}
            placeholder="https://websiteanda.com"
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-3.5 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button
            onClick={audit}
            disabled={loading || !url.trim()}
            aria-label="Audit website"
            className="w-9 h-9 flex-shrink-0 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Search className="w-4 h-4 text-white" />}
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {result && (
          <div className="space-y-3">
            {result.summary && <p className="text-sm text-white/90 leading-relaxed">{result.summary}</p>}

            <div className="rounded-xl border border-white/10 divide-y divide-white/10 overflow-hidden">
              {result.checks.map((check) => (
                <div key={check.id} className="flex items-start gap-2 px-3 py-2">
                  {STATUS_ICON[check.status]}
                  <div>
                    <p className="text-xs font-semibold text-white">{check.label}</p>
                    <p className="text-[11px] text-white/50 leading-relaxed">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {result.recommendations.length > 0 && (
              <div className="space-y-1.5">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className={`rounded-lg border px-3 py-2 text-[11px] leading-relaxed ${PRIORITY_COLOR[rec.priority]}`}>
                    <span className="font-semibold">{PRIORITY_LABEL[rec.priority]}:</span> {rec.text}
                  </div>
                ))}
              </div>
            )}

            <a
              href={buildWhatsAppLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-primary text-primary text-sm font-semibold py-2.5 hover:bg-primary/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Diskusikan Perbaikan via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
