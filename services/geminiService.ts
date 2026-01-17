
import { GoogleGenAI, Type } from "@google/genai";
import { GameStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getTeacherFeedback = async (stats: GameStats, levelTitle: string) => {
  try {
    const prompt = `Sebagai seorang guru SD yang ramah dan suportif, berikan feedback singkat (maksimal 3 kalimat) untuk siswa yang baru saja menyelesaikan level mengetik "${levelTitle}" dengan statistik berikut: WPM: ${stats.wpm}, Akurasi: ${stats.accuracy}%, Salah Ketik: ${stats.errorCount}, Waktu: ${stats.timeInSeconds} detik. Gunakan bahasa Indonesia yang memotivasi anak-anak.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "Wah, hebat sekali semangat belajarmu hari ini! Terus berlatih ya agar semakin jago mengetik!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Luar biasa! Kamu sudah menyelesaikan tantangan ini dengan penuh semangat. Teruslah berlatih!";
  }
};
