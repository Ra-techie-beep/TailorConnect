const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini API key from .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function parseAadharText(ocrText) {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing");
    return { error: "API Key Missing" };
  }

  try {
    // Switching to 'gemini-2.5-flash' based on available models for this key
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Extract the following details from the Aadhar Card OCR text below.
      Return ONLY a valid JSON object with these keys: "name", "aadharNo", "address", "city".
      
      - "name": The person's full name. Ignore "Government of India" or similar headers.
      - "aadharNo": The 12-digit unique identification number. Format as "XXXX XXXX XXXX".
      - "address": The full address including street, landmark, state, and pin code.
      - "city": The city or district extracted from the address.

      OCR Text:
      """
      ${ocrText}
      """
    `;

    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Gemini Raw Response:", text);
    
    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini AI Parsing Error Full Details:", error);
    return { error: "AI Processing Failed", details: error.message };
  }
}

module.exports = { parseAadharText };
