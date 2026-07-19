import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import type { MascotState } from '../AIMascot';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const THANKS_PATTERN = /terima\s*kasih|makasih|thanks|thank you/i;

interface ChatToolProps {
  mode: 'consultant' | 'coding';
  initialMessage: string;
  quickPrompts: string[];
  setMascotState: (state: MascotState) => void;
  queueMascotState: (state: MascotState, delayMs: number) => void;
}

export function ChatTool({ mode, initialMessage, quickPrompts, setMascotState, queueMascotState }: ChatToolProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: initialMessage }]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setInput('');
    setIsStreaming(true);
    setMascotState('thinking');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, mode }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      let hadError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data:')) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const payload = JSON.parse(jsonStr) as { content?: string; done?: boolean; error?: string };
            if (payload.content) {
              assistantText += payload.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                return updated;
              });
            }
            if (payload.error) {
              hadError = true;
              assistantText = payload.error;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                return updated;
              });
            }
          } catch {
            // ignore malformed SSE chunk
          }
        }
      }

      if (hadError) {
        setMascotState('error');
        queueMascotState('listening', 3000);
      } else if (THANKS_PATTERN.test(trimmed)) {
        setMascotState('happy');
        queueMascotState('listening', 2600);
      } else {
        setMascotState('success');
        queueMascotState('listening', 2000);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Maaf, terjadi kendala koneksi. Silakan coba lagi atau hubungi kami via WhatsApp.',
        };
        return updated;
      });
      setMascotState('error');
      queueMascotState('listening', 3000);
    } finally {
      if (abortRef.current === controller) setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-white/5 text-white/90 border border-white/10 rounded-bl-sm'
              }`}
            >
              {msg.content || (
                <span className="inline-flex items-center gap-1 text-white/40">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> mengetik...
                </span>
              )}
            </div>
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-col gap-2 pt-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-left text-xs text-white/70 border border-white/10 rounded-lg px-3 py-2 hover:border-primary hover:text-white transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 border-t border-white/10 flex items-center gap-2"
      >
        <label htmlFor={`ai-chat-input-${mode}`} className="sr-only">
          Tulis pertanyaan Anda
        </label>
        <input
          id={`ai-chat-input-${mode}`}
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaan Anda..."
          disabled={isStreaming}
          maxLength={2000}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          aria-label="Send message"
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
