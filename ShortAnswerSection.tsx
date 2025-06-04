
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ShortAnswerPrompt, ChatMessage } from '../types';
import { generateGeminiResponse } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { PaperAirplaneIcon } from '../constants/icons';
import { markdownToHtml } from '../utils/markdownToHtml';
import { renderRichText, serializeRichTextToString } from '../utils/richTextTools'; // Import new utilities

interface ShortAnswerSectionProps {
  prompts: ShortAnswerPrompt[];
  sectionContext?: string;
}

export const ShortAnswerSection: React.FC<ShortAnswerSectionProps> = ({ prompts, sectionContext }) => {
  const [promptChats, setPromptChats] = useState<Record<string, ChatMessage[]>>({});
  const [currentChatInputs, setCurrentChatInputs] = useState<Record<string, string>>({});
  const [isLoadingChat, setIsLoadingChat] = useState<Record<string, boolean>>({});
  
  const chatContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToChatBottom = (promptId: string) => {
    const container = chatContainerRefs.current[promptId];
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 0);
    }
  };

  useEffect(() => {
    prompts.forEach(prompt => {
      if (!promptChats[prompt.id]) {
        const promptTextForSystem = serializeRichTextToString(prompt.prompt);
        setPromptChats(prev => ({
          ...prev,
          [prompt.id]: [{
            id: `${prompt.id}-initial`,
            text: `Assessment Question: ${promptTextForSystem}\n\nHow would you like to approach this? You can start by outlining your main points or asking for a hint.`,
            sender: 'system',
            timestamp: new Date()
          }]
        }));
      }
    });
  }, [prompts]); // Removed promptChats from dependency array to avoid re-initialization loops

  useEffect(() => {
    for (const promptId in promptChats) {
        scrollToChatBottom(promptId);
    }
  }, [promptChats]);

  const handleChatInputChange = (promptId: string, value: string) => {
    setCurrentChatInputs(prev => ({ ...prev, [promptId]: value }));
  };

  const handleSendChatMessage = useCallback(async (promptId: string) => {
    const studentMessageText = currentChatInputs[promptId]?.trim();
    if (!studentMessageText) return;

    const currentPrompt = prompts.find(p => p.id === promptId);
    if (!currentPrompt) return;

    const studentMessage: ChatMessage = {
      id: Date.now().toString(),
      text: studentMessageText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setPromptChats(prev => {
      const newChats = {
        ...prev,
        [promptId]: [...(prev[promptId] || []), studentMessage]
      };
      // Use an IIFE to handle async logic immediately after state update
      (async () => {
        setIsLoadingChat(prevLoading => ({ ...prevLoading, [promptId]: true }));
        setCurrentChatInputs(prevInput => ({ ...prevInput, [promptId]: '' }));

        const conversationHistory = (newChats[promptId] || []).map(msg => `${msg.sender}: ${msg.text}`).join('\n');
        const geminiContext = `Previous conversation history for this question:\n${conversationHistory}`;
        
        const promptTextForGemini = serializeRichTextToString(currentPrompt.prompt);
        const systemInstruction = `You are a Business Studies tutor. The student is trying to answer the assessment question: "${promptTextForGemini}". Their current message is: "${studentMessage.text}". Review the conversation history if needed. Guide them with a VERY SHORT (1-2 sentences maximum) Socratic question, a specific hint, or a request for elaboration. Do not give them the complete answer. Be conversational and facilitate turn-taking. Your goal is to help them build their own answer step-by-step. Avoid pleasantries like "Great!" or "That's a good start!" unless directly building on their point. Focus on guiding questions. Use simple markdown for emphasis (like **bold** or *italics*) if helpful.`;

        try {
          const aiResponseText = await generateGeminiResponse(
            studentMessage.text, // Pass only the student's current message as the main "prompt" to Gemini
            `${sectionContext ? `Overall section context: ${sectionContext}\n\n` : ''}${geminiContext}`, // Pass history & question in context
            systemInstruction
          );

          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            sender: 'ai',
            timestamp: new Date()
          };
          setPromptChats(prevChatsAI => ({
            ...prevChatsAI,
            [promptId]: [...(prevChatsAI[promptId] || []), aiMessage]
          }));
        } catch (error) {
          console.error("Error getting AI response for prompt chat:", error);
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I encountered an error trying to respond. Please try again.",
            sender: 'ai',
            timestamp: new Date()
          };
          setPromptChats(prevChatsErr => ({
            ...prevChatsErr,
            [promptId]: [...(prevChatsErr[promptId] || []), errorMessage]
          }));
        } finally {
          setIsLoadingChat(prevLoadingFinally => ({ ...prevLoadingFinally, [promptId]: false }));
        }
      })();
      return newChats; // Return the new state for setPromptChats
    });
  }, [currentChatInputs, prompts, sectionContext]);

  return (
    <div className="space-y-10">
      {prompts.map((prompt, index) => (
        <div key={prompt.id || index} className="p-4 sm:p-6 bg-slate-700/70 rounded-xl shadow-xl border border-slate-600">
          <h4 className="text-lg font-semibold mb-1 text-sky-300">
            Respond to:
          </h4>
          <div className="text-md font-medium mb-4 text-slate-100 italic">
            {/* Corrected: Removed the surrounding quotes from renderRichText call */}
            {renderRichText(prompt.prompt)}
          </div>
          
          <div 
            ref={el => { chatContainerRefs.current[prompt.id] = el; }}
            className="h-64 max-h-[40vh] overflow-y-auto mb-4 p-3 bg-slate-800 rounded-md border border-slate-600 space-y-3"
          >
            {(promptChats[prompt.id] || []).map(msg => {
              const isAI = msg.sender === 'ai';
              const messageContent = isAI ? markdownToHtml(msg.text) : msg.text;
              return (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-2.5 rounded-lg shadow-md break-words ${
                      msg.sender === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 
                      msg.sender === 'ai' ? 'bg-slate-600 text-slate-200 rounded-bl-none' : 
                      'bg-transparent text-slate-400 text-xs italic border border-slate-700 py-2 px-3' 
                    }`}
                  >
                    {isAI ? (
                      <div className="text-base whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: messageContent }} />
                    ) : (
                      <p className="text-base whitespace-pre-wrap">{messageContent}</p>
                    )}
                    {msg.sender !== 'system' && (
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoadingChat[prompt.id] && (
              <div className="flex justify-start">
                <div className="bg-slate-600 text-slate-200 p-2.5 rounded-lg shadow-md rounded-bl-none flex items-center">
                  <LoadingSpinner size="sm" color="text-sky-400" /> 
                  <span className="ml-2 text-sm italic">AI is typing...</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={currentChatInputs[prompt.id] || ''}
              onChange={(e) => handleChatInputChange(prompt.id, e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoadingChat[prompt.id] && handleSendChatMessage(prompt.id)}
              placeholder="Your thoughts or questions..."
              className="flex-grow p-3 bg-slate-600 text-slate-100 border border-slate-500 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow text-base"
              disabled={isLoadingChat[prompt.id]}
            />
            <button
              onClick={() => handleSendChatMessage(prompt.id)}
              disabled={isLoadingChat[prompt.id] || !currentChatInputs[prompt.id]?.trim()}
              className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {isLoadingChat[prompt.id] ? <LoadingSpinner size="sm" /> : <PaperAirplaneIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
