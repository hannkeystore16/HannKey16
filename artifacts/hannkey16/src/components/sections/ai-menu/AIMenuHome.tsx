import type { ReactElement } from 'react';
import { MessageCircle, Code2, LayoutTemplate, ImageIcon, PenLine, SearchCheck, ChevronRight } from 'lucide-react';
import type { ToolId } from './types';
import { TOOL_META } from './types';

const TOOL_ICON: Record<ToolId, ReactElement> = {
  chat: <MessageCircle className="w-5 h-5" />,
  coding: <Code2 className="w-5 h-5" />,
  website: <LayoutTemplate className="w-5 h-5" />,
  image: <ImageIcon className="w-5 h-5" />,
  copywriting: <PenLine className="w-5 h-5" />,
  seo: <SearchCheck className="w-5 h-5" />,
};

const TOOL_ORDER: ToolId[] = ['chat', 'coding', 'website', 'image', 'copywriting', 'seo'];

interface AIMenuHomeProps {
  onSelect: (tool: ToolId) => void;
}

export function AIMenuHome({ onSelect }: AIMenuHomeProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <p className="text-xs text-white/50 mb-3 leading-relaxed">
        Pilih AI Tools yang Anda butuhkan. Setiap hasil bisa langsung dilanjutkan ke tim kami via WhatsApp.
      </p>
      <div className="grid gap-2">
        {TOOL_ORDER.map((id) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-left hover:border-primary hover:bg-white/[0.08] transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
              {TOOL_ICON[id]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{TOOL_META[id].title}</p>
              <p className="text-[11px] text-white/50 leading-snug">{TOOL_META[id].cardDescription}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
