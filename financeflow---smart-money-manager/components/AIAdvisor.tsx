import React, { useState } from 'react';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Bot, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  transactions: Transaction[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(transactions);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <Sparkles size={32} className="text-yellow-300" />
          </div>
          <h1 className="text-3xl font-bold">AI Financial Insights</h1>
        </div>
        <p className="text-indigo-100 text-lg max-w-2xl">
          Leverage the power of Gemini AI to analyze your spending patterns, identify leaks, and get personalized tips to grow your wealth.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px] flex flex-col">
        {!advice && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <Bot size={64} className="text-indigo-200 mb-6" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to analyze your finances?</h3>
            <p className="text-gray-500 mb-8 max-w-md">
              I will scan your transaction history to provide a health check and actionable saving advice.
            </p>
            <button
              onClick={handleGetAdvice}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Sparkles size={18} />
              Generate Insights
            </button>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Crunching the numbers...</p>
            <p className="text-gray-400 text-sm mt-2">Consulting with Gemini API</p>
          </div>
        )}

        {advice && !loading && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Bot className="text-indigo-600" /> Analysis Result
              </h3>
              <button
                onClick={handleGetAdvice}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
            
            <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed">
               {/* Note: ReactMarkdown is hypothetical here. In a real restricted env, 
                   we might just render whitespace-pre-wrap div or similar if library not available. 
                   Assuming standard markdown rendering for simplicity or simple text. 
                   Since we can't install 'react-markdown' in this specific flow easily without knowing if it is pre-installed,
                   I will do a simple text render with whitespace preservation. 
               */}
               <div className="whitespace-pre-wrap font-sans text-sm md:text-base">
                 {advice}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
