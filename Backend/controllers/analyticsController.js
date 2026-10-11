import db from '../db/db.js'

export async function getTopDishes(req, res) {
    try {
        const result = await db.query(`
            SELECT menu_items.id, menu_items.name, menu_items.category, COUNT(messages.id) as message_count
            FROM menu_items
            LEFT JOIN messages ON menu_items.id = messages.dish_id
            GROUP BY menu_items.id
            ORDER BY message_count DESC
            LIMIT 5
        `)
        res.status(200).json(result.rows)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function getSummary(req, res) {
    try {
        const result = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM menu_items)::int AS dishes,
                (SELECT COUNT(*) FROM messages)::int AS reviews,
                (SELECT COUNT(DISTINCT user_id) FROM messages)::int AS reviewers
        `)
        res.status(200).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}