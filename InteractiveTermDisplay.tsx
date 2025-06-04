
import React from 'react';

interface InteractiveTermDisplayProps {
  term: string;
  definition: string;
}

export const InteractiveTermDisplay: React.FC<InteractiveTermDisplayProps> = ({ term, definition }) => {
  return (
    <span className="relative group">
      <span className="text-sky-400 underline decoration-sky-400/50 decoration-dotted hover:text-sky-300 cursor-pointer transition-colors duration-150">
        {term}
      </span>
      <span
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs 
                   bg-slate-700 text-white text-sm rounded-md shadow-lg p-3 z-20 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out pointer-events-none
                   invisible group-hover:visible"
      >
        {definition}
        <svg className="absolute text-slate-700 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </span>
    </span>
  );
};
