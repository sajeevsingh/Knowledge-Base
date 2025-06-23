import React, { useState, useEffect, useRef } from 'react';

export default function KnowledgeBase({ greeting = '', mode = 'customer' }) {
  const [question, setQuestion]     = useState('');
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const chatRef                     = useRef(null);

  /* greet on first render */
  useEffect(() => {
    if (greeting) setMessages([{ type: 'bot', text: greeting }]);
  }, [greeting]);

  /* auto-scroll */
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading, question]);

  /* send question */
  const handleSend = async () => {
    const q = question.trim();
    if (!q) return;

    setMessages(p => [...p, { type: 'user', text: q }]);
    setQuestion('');
    setLoading(true);

    try {
      const res  = await fetch('http://127.0.0.1:8000/ask', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ question: q, mode }),
      });
      const data = await res.json();
      setMessages(p => [...p, { type: 'bot', text: data.answer || 'No response.' }]);
    } catch (err) {
      setMessages(p => [...p, { type: 'bot', text: 'Error contacting server.' }]);
    }
    setLoading(false);
  };

  /* JSX */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c1c2e] to-[#0f0f1f] flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-2xl h-[80vh] backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* header */}
        <header className="p-4 text-center text-xl font-semibold bg-white/5 border-b border-white/10">
          Aquity Assistant
        </header>

        {/* chat area */}
        <main ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-3 ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.type === 'bot' && <img src="/bot.png"  alt="bot"  className="w-8 h-8 rounded-full bg-gray-300" />}
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm whitespace-pre-line ${
                m.type === 'user' ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-gray-800 text-white rounded-bl-none'}`}>
                {m.text}
              </div>
              {m.type === 'user' && <img src="/user.jpg" alt="you" className="w-8 h-8 rounded-full bg-blue-400" />}
            </div>
          ))}

          {/* typing preview */}
          {question && (
            <div className="flex items-start gap-3 justify-end">
              <div className="max-w-[75%] px-4 py-2 rounded-2xl bg-blue-400 text-white text-sm rounded-br-none whitespace-pre-line">
                {question}
              </div>
              <img src="/user.jpg" alt="you" className="w-8 h-8 rounded-full bg-blue-400" />
            </div>
          )}

          {/* bot typing dots */}
          {loading && (
            <div className="flex items-start gap-3 justify-start">
              <img src="/bot.png" alt="bot" className="w-8 h-8 rounded-full bg-gray-300" />
              <div className="flex gap-1 mt-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </main>

        {/* input */}
        <footer className="p-4 bg-white/5 border-t border-white/10">
          <div className="flex gap-2 items-end">
            <div className="relative flex-1">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                id="chat-input"
                className="peer w-full bg-white text-black rounded-lg px-4 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="chat-input"
                className={`absolute left-4 text-gray-500 text-sm transition-all duration-200 pointer-events-none
                  ${question.length > 0 ? 'top-2 text-sm' : 'top-3.5 text-base text-gray-400'}
                  peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-500`}
              >
                Ask your question…
              </label>
            </div>
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              Send
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}