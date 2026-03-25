export default async function handler(req, res) {
  const { question, contents, config } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not set in environment variables." });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: contents || [{ parts: [{ text: question }] }],
        generationConfig: config || {}
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    res.status(500).json({ error: "Vault Error" });
  }
}
