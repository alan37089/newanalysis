import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface NewsSource {
  mediaName: string;
  title: string;
  url: string;
  perspective: string;
  potentialBias: string;
}

export interface NewsAnalysis {
  topic: string;
  coreFacts: string[];
  sources: NewsSource[];
  summary: string;
  biasAlert: string;
  foundCount: number;
}

export interface TrendingNews {
  title: string;
  description: string;
  category: string;
}

export const analyzeNews = async (query: string): Promise<NewsAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `請針對以下新聞主題或連結進行深入分析：\n\n"${query}"\n\n你的任務：
1. 使用 Google 搜尋工具找出至少 5 家不同立場的主流媒體（如：中央社、聯合報、自由時報、中時、ETtoday、公視、報導者等）對此事件的報導。
2. **嚴格要求 URL 準確性**：
   - 你必須直接從搜尋結果中提取真實的新聞連結。
   - **絕對禁止**自行猜測、推導或虛構 URL（例如禁止出現像 "https://www.cna.com.tw/news/..." 這種帶有省略號或格式錯誤的連結）。
   - 確保每個來源的 \`mediaName\`、\`title\` 與其對應的 \`url\` 完全吻合。
3. 提取「核心事實」（所有媒體公認的部分）。
4. 提取「各家獨特觀點」（不同媒體強調的重點或敘事角度）。
5. 提取「潛在偏見提醒」（分析媒體背景可能導致的立場偏好）。
6. 如果找到的媒體少於 5 家，請在結果中說明原因。
7. 確保新聞是真實存在且發生在最近的。`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          coreFacts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                mediaName: { type: Type.STRING },
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                perspective: { type: Type.STRING },
                potentialBias: { type: Type.STRING }
              },
              required: ["mediaName", "title", "url", "perspective", "potentialBias"]
            }
          },
          summary: { type: Type.STRING },
          biasAlert: { type: Type.STRING },
          foundCount: { type: Type.NUMBER }
        },
        required: ["topic", "coreFacts", "sources", "summary", "biasAlert", "foundCount"]
      }
    }
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("分析失敗，請稍後再試。");
  }
};

export const getTrendingNews = async (): Promise<TrendingNews[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "請使用 Google 搜尋列出目前台灣最熱門的 5 則新聞主題。請包含標題、簡短描述與分類。確保這些新聞是真實且當下正在發生的。",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["title", "description", "category"]
        }
      }
    }
  });

  try {
    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse trending news", e);
    return [];
  }
};
