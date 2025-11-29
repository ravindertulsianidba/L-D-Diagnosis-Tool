import React, { useState, useRef, useEffect } from 'react';
import { Message, DiagnosticPhase } from './types';
import { initializeChat, sendMessageToGemini } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { PhaseTracker } from './components/PhaseTracker';

// Initial greeting message
const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: 'model',
  text: `**Welcome to the Domino Map™ Training Needs Diagnosis Tool.**

I am your performance consultant. My goal is to help you clarify your business problem, diagnose root causes, and decide if training is the right solution.

**To get started, please briefly describe the business problem or performance gap you are trying to solve.**`,
  timestamp: Date.now()
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<DiagnosticPhase>(DiagnosticPhase.CLARIFY);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Analyze model response to heuristically update the Phase indicator
  // Note: This is a UI enhancement. The actual logic is controlled by the LLM system prompt.
  const updatePhaseFromContext = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("json") && lowerText.includes("export")) {
      setCurrentPhase(DiagnosticPhase.FOCUS_AREAS);
    } 
    else if (lowerText.includes("focus areas") || lowerText.includes("phase 4")) {
      setCurrentPhase(DiagnosticPhase.FOCUS_AREAS);
    }
    else if (lowerText.includes("lane") || lowerText.includes("classification") || lowerText.includes("phase 3")) {
      setCurrentPhase(DiagnosticPhase.LANE_DECISION);
    }
    else if (lowerText.includes("rate") || lowerText.includes("0–3") || lowerText.includes("phase 2")) {
      setCurrentPhase(DiagnosticPhase.ROOT_CAUSE);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(input);
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMessage]);
      updatePhaseFromContext(responseText);

    } catch (error) {
      console.error("Error in chat flow", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <PhaseTracker currentPhase={currentPhase} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
           <div>
            <h1 className="font-bold text-gray-900">Domino Map™</h1>
            <p className="text-xs text-gray-500">Step 1: Training Needs Diagnosis Tool</p>
           </div>
           <div className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded font-medium border border-brand-200">
              Phase {currentPhase}
           </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 md:p-6">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-4 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none shadow-sm text-gray-800 placeholder-gray-400 transition-all"
              rows={1}
              placeholder="Type your reply here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ minHeight: '52px', maxHeight: '150px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${
                !input.trim() || isLoading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Domino Map™ Step 1 AI Consultant. Responses are generated by Gemini.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;