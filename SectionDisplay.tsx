
import React from 'react';
import { SectionData, ContentBlock, ContentBlockQuiz, ContentBlockShortAnswer } from '../types';
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz';
import { MatchingActivity } from './MatchingActivity';
import { ShortAnswerSection } from './ShortAnswerSection';
import { SparklesIcon } from '../constants/icons'; 
import { renderRichText } from '../utils/richTextTools'; // Import shared renderRichText

const ContentBlockRenderer: React.FC<{ block: ContentBlock; sectionTitle?: string }> = ({ block, sectionTitle }) => {
  switch (block.type) {
    case 'heading':
      return <h2 className="text-3xl font-semibold mt-8 mb-4 text-sky-400 border-b border-slate-700 pb-2">{renderRichText(block.text)}</h2>;
    case 'subheading':
      return <h3 className="text-2xl font-semibold mt-6 mb-3 text-sky-300">{renderRichText(block.text)}</h3>;
    case 'paragraph':
      return <p className="mb-4 text-slate-300 leading-relaxed">{renderRichText(block.text)}</p>;
    case 'quote':
      return <blockquote className="border-l-4 border-sky-500 pl-4 italic my-4 text-slate-400">{renderRichText(block.text)}</blockquote>;
    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul';
      const listItemStyle = block.ordered ? 'list-decimal' : 'list-disc';
      return (
        <ListTag className={`${listItemStyle} ml-6 mb-4 text-slate-300 space-y-1`}>
          {block.items.map((item, index) => <li key={index}>{renderRichText(item)}</li>)}
        </ListTag>
      );
    case 'image':
      return (
        <figure className="my-6">
          <img src={block.src} alt={block.alt} className="rounded-lg shadow-lg mx-auto max-w-full h-auto" />
          {block.caption && <figcaption className="text-center text-sm text-slate-400 mt-2">{block.caption}</figcaption>}
        </figure>
      );
    case 'video':
      return (
        <div className="my-6 max-w-3xl mx-auto">
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-lg shadow-lg"
              src={`https://www.youtube.com/embed/${block.youtubeId}`}
              title={block.title || 'YouTube video player'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          {block.title && <p className="text-center text-sm text-slate-400 mt-2">{block.title}</p>}
        </div>
      );
    case 'resourceLink':
      return (
        <p className="my-4">
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 hover:underline transition-colors duration-200"
          >
            {block.text} &rarr;
          </a>
        </p>
      );
    case 'quiz':
      const quizBlock = block as ContentBlockQuiz;
      return (
        <div className="my-8 py-6 border-t border-b border-slate-700 bg-slate-700/30 p-6 rounded-lg">
          {quizBlock.title && <h3 className="text-2xl font-semibold mb-6 text-sky-300 text-center">{quizBlock.title}</h3>}
          {quizBlock.mcqs && quizBlock.mcqs.length > 0 ? (
            <MultipleChoiceQuiz mcqs={quizBlock.mcqs} />
          ) : (
            <p className="text-slate-400">No questions available for this quiz.</p>
          )}
        </div>
      );
    case 'shortAnswer':
      const saBlock = block as ContentBlockShortAnswer;
      return (
        <div className="my-8 py-6 border-t border-b border-slate-700 bg-slate-700/30 p-6 rounded-lg">
          {saBlock.title && <h3 className="text-2xl font-semibold mb-6 text-sky-300 text-center">{saBlock.title}</h3>}
          <ShortAnswerSection prompts={saBlock.prompts} sectionContext={sectionTitle || "Current Topic"} />
        </div>
      );
    default:
      return null;
  }
};


export const SectionDisplay: React.FC<{ sectionData: SectionData }> = ({ sectionData }) => {
  const SectionIcon = sectionData.icon || SparklesIcon;
  
  return (
    <article className="p-6 sm:p-8 bg-slate-800 shadow-2xl rounded-xl space-y-2">
      <header className="mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center space-x-3 mb-2">
            <SectionIcon className="w-10 h-10 text-sky-400" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">{sectionData.title}</h1>
        </div>
        <p className="text-slate-400 italic">{sectionData.summary}</p>
      </header>

      {sectionData.detailedContent.map((block, index) => (
        <ContentBlockRenderer key={index} block={block} sectionTitle={sectionData.title} />
      ))}

      {sectionData.mcqs && sectionData.mcqs.length > 0 && (
        <div className="mt-10 pt-6 border-t border-slate-700">
          <h3 className="text-2xl font-semibold mb-4 text-sky-300">Test Your Knowledge: Multiple Choice</h3>
          <MultipleChoiceQuiz mcqs={sectionData.mcqs} />
        </div>
      )}

      {sectionData.matchingActivities && sectionData.matchingActivities.map((activity, index) => (
        <div key={index} className="mt-10 pt-6 border-t border-slate-700">
          <h3 className="text-2xl font-semibold mb-4 text-sky-300">{activity.title || 'Test Your Knowledge: Matching Activity'}</h3>
          <MatchingActivity activity={activity} />
        </div>
      ))}
      
      {sectionData.shortAnswerPrompts && sectionData.shortAnswerPrompts.length > 0 && (
         <div className="mt-10 pt-6 border-t border-slate-700">
          <h3 className="text-2xl font-semibold mb-4 text-sky-300">Reflect & Respond: Short Answers</h3>
          <ShortAnswerSection prompts={sectionData.shortAnswerPrompts} sectionContext={sectionData.title} />
        </div>
      )}
    </article>
  );
};
