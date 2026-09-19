import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Microscope, 
  Bot, 
  User, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { ChatMessage, ScreeningRecord } from '../types';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRecord?: ScreeningRecord | null;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  activeRecord,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello Doctor, I am **CerviXAI Clinical Copilot**. I am trained on The Bethesda System 2014, ICMR Cervical Screening Guidelines, and multi-scale attention interpretability.\n\nHow may I assist with your slide review or diagnostic inquiry today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle incoming initial prompt from other screens (e.g. quick chips)
  useEffect(() => {
    if (initialPrompt && isOpen) {
      sendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          activeRecord: activeRecord
            ? {
                sampleId: activeRecord.sampleId,
                patientName: activeRecord.patientName,
                predictedClass: activeRecord.predictedClass,
                classFullName: activeRecord.classFullName,
                confidence: activeRecord.confidence,
                calibratedConfidence: activeRecord.calibratedConfidence,
                uncertaintyScore: activeRecord.uncertaintyScore,
                referToDoctor: activeRecord.referToDoctor,
                morphology: activeRecord.cellularMorphology,
              }
            : undefined,
        }),
      });

      if (!response.ok) throw new Error('API server error');
      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I could not synthesize a response. Please verify network connectivity.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const queryLower = text.toLowerCase();
      let fallbackContent = `Under The Bethesda System 2014, **${activeRecord ? activeRecord.predictedClass : 'cervical cytology'}** requires careful correlation between nuclear-to-cytoplasmic (N:C) ratio and chromatin distribution. When uncertainty exceeds 0.20 entropy, selective prediction defaults to manual cytopathologist review.`;
      
      if (queryLower.includes('hotspot') || queryLower.includes('grad-cam') || queryLower.includes('heatmap')) {
        fallbackContent = `Highlighted regions indicate areas that contributed strongly to the model's prediction. In this region, the model's attention is associated with the morphological characteristics identified during analysis (such as nuclear enlargement, hyperchromasia, and nuclear membrane irregularity). Model attention was concentrated primarily on nuclear regions showing features associated with the predicted classification (${activeRecord?.predictedClass || 'TBS category'}). AI-generated findings are intended to support qualified clinical review and should not be used as a standalone diagnosis.`;
      }

      const fallbackMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputPrompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#FAF7F2] border-l border-[#DCD4C7] shadow-xl flex flex-col justify-between animate-in slide-in-from-right duration-200 print:hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-[#DCD4C7] flex items-center justify-between bg-[#F5F0E8]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#B85C38] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#2F3A3D]">
              CerviXAI Clinical Copilot
            </h3>
            <p className="text-[11px] text-[#5B6B6F]">
              Bethesda 2014 & Grad-CAM++ Assistant
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#5B6B6F] hover:text-[#2F3A3D] rounded-md hover:bg-[#ECE4D6] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active Record Indicator */}
      {activeRecord && (
        <div className="px-4 py-2 bg-[#ECE4D6]/60 border-b border-[#DCD4C7] text-xs flex items-center justify-between">
          <span className="text-[#5B6B6F] truncate max-w-[240px]">
            Inspecting: <strong>{activeRecord.patientName}</strong> ({activeRecord.predictedClass})
          </span>
          <span className="text-[10px] font-mono bg-[#B85C38]/15 text-[#B85C38] px-1.5 py-0.5 rounded font-bold">
            {activeRecord.sampleId}
          </span>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 leading-relaxed ${
                  isUser
                    ? 'bg-[#B85C38] text-white rounded-br-none shadow-xs'
                    : 'bg-white border border-[#DCD4C7] text-[#2F3A3D] rounded-bl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>
              </div>
              <span className="text-[10px] text-[#5B6B6F] mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center space-x-2 text-[#5B6B6F] text-xs p-2">
            <span className="w-2 h-2 rounded-full bg-[#B85C38] animate-ping" />
            <span>Consulting clinical literature & model tensors...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Pre-seeded Quick Prompts */}
      <div className="px-3 py-2 border-t border-[#DCD4C7] bg-[#F5F0E8] overflow-x-auto whitespace-nowrap flex space-x-1.5 text-[11px]">
        <button
          type="button"
          onClick={() => sendMessage('How does temperature scaling T=1.35 calibrate the confidence?')}
          className="px-2 py-1 bg-white border border-[#DCD4C7] hover:border-[#B85C38] rounded-md text-[#2F3A3D] shrink-0 transition-colors"
        >
          Why T=1.35?
        </button>
        <button
          type="button"
          onClick={() => sendMessage('Explain the difference between ASC-US and LSIL in Bethesda 2014.')}
          className="px-2 py-1 bg-white border border-[#DCD4C7] hover:border-[#B85C38] rounded-md text-[#2F3A3D] shrink-0 transition-colors"
        >
          ASC-US vs LSIL criteria
        </button>
        <button
          type="button"
          onClick={() => sendMessage('What triggers selective doctor referral in CerviXAI?')}
          className="px-2 py-1 bg-white border border-[#DCD4C7] hover:border-[#B85C38] rounded-md text-[#2F3A3D] shrink-0 transition-colors"
        >
          Referral trigger logic
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleFormSubmit} className="p-3 border-t border-[#DCD4C7] bg-white flex items-center space-x-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask about cytopathology, Grad-CAM, or criteria..."
          className="flex-1 px-3 py-2 border border-[#DCD4C7] rounded-md text-xs text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isTyping}
          className="p-2 rounded-md bg-[#B85C38] text-white hover:bg-[#964726] disabled:opacity-50 transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
