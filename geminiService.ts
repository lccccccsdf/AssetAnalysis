
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, CollectionSummary } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeAsset(imageBase64: string): Promise<AnalysisResult> {
  const prompt = `Analyze this visual asset for a game or marketing campaign. Provide a detailed quantitative analysis in JSON format. 
  
  IMPORTANT: When calculating color distribution, IGNORE the background color (e.g., solid white, solid black, transparent grids, or generic backdrop gradients) and focus exclusively on the foreground subjects/main assets.

  Include:
  1. Color distribution (top 5 FOREGROUND colors with percentage and approximate HEX).
  2. Sharpness score (0-100).
  3. Complexity score (0-100).
  4. Saturation score (0-100).
  5. Primary style tags (e.g., Cyberpunk, Minimalism, Rococo, Ukiyo-e).
  6. Comparison against public datasets (WikiArt, LAION-5B, OpenGameArt) simulating a CLIP vector match (give similarity 0-1).
  7. Uniqueness score (0-100) based on distance from common tropes.
  8. A brief professional critique.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          colorDistribution: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.NUMBER },
                hex: { type: Type.STRING }
              }
            }
          },
          sharpness: { type: Type.NUMBER },
          complexity: { type: Type.NUMBER },
          saturation: { type: Type.NUMBER },
          styleFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          clipSimilarity: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dataset: { type: Type.STRING },
                similarity: { type: Type.NUMBER },
                styleMatch: { type: Type.STRING }
              }
            }
          },
          uniquenessScore: { type: Type.NUMBER },
          description: { type: Type.STRING }
        },
        required: ["colorDistribution", "sharpness", "complexity", "styleFeatures", "clipSimilarity", "uniquenessScore", "description"]
      }
    }
  });

  const rawData = JSON.parse(response.text);
  return {
    ...rawData,
    id: Math.random().toString(36).substr(2, 9),
    thumbnail: imageBase64
  };
}

export async function synthesizeCollectionSummary(results: AnalysisResult[]): Promise<CollectionSummary> {
  const allFeatures = results.flatMap(r => r.styleFeatures).join(", ");
  const allDescriptions = results.map(r => r.description).join(". ");
  
  const prompt = `Based on the following analysis of a collection of visual assets:
  Features: ${allFeatures}
  Descriptions: ${allDescriptions}

  Please provide a summary in JSON format:
  1. coreFeatures: A list of exactly 8 most critical visual keywords/features that define this collection (in Chinese).
  2. promptFormula: A professional Chinese prompt formula suitable for training Large Language Models or Stable Diffusion/Midjourney, structured as "风格:[...] + 构图:[...] + 核心特征:[...] + 色调:[...] + 细节:[...]" etc.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          coreFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          promptFormula: { type: Type.STRING }
        },
        required: ["coreFeatures", "promptFormula"]
      }
    }
  });

  return JSON.parse(response.text);
}
