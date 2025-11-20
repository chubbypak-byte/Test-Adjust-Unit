import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisInput, AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeMeterData = async (input: AnalysisInput): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found. Please set process.env.API_KEY");
  }

  // Use Gemini 3.0 Pro Preview for best reasoning capabilities
  const modelId = "gemini-3-pro-preview";

  const prompt = `
    บทบาท: คุณคือนักสถิติและวิศวกรไฟฟ้าผู้เชี่ยวชาญระดับโลก (World-Class Statistician & Electrical Engineer) ที่มีความเชี่ยวชาญด้านการวิเคราะห์ข้อมูลมิเตอร์ไฟฟ้า (Meter Data Analysis) และการตรวจสอบความผิดปกติ (Anomaly Detection)
    
    ภารกิจ: วิเคราะห์ข้อมูลเพื่อหาระยะเวลาว่า "มิเตอร์/อุปกรณ์ประกอบ เริ่มชำรุดตั้งแต่เดือนใด" โดยใช้ตรรกะทางวิศวกรรมและสถิติขั้นสูง
    
    ข้อมูลที่ได้รับ:
    1. สาเหตุการชำรุดที่พบจริง: "${input.cause}" (นี่คือ Ground Truth ว่าชำรุดจริง)
    2. วันที่ตรวจพบ (Discovery Date): ${input.discoveryDate}
    3. วันที่แก้ไข/สับเปลี่ยน (Fix Date): ${input.fixDate} (หลังจากวันนี้ข้อมูลจะกลับมาปกติ)
    4. ข้อมูลเพิ่มเติม: ${input.additionalInfo}
    5. ข้อมูลการใช้ไฟฟ้า (Electricity Data): ${JSON.stringify(input.electricityData.slice(0, 60))} (ตัดมาบางส่วนเพื่อวิเคราะห์แนวโน้ม)
    6. ข้อมูลผลผลิต (Production Data): ${JSON.stringify(input.productionData.slice(0, 60))} (ตัวแปรตาม)

    กระบวนการคิด (Chain of Thought):
    1. พิจารณาความสัมพันธ์ระหว่าง "หน่วยการใช้ไฟฟ้า" กับ "ผลผลิต" ในช่วงเวลาปกติ
    2. ตรวจสอบช่วงเวลาที่ความสัมพันธ์นี้เริ่มผิดเพี้ยน (Divergence Point) เช่น ผลผลิตเท่าเดิมแต่ไฟใช้น้อยลง (Drop) หรือแกว่งตัวผิดปกติ (Erratic)
    3. วิเคราะห์ย้อนหลังจากวันที่ตรวจพบ (Discovery Date) กลับไปหาจุดเริ่มต้น
    4. ประเมินความสอดคล้องกับ "สาเหตุการชำรุด" (เช่น ถ้าเฟืองรูด ค่าอาจจะค่อยๆ ลดหรือหายไปเลย)

    ข้อกำหนดการตอบ:
    - ต้องระบุ "เดือน/ปี" ที่เริ่มชำรุดให้ชัดเจนที่สุด
    - เหตุผลต้องเขียนเป็นข้อๆ (Bullet points) อ่านง่าย เข้าใจง่าย ไม่ซับซ้อน
    - ประเมินความมั่นใจเป็น % โดยอิงจากความชัดเจนของ Pattern ข้อมูล

    รูปแบบ Output (JSON):
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        // Enable thinking for maximum accuracy on complex reasoning tasks
        thinkingConfig: { thinkingBudget: 16000 }, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            failureStartMonth: { type: Type.STRING, description: "เดือนปีที่เริ่มชำรุด เช่น '05/2023'" },
            confidenceScore: { type: Type.NUMBER, description: "ค่าความเชื่อมั่น 0-100" },
            reasoning: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "เหตุผลการวิเคราะห์ เขียนเป็นข้อๆ สั้นกระชับ อ่านง่าย"
            },
            anomalyType: { 
              type: Type.STRING, 
              enum: ["DROP", "SPIKE", "ERRATIC", "NORMAL"],
              description: "ลักษณะความผิดปกติ"
            },
            summary: { type: Type.STRING, description: "บทสรุปผู้บริหาร เน้นช่วงเวลาและสาเหตุ" }
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