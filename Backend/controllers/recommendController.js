import db from '../db/db.js'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

export async function recommend(req, res) {
    const mood = req.body?.mood?.trim()
    if (!mood) {
        return res.status(400).json({ message: "Mood is required" })
    }
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: "GEMINI_API_KEY is not configured" })
    }
    try {
        const result = await db.query(`SELECT name FROM menu_items ORDER BY name`)
        const dishes = result.rows.map(row => row.name).join(', ')

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Here are the available dishes: ${dishes}. The user is in the mood for: ${mood}. Recommend 1-2 dishes and explain why.`
                    }]
                }]
            })
        })
        const data = await response.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!response.ok || !text) {
            return res.status(502).json({ message: "Could not get a recommendation" })
        }
        res.status(200).json({ text })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
