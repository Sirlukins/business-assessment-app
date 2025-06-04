
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../types';
import { streamGeminiResponse } from '../services/geminiService'; // generateGeminiResponse removed as stream is primary
import { XMarkIcon, PaperAirplaneIcon } from '../constants/icons';
import { LoadingSpinner } from './LoadingSpinner';
import { markdownToHtml } from '../utils/markdownToHtml'; // Import the utility


interface GeminiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSectionContext?: string;
}

export const GeminiTutorModal: React.FC<GeminiTutorModalProps> = ({ isOpen, onClose, currentSectionContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([{
            id: 'initial-greeting',
            text: "Hello! I'm your AI Business Studies tutor. How can I help you understand Apple's change management today?",
            sender: 'ai',
            timestamp: new Date()
        }]);
    }
  }, [isOpen]);


  const handleSend = useCallback(async () => {
    if (input.trim() === '' || isLoading || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', timestamp: new Date() }]);
    
    let accumulatedResponse = "";

    await streamGeminiResponse(
      userMessage.text,
      (chunkText) => {
        accumulatedResponse += chunkText;
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: accumulatedResponse } : msg
        ));
      },
      (errorMsg) => {
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: errorMsg } : msg
        ));
        setIsLoading(false);
        setIsStreaming(false);
      },
      () => { 
        setIsLoading(false);
        setIsStreaming(false);
      },
      currentSectionContext,
      "You are a friendly and knowledgeable Business Studies tutor specializing in Apple's change management strategies. Help the student understand the provided context or answer their questions about it. Keep responses concise and helpful for a high school student. Your responses should be formatted for a chat, so keep them relatively short and easy to read. Use simple markdown for emphasis (like **bold** or *italics*) if helpful."
    );

  }, [input, isLoading, isStreaming, currentSectionContext]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      <div 
        className="bg-slate-800 text-slate-100 rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] max-h-[700px] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeIn"
        onClick={(e) => e.stopPropagation()} 
        style={{ animationName: 'modalFadeInAnim', animationDuration: '0.3s', animationFillMode: 'forwards' }}
      >
        <style>
          {`
          @keyframes modalFadeInAnim {
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          `}
        </style>
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-sky-400">AI Learning Partner</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-sky-400 transition-colors">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </header>

        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            const messageContent = isAI ? markdownToHtml(msg.text) : msg.text;
            const isLoadingAiPlaceholder = isAI && isStreaming && msg.text === '' && isLoading;

            return (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] p-3 rounded-lg shadow break-words ${
                    msg.sender === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {isLoadingAiPlaceholder ? (
                    <div className="flex items-center">
                       <LoadingSpinner size="sm" color="text-sky-300" /> 
                       <span className="ml-2 text-base italic opacity-70">AI is typing...</span>
                    </div>
                  ) : isAI ? (
                    <div className="text-base whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: messageContent }} />
                  ) : (
                    <p className="text-base whitespace-pre-wrap">{messageContent}</p>
                  )}
                  {!isLoadingAiPlaceholder && (
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {/* Fallback loading indicator if streaming hasn't started adding text to the AI message yet */}
          {isLoading && !isStreaming && messages[messages.length-1]?.sender !== 'ai' && ( 
             <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-200 p-3 rounded-lg shadow rounded-bl-none flex items-center">
                    <LoadingSpinner size="sm" color="text-sky-400" /> <span className="ml-2 text-base">AI is thinking...</span>
                </div>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Apple's change management..."
              className="flex-grow p-3 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow text-base"
              disabled={isLoading || isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || isStreaming || input.trim() === ''}
              className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {isLoading || isStreaming ? <LoadingSpinner size="sm" /> : <PaperAirplaneIcon className="w-6 h-6" />}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
