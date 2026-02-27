
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async suggestNewApp(prompt: string) {
    if (!process.env.API_KEY) return null;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on the user's idea, suggest a new AI application.
          User Idea: ${prompt}
          Format the response as a JSON object with:
          - name: string
          - typeLabel: string (e.g., '对话助手', '智能体', '工作流')
          - description: string (short and professional in Chinese)
          - icon: string (one of: 'MessageSquare', 'Bot', 'GitBranch', 'Search', 'FileText', 'Scissors', 'Code', 'Database', 'BookOpen')
          - iconBgColor: string (a Tailwind background color class like 'bg-blue-600')
          - tags: string[]`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              typeLabel: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING },
              iconBgColor: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["name", "typeLabel", "description", "icon", "iconBgColor", "tags"]
          },
        },
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error('Error suggesting app:', error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
