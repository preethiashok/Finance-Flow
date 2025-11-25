import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Unable to connect to AI service. Please check your API configuration.";

  // Prepare data for the model - simplify to save tokens and focus context
  const recentTransactions = transactions.slice(0, 50); // Analyze last 50 for brevity
  const summary = JSON.stringify(recentTransactions);

  const prompt = `
    You are an expert financial advisor. Here is a JSON summary of my recent financial transactions:
    ${summary}

    Please provide a concise analysis of my spending habits.
    1. Summarize my financial health briefly.
    2. Identify the biggest spending category.
    3. Give me 3 actionable tips to improve my savings or budget.

    Keep the tone professional yet encouraging. Format the response with Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No advice could be generated at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while analyzing your data. Please try again later.";
  }
};
