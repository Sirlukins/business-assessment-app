
import React from 'react';
import { InteractiveTerm } from '../types';
import { InteractiveTermDisplay } from '../components/InteractiveTermDisplay';

export const serializeRichTextToString = (content: string | (string | InteractiveTerm)[]): string => {
  if (typeof content === 'string') {
    return content;
  }
  return content.map(part => {
    if (typeof part === 'string') {
      return part;
    }
    if (part.type === 'interactiveTerm') {
      return part.term;
    }
    return '';
  }).join('');
};

export const renderRichText = (content: string | (string | InteractiveTerm)[]) : React.ReactNode => {
  if (typeof content === 'string') {
    return content;
  }
  return content.map((part, index) => {
    if (typeof part === 'string') {
      // FIX: Replaced JSX with React.createElement due to apparent JSX parsing issues.
      // This alternative syntax achieves the same result as <React.Fragment key={index}>{part}</React.Fragment>;
      return React.createElement(React.Fragment, { key: index }, part);
    }
    if (part.type === 'interactiveTerm') {
      // FIX: Replaced JSX with React.createElement due to apparent JSX parsing issues.
      // This alternative syntax achieves the same result as <InteractiveTermDisplay key={index} term={part.term} definition={part.definition} />;
      return React.createElement(InteractiveTermDisplay, { key: index, term: part.term, definition: part.definition });
    }
    return null;
  });
};
