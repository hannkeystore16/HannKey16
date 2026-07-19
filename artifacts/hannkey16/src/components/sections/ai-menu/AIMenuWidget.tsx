import { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIMascot, type MascotState } from '../AIMascot';
import { AIMenuHome } from './AIMenuHome';
import { ChatTool } from './ChatTool';
import { WebsiteGeneratorTool } from './WebsiteGeneratorTool';
import { ImageStudioTool } from './ImageStudioTool';
import { CopywritingTool } from './CopywritingTool';
import { SeoAuditTool } from './SeoAuditTool';
import { TOOL_META, type ToolId } from './types';

const CONSULTANT_INITIAL_MESSAGE =
  "Halo! Saya AI Assistant HANNKEY16 \u2014 siap membantu sebagai konsultan website, estimator harga, dan customer service 24/7. Ada yang bisa saya bantu hari ini?";

const CONSULTANT_QUICK_PROMPTS = [
  'Estimasi harga website saya',
  'Layanan apa saja yang cocok untuk bisnis saya?',
  'Bagaimana proses kerja HANNKEY16?',
];

const CODING_INITIAL_MESSAGE =
  'Halo! Saya Coding Assistant HANNKEY16. Tanya-tanya santai soal teknis website/aplikasi Anda \u2014 stack, hosting, performa, atau rencana fitur.';

const CODING_QUICK_PROMPTS = [
  'Sebaiknya website saya pakai stack apa?',
  'Bagaimana cara mempercepat loading website?',
  'Apa bedanya website statis dan aplikasi web?',
];

type PanelView = 'menu' | ToolId;

export function AIMenuWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<PanelView>('menu');
  const [mascotState, setMascotState] = useState<MascotState>('greeting');
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const mascotTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function queueMascotState(state: MascotState, delayMs: number) {
    if (mascotTimeoutRef.current) clearTimeout(mascotTimeoutRef.current);
    mascotTimeoutRef.current = setTimeout(() => setMascotState(state), delayMs);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Greet visitors once on load, then settle into idle; greet again each time the panel opens.
  useEffect(() => {
    if (isOpen) {
      setMascotState('greeting');
      queueMascotState('listening', 1400);
    } else {
      setMascotState((prev) => (prev === 'greeting' ? prev : 'idle'));
      queueMascotState('idle', 2600);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (mascotTimeoutRef.current) clearTimeout(mascotTimeoutRef.current);
    };
  }, []);

  function openMenu() {
    setIsOpen(true);
    setView('menu');
  }

  function closePanel() {
    setIsOpen(false);
    setView('menu');
  }

  function selectTool(tool: ToolId) {
    setView(tool);
    setMascotState('listening');
  }

  const headerTitle = view === 'menu' ? 'HANNKEY16 AI Menu' : TOOL_META[view].title;
  const headerSubtitle = view === 'menu' ? 'Pilih AI Tools untuk membantu bisnis Anda' : TOOL_META[view].subtitle;

  return (
    <>
      {/* Floating AI Assistant Button */}
      <motion.button
        onClick={() => (isOpen ? closePanel() : openMenu())}
        onHoverStart={() => setIsButtonHovered(true)}
        onHoverEnd={() => setIsButtonHovered(false)}
        onFocus={() => setIsButtonHovered(true)}
        onBlur={() => setIsButtonHovered(false)}
        aria-label={isOpen ? 'Close AI Menu' : 'Open AI Menu'}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 left-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-primary/25 to-blue-400/25 backdrop-blur-sm border border-white/15 shadow-[0_4px_24px_rgba(37,99,235,0.6)] flex items-center justify-center overflow-visible"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.span>
          ) : (
            <AIMascot key="mascot" state={isButtonHovered ? 'listening' : mascotState} className="w-14 h-14" />
          )}
        </AnimatePresence>
        {!isOpen && <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-10" />}
      </motion.button>

      {/* One-time greeting bubble */}
      <AnimatePresence>
        {!isOpen && mascotState === 'greeting' && (
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.9, transition: { duration: 0.15 } }}
            className="fixed bottom-32 left-24 z-50 max-w-[170px] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-xs font-semibold text-[#161616] shadow-xl"
          >
            Halo! 👋 Butuh bantuan AI seputar bisnis Anda?
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-menu-title"
            className="fixed bottom-40 left-6 z-50 w-[calc(100vw-3rem)] max-w-sm h-[34rem] max-h-[75vh] bg-[#161616] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-primary/20 to-transparent flex items-center gap-3">
              {view !== 'menu' ? (
                <button
                  onClick={() => setView('menu')}
                  aria-label="Kembali ke menu"
                  className="w-9 h-9 flex-shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
              ) : (
                <div className="w-11 h-11 flex-shrink-0">
                  <AIMascot state={mascotState} className="w-full h-full" />
                </div>
              )}
              <div className="min-w-0">
                <p id="ai-menu-title" className="text-sm font-semibold text-white truncate">
                  {headerTitle}
                </p>
                <p className="text-xs text-white/50 truncate">{headerSubtitle}</p>
              </div>
            </div>

            {/* Body */}
            {view === 'menu' && <AIMenuHome onSelect={selectTool} />}
            {view === 'chat' && (
              <ChatTool
                key="chat"
                mode="consultant"
                initialMessage={CONSULTANT_INITIAL_MESSAGE}
                quickPrompts={CONSULTANT_QUICK_PROMPTS}
                setMascotState={setMascotState}
                queueMascotState={queueMascotState}
              />
            )}
            {view === 'coding' && (
              <ChatTool
                key="coding"
                mode="coding"
                initialMessage={CODING_INITIAL_MESSAGE}
                quickPrompts={CODING_QUICK_PROMPTS}
                setMascotState={setMascotState}
                queueMascotState={queueMascotState}
              />
            )}
            {view === 'website' && <WebsiteGeneratorTool setMascotState={setMascotState} queueMascotState={queueMascotState} />}
            {view === 'image' && <ImageStudioTool setMascotState={setMascotState} queueMascotState={queueMascotState} />}
            {view === 'copywriting' && <CopywritingTool setMascotState={setMascotState} queueMascotState={queueMascotState} />}
            {view === 'seo' && <SeoAuditTool setMascotState={setMascotState} queueMascotState={queueMascotState} />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
