import { motion, AnimatePresence, type Variants } from 'framer-motion';

export type MascotState = 'idle' | 'greeting' | 'thinking' | 'listening' | 'success' | 'happy' | 'error';

const MASCOT_IMAGES: Record<MascotState, string> = {
  idle: '/mascot/idle.webp',
  greeting: '/mascot/greeting.webp',
  thinking: '/mascot/thinking.webp',
  listening: '/mascot/listening.webp',
  success: '/mascot/success.webp',
  happy: '/mascot/happy.webp',
  error: '/mascot/error.webp',
};

const MASCOT_ALT: Record<MascotState, string> = {
  idle: 'Maskot AI HANNKEY16 sedang standby',
  greeting: 'Maskot AI HANNKEY16 melambai menyapa',
  thinking: 'Maskot AI HANNKEY16 sedang berpikir',
  listening: 'Maskot AI HANNKEY16 siap membantu',
  success: 'Maskot AI HANNKEY16 mendapat ide',
  happy: 'Maskot AI HANNKEY16 senang',
  error: 'Maskot AI HANNKEY16 minta maaf',
};

/**
 * Per-state continuous motion loop. Each entry describes the idle-in-place
 * animation for that expression (float, wiggle, bounce, sway, droop...).
 * These layer on top of the mount/switch transition below.
 */
const LOOP_ANIMATIONS: Record<MascotState, Variants['animate']> = {
  idle: { y: [0, -8, 0], transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } },
  greeting: {
    rotate: [0, -8, 6, -6, 0],
    y: [0, -4, 0],
    transition: { duration: 1.1, repeat: 2, ease: 'easeInOut' },
  },
  thinking: {
    rotate: [-3, 3, -3],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
  },
  listening: {
    y: [0, -5, 0],
    scale: [1, 1.03, 1],
    transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
  },
  success: {
    scale: [1, 1.12, 1],
    rotate: [0, 4, -4, 0],
    transition: { duration: 0.9, repeat: 1, ease: 'easeOut' },
  },
  happy: {
    y: [0, -14, 0],
    transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' },
  },
  error: {
    y: [0, 3, 0],
    rotate: [0, -2, 2, 0],
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
  },
};

interface AIMascotProps {
  state: MascotState;
  className?: string;
  imgClassName?: string;
}

/** Animated AI mascot character with distinct poses for each interaction state. */
export function AIMascot({ state, className = '', imgClassName = '' }: AIMascotProps) {
  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={state}
          src={MASCOT_IMAGES[state]}
          alt={MASCOT_ALT[state]}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1, ...LOOP_ANIMATIONS[state] }}
          exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
          transition={{ duration: 0.25 }}
          className={`w-full h-full object-contain drop-shadow-[0_8px_24px_rgba(37,99,235,0.35)] ${imgClassName}`}
          draggable={false}
        />
      </AnimatePresence>
    </div>
  );
}
