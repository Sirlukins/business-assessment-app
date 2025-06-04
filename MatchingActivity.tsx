
import React, { useState, useEffect, useCallback } from 'react';
import { MatchingActivityData, MatchingPair } from '../types';

interface MatchingActivityProps {
  activity: MatchingActivityData;
}

export const MatchingActivity: React.FC<MatchingActivityProps> = ({ activity }) => {
  const [terms, setTerms] = useState<MatchingPair[]>([]);
  const [definitions, setDefinitions] = useState<MatchingPair[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<MatchingPair | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<MatchingPair | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // Store IDs of matched terms
  const [feedback, setFeedback] = useState<string>('');

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    setTerms(shuffleArray(activity.pairs));
    setDefinitions(shuffleArray([...activity.pairs])); // Shuffle a copy for definitions
    setSelectedTerm(null);
    setSelectedDefinition(null);
    setMatchedPairs([]);
    setFeedback('');
  }, [activity]);

  const handleTermSelect = useCallback((term: MatchingPair) => {
    if (matchedPairs.includes(term.id)) return; // Already matched
    setSelectedTerm(term);
    setSelectedDefinition(null); // Reset definition selection
    setFeedback('');
  }, [matchedPairs]);

  const handleDefinitionSelect = useCallback((def: MatchingPair) => {
    if (matchedPairs.includes(def.id)) return; // Already matched (should not happen if term is matched)
    setSelectedDefinition(def);
    setFeedback('');
  }, [matchedPairs]);

  useEffect(() => {
    if (selectedTerm && selectedDefinition) {
      if (selectedTerm.id === selectedDefinition.id) { // Correct match based on ID
        setMatchedPairs(prev => [...prev, selectedTerm.id]);
        setFeedback(`Correct! "${selectedTerm.term}" matches.`);
        setSelectedTerm(null);
        setSelectedDefinition(null);
      } else {
        setFeedback(`Incorrect. Try again.`);
        // Optionally reset selection after a delay
        setTimeout(() => {
          setSelectedTerm(null);
          setSelectedDefinition(null);
          // setFeedback(''); // Clear feedback after a bit more time or keep it
        }, 1500);
      }
    }
  }, [selectedTerm, selectedDefinition]);

  const isFullyMatched = matchedPairs.length === activity.pairs.length && activity.pairs.length > 0;

  return (
    <div className="p-6 bg-slate-700 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Terms Column */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-slate-100">Terms</h4>
          <ul className="space-y-2">
            {terms.map(term => (
              <li key={`term-${term.id}`}>
                <button
                  onClick={() => handleTermSelect(term)}
                  disabled={matchedPairs.includes(term.id)}
                  className={`w-full text-left p-3 rounded-md border-2 transition-all duration-150
                    ${selectedTerm?.id === term.id ? 'bg-sky-700/50 border-sky-500 ring-2 ring-sky-500' : 'bg-slate-600/50 border-slate-500 hover:border-sky-600'}
                    ${matchedPairs.includes(term.id) ? 'bg-green-700/50 border-green-500 opacity-70 cursor-default' : 'cursor-pointer'}
                  `}
                >
                  {term.term}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Definitions Column */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-slate-100">Definitions</h4>
          <ul className="space-y-2">
            {definitions.map(def => (
              <li key={`def-${def.id}`}>
                <button
                  onClick={() => handleDefinitionSelect(def)}
                  disabled={matchedPairs.includes(def.id) || !selectedTerm} // Disable if term not selected or if matched
                  className={`w-full text-left p-3 rounded-md border-2 transition-all duration-150
                    ${selectedDefinition?.id === def.id && selectedTerm?.id !== def.id ? 'bg-red-700/50 border-red-500' : ''}
                    ${selectedDefinition?.id === def.id && selectedTerm?.id === def.id ? 'bg-sky-700/50 border-sky-500 ring-2 ring-sky-500' : 'bg-slate-600/50 border-slate-500 hover:border-sky-600'}
                    ${matchedPairs.includes(def.id) ? 'bg-green-700/50 border-green-500 opacity-70 cursor-default' : (!selectedTerm ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}
                  `}
                >
                  {def.definition}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {feedback && (
        <p className={`mt-4 text-sm font-medium ${feedback.startsWith('Correct') ? 'text-green-400' : 'text-red-400'}`}>
          {feedback}
        </p>
      )}
      {isFullyMatched && (
        <p className="mt-4 text-lg font-semibold text-green-400">
          Congratulations! You've matched all items!
        </p>
      )}
    </div>
  );
};
    