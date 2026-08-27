import { GoogleGenAI } from "@google/genai";

export const generateStudentReply = async (studentComment: string, courseContext: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.warn("EduClean: API Key is missing. AI features are disabled.");
      return "Peço desculpas, mas não consigo gerar uma resposta no momento. Por favor, contate o professor diretamente.";
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Você é um assistente de professor útil, encorajador e claro.
      Contexto: O aluno está fazendo uma pergunta sobre o curso: "${courseContext}".
      Pergunta do Aluno: "${studentComment}"
      
      Tarefa: Escreva uma resposta concisa, didática e amigável (máximo de 2 frases) em Português do Brasil.
      Responda diretamente ao ponto do aluno.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, não consegui gerar uma resposta automática agora. Por favor, tente novamente.";
  }
};