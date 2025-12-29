import { GoogleGenAI } from '@google/genai';
import { GridItemData, GhostData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function optimizeLayout(
  currentLayout: GridItemData[],
  visibleWidgets: string[]
): Promise<{ layout: GridItemData[]; ghost?: GhostData }> {
  const prompt = `
    Act as a UI/UX expert specializing in "Bento Box" grid layouts.
    
    Current Active Widgets: ${visibleWidgets.join(', ')}
    Current Layout JSON: ${JSON.stringify(currentLayout)}
    
    Task 1: Spatial Optimization
    Reorganize the layout to group related tools together (e.g., Dev tools with System, Creative tools with Scratchpad).
    Optimize for a 12-column grid. Ensure no overlapping.
    
    Task 2: Predictive "Ghost" Widget
    Based on the active widgets, suggest ONE additional widget that is NOT currently active but would be useful.
    (Available IDs: SYSTEM, HELP, TRANSFORMER, SCRATCHPAD, FOCUS_HUD, DEV_OPTIC, CIPHER_VAULT, CHROMA_LAB, TEMPORAL, SONIC, CALC, ASSET, POLYGLOT, WRITEPAD, WEATHER, VALUTA, ARCHITECT, THEME_ENGINE, RADIO, SUDOKU).
    
    Return a JSON object with:
    {
      "layout": [ { "i": "ID", "x": 0, "y": 0, "w": 4, "h": 6 }, ... ],
      "ghost": {
         "suggestedWidgetId": "ID_OF_SUGGESTION",
         "reason": "Short reason why this is suggested based on context",
         "previewContent": "A short, simulated data snippet or state description of what this widget would show if active (e.g. 'Tracking BTC: $65k', 'Weather: Raining', 'Snippet: console.log()')"
      }
    }
    
    Ensure the "ghost" suggestion is NOT in the "Current Active Widgets" list.
    If all widgets are active, set ghost to null.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      layout: result.layout || currentLayout,
      ghost: result.ghost || undefined,
    };
  } catch (error) {
    console.error('Grid Intelligence Failed:', error);
    return { layout: currentLayout };
  }
}

export async function processCrossTalk(
  droppedText: string,
  targetWidgetType: string
): Promise<string> {
  const prompt = `
        Context: The user dragged and dropped the following text: "${droppedText}" into the "${targetWidgetType}" widget.
        
        Task: Interpret the intent and format the text for this specific tool.
        
        Example 1: Dropping a name into "WritePad" (Drafting) -> Generate a generic email draft to this person.
        Example 2: Dropping JSON into "Scratchpad" -> Analyze and summarize the JSON.
        Example 3: Dropping a color hex into "Scratchpad" -> Explain the color emotion.
        
        Output: Return ONLY the processed text content.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || droppedText;
  } catch (e) {
    return droppedText;
  }
}
