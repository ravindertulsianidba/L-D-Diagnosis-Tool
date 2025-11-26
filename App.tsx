import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Send, Bot, User, RefreshCcw } from 'lucide-react';
import { extractJson, sendMessageToGemini } from './services/geminiService';
import { DiagnosisDashboard } from './components/DiagnosisDashboard';
import { ThinkingIndicator } from './components/ThinkingIndicator';
import { Message, DiagnosisResult } from './types';
import { INITIAL_GREETING } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [finalDiagnosis, setFinalDiagnosis] = useState<DiagnosisResult | null>(null);
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 && !finalDiagnosis) {
      setMessages([{ role: 'model', content: INITIAL_GREETING }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: inputValue };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(newMessages, inputValue, apiKey);
      
      // Check for JSON output (the end of the diagnosis)
      const possibleJson = extractJson(responseText);

      if (possibleJson) {
        try {
          const parsedResult = JSON.parse(possibleJson) as DiagnosisResult;
          // Validate basic structure exists (simple check)
          if (parsedResult.business_problem && parsedResult.root_cause_analysis) {
            setFinalDiagnosis(parsedResult);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Detected JSON-like text but failed to parse:", e);
          // If parsing fails, just treat as normal text
        }
      }

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      console.error("Failed to send message", error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting. Please check your network or API key settings." }]);
    } finally {
      setIsLoading(false);
      // Refocus input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetConsultation = () => {
    setMessages([{ role: 'model', content: INITIAL_GREETING }]);
    setFinalDiagnosis(null);
    setInputValue('');
  };

  if (finalDiagnosis) {
    return <DiagnosisDashboard data={finalDiagnosis} onReset={resetConsultation} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">L&D Performance Consultant</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Training Needs Diagnosis Tool</p>
          </div>
        </div>
        <button 
          onClick={resetConsultation}
          className="text-slate-400 hover:text-indigo-600 transition-colors"
          title="Restart Consultation"
        >
          <RefreshCcw size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-600'
              }`}>
                {msg.role === 'user' ? (
                  <User size={20} className="text-slate-600" />
                ) : (
                  <Bot size={20} className="text-white" />
                )}
              </div>
              
              <div className={`relative px-5 py-4 rounded-2xl shadow-sm max-w-[85%] text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-white border border-slate-100 text-slate-800 rounded-tr-none' 
                  : 'bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-tl-none'
              }`}>
                {/* Basic Markdown-ish rendering for line breaks and bullets */}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={20} className="text-white" />
               </div>
               <div className="bg-indigo-50 border border-indigo-100 rounded-2xl rounded-tl-none px-5 py-4 flex items-center">
                  <ThinkingIndicator />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 shrink-0">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl pl-4 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-[60px] max-h-[120px]"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${
              !inputValue.trim() || isLoading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
                AI can make mistakes. Please review the final diagnosis carefully.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
