
import React, { useState } from 'react';
import { MCQ } from '../types';

interface MultipleChoiceQuizProps {
  mcqs: MCQ[];
}

interface AnswerState {
  [key: string]: {
    selectedOption: number | null;
    isCorrect: boolean | null;
    submitted: boolean;
  };
}

export const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({ mcqs }) => {
  const [answers, setAnswers] = useState<AnswerState>({});

  const handleOptionChange = (mcqId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [mcqId]: { ...prev[mcqId], selectedOption: optionIndex, submitted: false, isCorrect: null },
    }));
  };

  const handleSubmit = (mcqId: string, correctAnswerIndex: number) => {
    const currentAnswer = answers[mcqId];
    if (currentAnswer && currentAnswer.selectedOption !== null) {
      setAnswers(prev => ({
        ...prev,
        [mcqId]: {
          ...currentAnswer,
          isCorrect: currentAnswer.selectedOption === correctAnswerIndex,
          submitted: true,
        },
      }));
    }
  };

  return (
    <div className="space-y-8">
      {mcqs.map((mcq, index) => (
        <div key={mcq.id || index} className="p-6 bg-slate-700 rounded-lg shadow-lg">
          <p className="text-lg font-medium mb-4 text-slate-100">{index + 1}. {mcq.question}</p>
          <div className="space-y-3">
            {mcq.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className={`flex items-center p-3 rounded-md border-2 transition-all duration-150 cursor-pointer
                  ${answers[mcq.id]?.selectedOption === optionIndex ? 'border-sky-500 bg-sky-700/30' : 'border-slate-600 hover:border-sky-600 bg-slate-600/50'}
                  ${answers[mcq.id]?.submitted && mcq.correctAnswerIndex === optionIndex ? 'border-green-500 bg-green-700/30' : ''}
                  ${answers[mcq.id]?.submitted && answers[mcq.id]?.selectedOption === optionIndex && mcq.correctAnswerIndex !== optionIndex ? 'border-red-500 bg-red-700/30' : ''}
                `}
              >
                <input
                  type="radio"
                  name={`mcq-${mcq.id}`}
                  value={optionIndex}
                  checked={answers[mcq.id]?.selectedOption === optionIndex}
                  onChange={() => handleOptionChange(mcq.id, optionIndex)}
                  disabled={answers[mcq.id]?.submitted}
                  className="form-radio h-5 w-5 text-sky-500 focus:ring-sky-400 bg-slate-800 border-slate-500"
                />
                <span className="ml-3 text-slate-200">{option}</span>
              </label>
            ))}
          </div>
          <button
            onClick={() => handleSubmit(mcq.id, mcq.correctAnswerIndex)}
            disabled={answers[mcq.id]?.submitted || answers[mcq.id]?.selectedOption === null || answers[mcq.id]?.selectedOption === undefined}
            className="mt-4 px-6 py-2 bg-sky-500 text-white font-semibold rounded-md hover:bg-sky-600 transition-colors duration-200 disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            {answers[mcq.id]?.submitted ? 'Answered' : 'Check Answer'}
          </button>
          {answers[mcq.id]?.submitted && (
            <div className={`mt-3 p-3 rounded-md text-sm ${answers[mcq.id]?.isCorrect ? 'bg-green-700/50 text-green-200' : 'bg-red-700/50 text-red-200'}`}>
              {answers[mcq.id]?.isCorrect ? 'Correct! ' : 'Incorrect. '}
              {mcq.explanation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

    