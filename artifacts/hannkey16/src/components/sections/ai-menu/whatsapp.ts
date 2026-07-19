const WHATSAPP_NUMBER = '6289696263297';

/** Builds a wa.me deep link pre-filled with a handoff message from an AI Menu tool. */
export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
