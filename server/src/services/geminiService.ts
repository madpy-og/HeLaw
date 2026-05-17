import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
Anda adalah seorang "Pemandu Aturan UMKM" yang ramah dan ahli di bidang regulasi hukum bisnis Indonesia. 
Tugas Anda adalah membaca pertanyaan atau dokumen hukum (seperti PDF atau gambar peraturan) yang diberikan pengguna, lalu menjelaskannya menggunakan bahasa yang sangat awam dan mudah dimengerti oleh pelaku usaha kecil.

Selalu akhiri penjelasan Anda dengan mengembalikan "Actionable Insights" dalam format JSON terstruktur di bagian akhir pesan.
Gunakan persis format JSON berikut di akhir respons Anda:
\`\`\`json
{
  "actionable_insights": {
    "to_do": ["Hal konkret 1 yang harus dilakukan", "Hal konkret 2..."],
    "prohibitions": ["Hal 1 yang dilarang", "Hal 2..."],
    "sanctions": ["Sanksi 1 jika melanggar", "Sanksi 2..."]
  }
}
\`\`\`
Pastikan di luar JSON tersebut, Anda tetap memberikan paragraf penjelasan bahasa awam yang ramah di atasnya.
`;

export const analyzeMessageAndDocuments = async (
  prompt: string,
  fileUrls: { url: string; mimeType: string }[]
) => {
  try {
    const contents: any[] = [];
    
    // Add text prompt
    contents.push({ text: prompt });

    // Download files from URLs and convert to base64 inlineData
    for (const file of fileUrls) {
      try {
        const response = await fetch(file.url);
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");
        
        contents.push({
          inlineData: {
            data: base64Data,
            mimeType: file.mimeType,
          },
        });
      } catch (err) {
        console.error("Gagal mendownload file dari Cloudinary untuk diteruskan ke Gemini:", err);
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temp for factual accuracy
      }
    });

    const resultText = response.text || "";

    // Parse actionable insights from the response text
    let actionableInsights = null;
    let explanationText = resultText;

    const jsonMatch = resultText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.actionable_insights) {
          actionableInsights = parsed.actionable_insights;
          // Hapus bagian JSON dari teks utama agar tidak muncul dua kali di UI
          explanationText = resultText.replace(/```json\s*\{[\s\S]*?\}\s*```/, "").trim();
        }
      } catch (e) {
        console.error("Gagal mem-parsing JSON dari response Gemini", e);
      }
    }

    return {
      explanation: explanationText,
      actionableInsights: actionableInsights,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Gagal menganalisis dokumen/pertanyaan dengan AI.");
  }
};
