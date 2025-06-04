
import React from 'react';
import { BookOpenIcon } from '../constants/icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <div className="flex items-center space-x-3">
          <BookOpenIcon className="w-10 h-10 text-sky-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            Apple Change Management Guide
          </h1>
        </div>
        <div className="text-sm text-slate-400">
          East Hills Girls Technology High School
        </div>
      </div>
    </header>
  );
};
    