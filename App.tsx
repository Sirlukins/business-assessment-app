
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SectionKey, SectionData, ChatMessage as AppChatMessage } from './types';
import { studySectionsData } from './constants/content';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SectionDisplay } from './components/SectionDisplay';
import { GeminiTutorModal } from './components/GeminiTutorModal';
import { ChatBubbleLeftEllipsisIcon } from './constants/icons';

const App: React.FC = () => {
  const [activeSectionKey, setActiveSectionKey] = useState<SectionKey>(studySectionsData[0]?.id || SectionKey.INTRODUCTION);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState<boolean>(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleNavClick = useCallback((key: SectionKey) => {
    setActiveSectionKey(key);
  }, []);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeSectionKey]);

  const activeSection = studySectionsData.find(sec => sec.id === activeSectionKey);

  const Icon = activeSection?.icon || ChatBubbleLeftEllipsisIcon; // Fallback icon

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow w-full max-w-7xl">
        <div className="lg:flex lg:space-x-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-1/4 mb-8 lg:mb-0 lg:sticky lg:top-24 self-start">
            <div className="p-4 bg-slate-800 shadow-xl rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2">Study Sections</h2>
              <nav>
                <ul>
                  {studySectionsData.map((section) => {
                    const NavIcon = section.icon || ChatBubbleLeftEllipsisIcon;
                    return (
                    <li key={section.id} className="mb-1">
                      <button
                        onClick={() => handleNavClick(section.id)}
                        className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 ease-in-out flex items-center space-x-3
                                    ${activeSectionKey === section.id 
                                      ? 'bg-sky-500 text-white shadow-lg transform scale-105' 
                                      : 'bg-slate-700 hover:bg-sky-600 hover:text-white focus:bg-sky-600 focus:text-white'}`}
                      >
                        <NavIcon className="w-5 h-5 flex-shrink-0" />
                        <span>{section.title}</span>
                      </button>
                    </li>
                  )})}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main ref={mainContentRef} className="lg:w-3/4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 10rem)' /* Adjust based on header/footer height */ }}>
            {activeSection ? (
              <SectionDisplay sectionData={activeSection} />
            ) : (
              <div className="p-6 bg-slate-800 shadow-xl rounded-lg">
                <h2 className="text-2xl font-bold text-sky-400">Section Not Found</h2>
                <p className="mt-2 text-slate-300">Please select a section from the navigation.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Floating AI Tutor Button */}
      <button
        onClick={() => setIsTutorModalOpen(true)}
        className="fixed bottom-6 right-6 bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-full shadow-2xl transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-50 z-50"
        aria-label="Open AI Tutor"
      >
        <ChatBubbleLeftEllipsisIcon className="w-8 h-8" />
      </button>

      <GeminiTutorModal
        isOpen={isTutorModalOpen}
        onClose={() => setIsTutorModalOpen(false)}
        currentSectionContext={activeSection?.summary}
      />
      
      <Footer />
    </div>
  );
};

export default App;
