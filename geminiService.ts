
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

// IMPORTANT: In a real production application, this API key should NOT be hardcoded.
// It should be managed via environment variables and ideally accessed through a backend proxy.
// For this specific exercise, per instructions to use the provided key and assuming `process.env.API_KEY`
// is pre-configured, we'll use the provided value directly.
const API_KEY = "AIzaSyDUuHQFMnq0pfL5A_5z7KiZ2y9SX2FJSmY"; // Replace with your actual API key if different

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please ensure it is configured.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const modelName = 'gemini-2.5-flash-preview-04-17';

const parseGeminiResponse = (response: GenerateContentResponse): string => {
  try {
    let text = response.text.trim();
    // Remove markdown fences for JSON if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = text.match(fenceRegex);
    if (match && match[2]) {
      text = match[2].trim();
    }
    return text;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    // Fallback for unexpected structure, try to get any text.
    // This part might need adjustment based on actual error scenarios with response.text
    if (response && typeof (response as any).text === 'string') {
        return (response as any).text;
    }
    return "Error: Could not parse AI response.";
  }
};


export const generateGeminiResponse = async (prompt: string, context?: string, systemInstruction?: string): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Please check setup.";
  try {
    const fullPrompt = context ? `${context}\n\nQuestion: ${prompt}` : prompt;
    
    const contents: Part[] = [{ text: fullPrompt }];

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: contents, role: "user" }, // Specify role for contents
      config: {
        systemInstruction: systemInstruction || "You are a helpful assistant.",
        // Default thinking config (enabled) is generally good for quality.
        // If ultra-low latency was critical (e.g. game AI opponent), one might add:
        // thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return parseGeminiResponse(response);
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
      return `Error interacting with AI: ${error.message}`;
    }
    return "An unknown error occurred while interacting with the AI.";
  }
};

export const streamGeminiResponse = async (
  prompt: string,
  onChunk: (chunkText: string) => void,
  onError: (errorMsg: string) => void,
  onComplete: () => void,
  context?: string,
  systemInstruction?: string
): Promise<void> => {
  if (!API_KEY) {
    onError("API Key not configured. Please check setup.");
    onComplete();
    return;
  }
  try {
    const fullPrompt = context ? `${context}\n\nUser query: ${prompt}` : prompt;
    const contents: Part[] = [{ text: fullPrompt }];

    const stream = await ai.models.generateContentStream({
      model: modelName,
      contents: { parts: contents, role: "user" },
      config: {
        systemInstruction: systemInstruction || "You are a helpful assistant, provide streaming responses.",
      }
    });

    for await (const chunk of stream) {
      onChunk(parseGeminiResponse(chunk));
    }
  } catch (error) {
    console.error("Gemini API stream failed:", error);
    if (error instanceof Error) {
      onError(`Error streaming AI response: ${error.message}`);
    } else {
      onError("An unknown error occurred while streaming AI response.");
    }
  } finally {
    onComplete();
  }
};
    