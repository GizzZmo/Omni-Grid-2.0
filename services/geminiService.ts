import { GoogleGenAI } from '@google/genai';

const resolveApiKey = () => {
  const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const nodeEnv = typeof process !== 'undefined' ? process.env || {} : {};
  const browserEnv =
    (typeof globalThis !== 'undefined' && (globalThis as any)?.process?.env) || {};

  return (
    metaEnv.VITE_API_KEY ||
    metaEnv.GEMINI_API_KEY ||
    nodeEnv.GEMINI_API_KEY ||
    nodeEnv.API_KEY ||
    browserEnv.GEMINI_API_KEY ||
    browserEnv.API_KEY
  );
};

let aiInitialized = false;
let ai: GoogleGenAI | null = null;

export const getGenAIClient = (): GoogleGenAI | null => {
  if (aiInitialized) return ai;

  const apiKey = resolveApiKey();
  ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  aiInitialized = true;
  return ai;
};

const client = getGenAIClient();

export async function refineText(
  text: string,
  instruction: 'REFINE' | 'EXPAND' | 'TRANSLATE' | 'ANALYZE' | 'SUMMARY' | 'TONE'
): Promise<string> {
  let prompt = '';

  switch (instruction) {
    case 'REFINE':
      prompt = `Rewrite the following text to be more professional, concise, and clear:\n\n"${text}"`;
      break;
    case 'EXPAND':
      prompt = `Expand upon the following text with more details, examples, and context:\n\n"${text}"`;
      break;
    case 'TRANSLATE':
      prompt = `Translate the following text into Spanish (if English) or English (if not English):\n\n"${text}"`;
      break;
    case 'ANALYZE':
      prompt = `Analyze the following data or text. Identify key patterns, summarize the content, and provide actionable insights. If it is CSV/JSON data, interpret the values:\n\n"${text}"`;
      break;
    case 'SUMMARY':
      prompt = `Provide a concise bullet-point summary of the following text:\n\n"${text}"`;
      break;
    case 'TONE':
      prompt = `Rewrite the following text to sound more "Cyberpunk/Hacker" but keep the meaning intact:\n\n"${text}"`;
      break;
  }

  if (!client) {
    return text;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert editor and data analyst embedded in a productivity tool.',
      },
    });
    return response.text || text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to process text with AI.');
  }
}
