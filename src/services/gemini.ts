import { GoogleGenAI, ThinkingLevel, GenerateContentResponse } from "@google/genai";

// Try to initialize frontend SDK (works in this environment)
const frontendAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `You are 'JEE Dost', an expert IIT-JEE tutor who is professional yet relatable. 
    
    ### CRITICAL INSTRUCTIONS:
    1. **Language Balance:** Use English for all core concepts, steps, and technical explanations. Use Hindi ONLY as a 'sidekick'—brief, punchy phrases to grab attention or encourage the student (e.g., "Samjhe?", "Makkhan logic!", "Calculation alert!").
    2. **Informative & Professional:** The answer must be high-quality and informative. Maintain an expert tone for the technical parts.
    3. **Attention Grabbing:** Use bold text, bullet points, and clear headings to make the answer easy to scan.
    4. **Math Formatting:** Use $...$ for inline math and $$...$$ for block math.
    5. **No Repetition:** Do not repeat the question. Focus entirely on the solution.
    
    Format your response in Markdown:
    
    # 🎯 {Solution Title}
    A brief, professional opening in English, followed by a punchy Hindi sidekick phrase.
    
    ## 💡 Core Concept
    Explain the underlying principle clearly in English. Add a tiny bit of relatable Hindi text as a sidekick (e.g., "Isse darna mana hai!").
    
    ## 📝 Detailed Steps
    Provide a logical, numbered solution in English. Each step should be concise.
    
    ## 🚀 Expert Tip
    One powerful shortcut or common pitfall to avoid (in English).
    
    ## 🧠 Samjhe Kya?
    A very brief, high-impact summary in Hindi. Keep it to 1-2 punchy sentences that capture the 'soul' of the problem. Make it extremely useful for quick revision.`;

export async function solveQuestion(
  imageData: string | null, 
  mimeType: string | null, 
  textPrompt: string, 
  subject: string = "General",
  isFollowUp: boolean = false,
  onChunk?: (chunk: string) => void
) {
  const parts: any[] = [];

  if (imageData && mimeType) {
    parts.push({
      inlineData: {
        data: imageData.split(",")[1],
        mimeType: mimeType,
      },
    });
  }

  parts.push({
    text: `Subject: ${subject}. Question/Context: "${textPrompt}"
    ${isFollowUp ? "This is a follow-up doubt. Be even clearer and more encouraging." : ""}`,
  });

  const config = {
    systemInstruction: SYSTEM_INSTRUCTION,
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.LOW
    }
  };

  // Try frontend call first (streaming supported)
  try {
    if (onChunk) {
      const stream = await frontendAi.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: [{ parts }],
        config
      });

      let fullText = "";
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          onChunk(text);
        }
      }
      return fullText;
    } else {
      const response = await frontendAi.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts }],
        config
      });
      return response.text;
    }
  } catch (error) {
    console.warn("Frontend Gemini call failed, falling back to backend proxy...", error);
    
    // FALLBACK: Use the backend proxy (for Vercel-like deployments where API key is hidden)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts }],
        config
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    // Extract text from the response structure
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (onChunk && text) onChunk(text);
    return text;
  }
}

export async function solveFollowUp(
  originalQuestion: string,
  previousSolution: string,
  followUpQuery: string,
  subject: string = "General",
  onChunk?: (chunk: string) => void
) {
  const prompt = `
    The student has a doubt about a previous solution.
    
    ORIGINAL QUESTION: ${originalQuestion}
    PREVIOUS SOLUTION: ${previousSolution}
    STUDENT'S DOUBT: ${followUpQuery}
    
    Explain it even more simply, like you are talking to a younger sibling. Use very basic analogies and more Hindi humor to clear the doubt. Make it 'ez'!
  `;
  
  return solveQuestion(null, null, prompt, subject, true, onChunk);
}

// User's requested simplified function
export const askGemini = async (question: string) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
};
