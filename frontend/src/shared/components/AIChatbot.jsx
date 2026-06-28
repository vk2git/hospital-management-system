import React, { useState, useRef, useEffect } from 'react';
import { sendChatbotMessage } from '@/shared/api/api';
import AIBanner from '@/shared/components/AIBanner';

export default function AIChatbot({ type = 'medical' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm the Rising Hospital Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setLoading(true);

    try {
      const { data } = await sendChatbotMessage(userMessage);
      setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "I'm having trouble connecting right now. Please try again later.", sender: 'bot', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-gray-50 w-[350px] sm:w-[400px] h-[500px] mb-4 rounded-3xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden transition-all duration-300 transform origin-bottom-right">
          {/* Header */}
          <div className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] p-4 flex justify-between items-center rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Hospital Assistant</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:rotate-90"
              type="button"
              aria-label="Close chatbot"
            >
              <span className="material-symbols-rounded text-lg">close</span>
            </button>
          </div>

          {showBanner && type !== 'support' && (
            <div className="bg-yellow-50 px-4 py-2 border-b border-yellow-100">
              <AIBanner type={type} onClose={() => setShowBanner(false)} className="p-3 mb-0" />
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-transparent flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                <div className={`p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-[var(--md-sys-color-primary)] text-white rounded-tr-none' 
                    : msg.isError 
                      ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                <div className={`text-[10px] text-gray-400 mt-1 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.sender === 'user' ? 'You' : 'Assistant'}
                </div>
              </div>
            ))}
            {loading && (
              <div className="self-start bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-transparent">
            <form onSubmit={handleSend} className="flex gap-2 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-white border border-gray-200 text-gray-800 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-[var(--md-sys-color-primary)] focus:ring-1 focus:ring-[var(--md-sys-color-primary)] transition-all"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1.5 bottom-1.5 aspect-square bg-[var(--md-sys-color-primary)] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--md-sys-color-primary)]/90 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-gray-800 text-white rotate-90 hover:bg-gray-900' : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:scale-110'
        }`}
        aria-label="Toggle AI Chatbot"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
