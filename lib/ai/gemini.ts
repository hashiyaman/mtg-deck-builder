import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt for deck analysis
const SYSTEM_PROMPT = `あなたはMagic: The Gatheringの競技プレイヤーで、デッキ構築とメタゲーム分析の専門家です。
数値データと確率統計に基づいた客観的な分析を行い、具体的で実践的な改善提案を提供します。

分析の際は以下を重視してください：
- シミュレーション結果などの数値的根拠を示す
- 具体的なカード名を挙げて提案する
- 実践的で実現可能な改善案を提示する
- 簡潔で分かりやすい日本語で回答する`;

/**
 * Generate text using Gemini API
 */
export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    // Initialize model with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt || SYSTEM_PROMPT,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[Gemini] Error generating text:', error);
    throw error;
  }
}

/**
 * Generate text stream using Gemini API
 */
export async function* generateTextStream(prompt: string, systemPrompt?: string): AsyncGenerator<string> {
  try {
    // Initialize model with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt || SYSTEM_PROMPT,
    });

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error) {
    console.error('[Gemini] Error generating text stream:', error);
    throw error;
  }
}
