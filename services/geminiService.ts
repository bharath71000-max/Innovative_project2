
import { GoogleGenAI } from "@google/genai";

const fetchMotivationalQuote = async (): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
        return "The secret of getting ahead is getting started. – Mark Twain";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Generate a short, powerful motivational quote for someone trying to study and stay focused. Make it inspiring and concise.',
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching motivational quote:", error);
    // Fallback quote in case of API error
    return "Believe you can and you're halfway there. – Theodore Roosevelt";
  }
};

export default fetchMotivationalQuote;
