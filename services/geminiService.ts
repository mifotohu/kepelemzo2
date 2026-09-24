import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        prompt: {
            type: Type.STRING,
            description: "A detailed, highly probable text prompt that could have been used to create the image. Capture the essence, style, and subject matter."
        }
    },
    required: ["prompt"]
};

export async function analyzeImage(apiKey: string, base64Image: string, mimeType: string): Promise<AnalysisResult> {
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({ base64Image, mimeType })
    });

    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(result.error || "Failed to analyze image.");
    }
    
    return { prompt: result.prompt };
}