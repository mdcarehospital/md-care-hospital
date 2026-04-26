export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { context } = req.body;
    
    // The API key is securely pulled from the hosting provider's environment variables
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

    if (!apiKey) return res.status(500).json({ error: 'API key not configured on server' });

    // Smart Check: Prevent accidental use of Firebase API Key
    if (apiKey === "AIzaSyBWp-8CEFAr2cSrcSHEZu7jnaUWUU9DHtY" || apiKey.includes("BWp-8CEFAr")) {
        return res.status(403).json({ error: { message: "You are using your Firebase API key! You must generate a dedicated Gemini API key from https://aistudio.google.com and update Vercel." } });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const aiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: context }] }] })
        });
        
        const data = await aiResponse.json();
        
        if (!aiResponse.ok) {
            // If Google says the model isn't found, the key lacks Generative AI permissions.
            if (aiResponse.status === 404) {
                data.error = data.error || {};
                data.error.message = "API Key Error: The project associated with this key does not have Gemini enabled. Please go to Google AI Studio -> Create API Key -> and explicitly select 'Create API key in NEW project' (do not reuse your Firebase project).";
            }
            return res.status(aiResponse.status).json(data);
        }
        
        res.status(200).json(data);
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: 'Failed to communicate with AI provider' });
    }
}
