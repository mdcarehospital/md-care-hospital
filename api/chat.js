export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing in Vercel.' });
    }

    if (apiKey.startsWith("AIzaSyBWp")) {
        return res.status(400).json({ error: 'You pasted your Firebase API Key into Vercel! Please go to aistudio.google.com to get a Gemini key.' });
    }

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: context }] }] })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch from Gemini API');
        }
        
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
        res.status(200).json({ reply });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
