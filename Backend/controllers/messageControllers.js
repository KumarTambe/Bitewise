import db from '../db/db.js'

export async function getAllMessages(req, res) {
    const dish = req.params.dishId
    const result = await db.query(`
        SELECT messages.id, messages.dish_id, messages.user_id, messages.text, messages.created_at, users.name AS user_name
        FROM messages
        LEFT JOIN users ON users.id = messages.user_id
        WHERE messages.dish_id = $1
        ORDER BY messages.created_at DESC
    `, [dish]);
    res.status(200).json(result.rows);
}

export async function sendMessage(req, res) {
    const dish = req.params.dishId
    const user = req.user.id
    const text = req.body.text
    if (!dish || !user || !text) {
        return res.status(400).json({ message: "Bad request" })
    } else {
        const result = await db.query(`INSERT INTO messages(dish_id,user_id,text) VALUES($1,$2,$3)`, [dish, user, text])
        return res.status(201).json({ message: "Message added successfully" })
    }
}