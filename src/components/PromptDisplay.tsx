import React from 'react';
import { ExclamationIcon, SparklesIcon, CheckIcon } from './Icons';

interface PromptDisplayProps {
  prompts: { male: string; female: string } | null;
  isLoading: boolean;
  error: string | null;
  selectedPrompt: 'male' | 'female' | null;
  onSelectPrompt: (promptType: 'male' | 'female') => void;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompts, isLoading, error, selectedPrompt, onSelectPrompt }) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex-grow flex flex-col items-center justify-center bg-gray-900/50 rounded-lg p-4 text-center">
        <SparklesIcon className="w-10 h-10 text-indigo-400 animate-pulse" />
        <p className="mt-4 text-lg font-semibold text-gray-300">AI đang phân tích hình ảnh...</p>
        <p className="text-sm text-gray-400">Vui lòng đợi trong giây lát.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex-grow flex flex-col items-center justify-center bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
        <ExclamationIcon className="w-10 h-10 text-red-400" />
        <p className="mt-4 font-semibold text-red-300">Đã xảy ra lỗi</p>
        <p className="text-sm text-red-400 mt-1">{error}</p>
      </div>
    );
  }
  
  if (!prompts) {
    return (
        <div className="w-full h-full flex-grow bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Prompt của bạn sẽ xuất hiện ở đây...</p>
            </div>
        </div>
    );
  }
  
  const promptCardBaseClasses = "border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 relative";
  const promptCardInactiveClasses = "border-gray-700 bg-gray-900/50 hover:border-indigo-500 hover:bg-gray-800/60";
  const promptCardActiveClasses = "border-indigo-500 bg-gray-800/70 ring-2 ring-indigo-500/50";

  return (
    <div className="w-full h-full flex-grow flex flex-col overflow-y-auto space-y-4">
      <div
        onClick={() => onSelectPrompt('male')}
        className={`${promptCardBaseClasses} ${selectedPrompt === 'male' ? promptCardActiveClasses : promptCardInactiveClasses}`}
      >
        {selectedPrompt === 'male' && <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1"><CheckIcon className="w-3 h-3 text-white"/></div>}
        <h3 className="text-md font-semibold text-indigo-400 mb-2">Prompt Nam</h3>
        <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300">
          <p className="whitespace-pre-wrap">{prompts.male}</p>
        </div>
      </div>
      
      <div
        onClick={() => onSelectPrompt('female')}
        className={`${promptCardBaseClasses} ${selectedPrompt === 'female' ? promptCardActiveClasses : promptCardInactiveClasses}`}
      >
        {selectedPrompt === 'female' && <div className="absolute top-2 right-2 bg-pink-600 rounded-full p-1"><CheckIcon className="w-3 h-3 text-white"/></div>}
        <h3 className="text-md font-semibold text-pink-400 mb-2">Prompt Nữ</h3>
        <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300">
          <p className="whitespace-pre-wrap">{prompts.female}</p>
        </div>
      </div>
    </div>
  );
};

export default PromptDisplay;