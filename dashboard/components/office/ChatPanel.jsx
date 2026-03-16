import { useState, useRef, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════
// CHAT PANEL — Talk to ANIMA via ROOT_ORCHESTRATOR
// Sends messages through /api/chat → task_queue
// ═══════════════════════════════════════════════════════════════════

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    { role: 'anima', text: 'ANIMA OS online. How can I assist your mission today?', ts: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text, ts: Date.now() }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Chat failed');

      setMessages(prev => [...prev, {
        role: 'anima',
        text: data.reply || 'Task queued to ROOT_ORCHESTRATOR.',
        ts: Date.now(),
        agent: data.agent,
        taskId: data.taskId,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'error',
        text: `Error: ${err.message}`,
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-anima-bg-card rounded-lg border border-anima-border flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-anima-border flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-semibold text-anima-text">Chat with ANIMA</span>
        <span className="text-[10px] text-anima-text-secondary ml-auto">ROOT_ORCHESTRATOR</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[150px] max-h-[300px]">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-1.5 rounded-lg text-xs ${
                msg.role === 'user'
                  ? 'bg-anima-gold/20 text-anima-gold'
                  : msg.role === 'error'
                  ? 'bg-red-900/20 text-red-400'
                  : 'bg-white/5 text-anima-text'
              }`}
            >
              {msg.role === 'anima' && (
                <span className="text-[9px] text-anima-text-secondary block mb-0.5">
                  {msg.agent || 'ANIMA'}
                </span>
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-anima-text-secondary px-3 py-1.5 rounded-lg text-xs">
              <span className="animate-pulse">ANIMA is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2 border-t border-anima-border flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Talk to ANIMA..."
          disabled={loading}
          className="flex-1 bg-anima-bg border border-anima-border rounded px-3 py-1.5 text-xs text-anima-text placeholder:text-anima-text-secondary/40 focus:outline-none focus:border-anima-gold/50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3 py-1.5 bg-anima-gold/20 text-anima-gold text-xs rounded border border-anima-gold/30 hover:bg-anima-gold/30 disabled:opacity-30 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
