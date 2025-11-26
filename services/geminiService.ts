import { GoogleGenAI, Content, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Define the message history structure for our internal state
interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Function to extract JSON from a markdown code block if present
export const extractJson = (text: string): string | null => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1];
  }
  // Try to parse the whole text if it looks like an object
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }
  return null;
};

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert internal history to Gemini's expected format
  // The SDK manages history via the Chat object, but since we are in a stateless web context
  // (unless we keep the Chat object alive in a Ref), it is safer to pass history if we were using generateContent.
  // However, for the best chat experience, we should use ai.chats.create with history.

  const chatHistory: Content[] = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content } as Part],
  }));

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4, // Lower temperature for more analytical/consultative responses
    },
    history: chatHistory,
  });

  try {
    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
