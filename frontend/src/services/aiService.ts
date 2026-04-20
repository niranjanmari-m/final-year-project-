import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export interface ExtractedRSVP {
  guestName: string;
  guestCount: number;
  foodPreference: 'Vegetarian' | 'Non-Vegetarian' | 'Not Specified';
  additionalDetails: string;
}

export const extractRSVPInfo = async (userInput: string): Promise<ExtractedRSVP> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract RSVP details from the following guest message: "${userInput}". 
    
    Guidelines:
    1. guestName: The name of the guest. If not provided, use "Guest".
    2. guestCount: Number of people attending. If not provided, assume 1.
    3. foodPreference: Determine if they want "Vegetarian" or "Non-Vegetarian". If not mentioned, use "Not Specified".
    4. additionalDetails: Any other dietary needs, allergies, or special messages. If none, use "None".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          guestName: {
            type: Type.STRING,
            description: "The name of the guest."
          },
          guestCount: {
            type: Type.NUMBER,
            description: "Number of people attending."
          },
          foodPreference: {
            type: Type.STRING,
            enum: ["Vegetarian", "Non-Vegetarian", "Not Specified"],
            description: "Food preference."
          },
          additionalDetails: {
            type: Type.STRING,
            description: "Other dietary needs or special requests."
          }
        },
        required: ["guestName", "guestCount", "foodPreference", "additionalDetails"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to extract RSVP info");
  }

  return JSON.parse(text);
};

export const generateLoveStory = async (bulletPoints: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a beautiful, romantic, and engaging love story for a wedding invitation based on these bullet points:
    "${bulletPoints}"
    
    The story should be around 150-200 words, written in a warm and poetic tone. 
    Focus on the journey of the couple and the magic of their connection.
    Return only the story text.`,
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to generate love story");
  }

  return text.trim();
};

export interface BeautifiedMessage {
  beautifiedText: string;
  title: string;
  rating: number;
  isAppropriate: boolean;
}

export const beautifyMessage = async (userInput: string): Promise<BeautifiedMessage> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Moderated and beautify the following guest message for a wedding wall: "${userInput}". 
    
    Guidelines:
    1. If the message is inappropriate, offensive, or spam, set isAppropriate to false.
    2. If appropriate, beautify the message to make it sound warm, romantic, or celebratory, while keeping the original intent.
    3. Create a short, catchy "Review Title" (3-5 words) that summarizes the sentiment.
    4. Assign a "Heart Rating" from 1 to 5 based on the warmth of the message (usually 5 for wedding wishes).
    5. Return the result in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          beautifiedText: {
            type: Type.STRING,
            description: "The beautified version of the message."
          },
          title: {
            type: Type.STRING,
            description: "A short summary title for the message."
          },
          rating: {
            type: Type.NUMBER,
            description: "A rating from 1 to 5 hearts."
          },
          isAppropriate: {
            type: Type.BOOLEAN,
            description: "Whether the message is appropriate for a wedding wall."
          }
        },
        required: ["beautifiedText", "title", "rating", "isAppropriate"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to beautify message");
  }

  return JSON.parse(text);
};
