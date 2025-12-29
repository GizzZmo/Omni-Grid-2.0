import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  try {
    const response = await ai.models.generateContent({
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
