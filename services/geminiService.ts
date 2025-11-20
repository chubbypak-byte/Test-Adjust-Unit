import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisInput, AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeMeterData = async (input: AnalysisInput): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found. Please set process.env.API_KEY");
  }

  const modelId = "gemini-2.5-flash";

  const prompt = `
    บทบาท: คุณคือนักสถิติและวิศวกรไฟฟ้าผู้เชี่ยวชาญระดับโลก หน้าที่ของคุณคือวิเคราะห์ข้อมูลเพื่อหา "จุดเริ่มต้นของการชำรุดของมิเตอร์ไฟฟ้า" (Failure Onset Detection)
    
    ข้อมูลที่ได้รับ:
    1. สาเหตุการชำรุด: ${input.cause}
    2. วันที่ตรวจพบ (Discovery Date): ${input.discoveryDate}
    3. วันที่แก้ไข (Fix Date): ${input.fixDate}
    4. ข้อมูลเพิ่มเติม: ${input.additionalInfo}
    5. ข้อมูลการใช้ไฟฟ้า (Electricity Data): ${JSON.stringify(input.electricityData.slice(0, 50))} (ตัวอย่าง 50 แถวแรก)
    6. ข้อมูลผลผลิต (Production Data): ${JSON.stringify(input.productionData.slice(0, 50))} (ตัวอย่าง 50 แถวแรก)

    งานของคุณ:
    วิเคราะห์หาเดือนที่มิเตอร์เริ่มทำงานผิดปกติ โดยเปรียบเทียบแนวโน้มการใช้ไฟฟ้า (Usage) กับ ผลผลิต (Production) 
    ปกติแล้ว Usage ควรแปรผันตรงกับ Production หาก Usage ตกลงหรือแกว่งผิดปกติโดยที่ Production ยังคงเดิม หรือ Usage เปลี่ยนแปลงในลักษณะที่ไม่สอดคล้องกับประวัติ ให้ถือว่าเป็นจุดเริ่มชำรุด โดยต้องพิจารณาย้อนหลังจากวันที่ตรวจพบ

    รูปแบบการตอบกลับ (Response):
    ตอบกลับเป็น JSON Object ตาม Schema นี้เท่านั้น
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            failureStartMonth: { type: Type.STRING, description: "เดือนปีที่เริ่มชำรุด เช่น '05/2023'" },
            confidenceScore: { type: Type.NUMBER, description: "ค่าความเชื่อมั่น 0-100" },
            reasoning: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "รายการเหตุผลวิเคราะห์ เป็นข้อๆ เข้าใจง่าย ภาษาไทย"
            },
            anomalyType: { 
              type: Type.STRING, 
              enum: ["DROP", "SPIKE", "ERRATIC", "NORMAL"],
              description: "ลักษณะความผิดปกติ"
            },
            summary: { type: Type.STRING, description: "บทสรุปสั้นๆ สำหรับผู้บริหาร" }
          },
          required: ["failureStartMonth", "confidenceScore", "reasoning", "anomalyType", "summary"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
