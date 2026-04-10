
import React, { useState, useEffect, useCallback } from 'react';
import fetchMotivationalQuote from '../services/geminiService';
import { SparklesIcon, RefreshIcon } from './icons';

const QuoteDisplay: React.FC = () => {
  const [quote, setQuote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getQuote = useCallback(async () => {
    setIsLoading(true);
    const newQuote = await fetchMotivationalQuote();
    setQuote(newQuote);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    getQuote();
  }, [getQuote]);

  return (
    <div className="mt-8 p-4 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg border border-purple-700/50 shadow-lg relative">
        <div className="flex items-start">
            <SparklesIcon className="w-6 h-6 text-yellow-300 mr-3 flex-shrink-0 mt-1" />
            <blockquote className="flex-grow">
                <p className="text-lg italic text-gray-200">
                {isLoading ? 'Fetching inspiration...' : `"${quote}"`}
                </p>
            </blockquote>
        </div>
        <button 
            onClick={getQuote} 
            disabled={isLoading}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Get new quote"
        >
            <RefreshIcon className={`w-5 h-5 text-yellow-300 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
    </div>
  );
};

export default QuoteDisplay;
