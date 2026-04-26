export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { context } = req.body;
    
    // The API key is securely pulled from the hosting provider's environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'API key not configured on server' });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    try {
        const aiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: context }] }] })
        });
        
        const data = await aiResponse.json();
        res.status(200).json(data); // Send the Gemini response back to your chatbot.js
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: 'Failed to communicate with AI provider' });
    }
}
