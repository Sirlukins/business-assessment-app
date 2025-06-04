
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-6 mt-auto shadow-top">
      <div className="container mx-auto px-4 text-center max-w-7xl">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Business Studies Learning Tool. All content for educational purposes.
        </p>
        <p className="text-xs mt-1">
          This is a study aid and does not substitute official assessment materials.
        </p>
      </div>
    </footer>
  );
};
    