import db from '../db/db.js'

export async function getAllDishes(req, res) {
    const result = await db.query(`
        SELECT menu_items.*, COUNT(messages.id)::int AS review_count
        FROM menu_items
        LEFT JOIN messages ON menu_items.id = messages.dish_id
        GROUP BY menu_items.id
        ORDER BY menu_items.id
    `);
    res.status(200).json(result.rows)
}

export async function addDish(req, res) {
    if (!req.body.name || !req.body.category || !req.body.wait_time) {
        return res.status(400).json({ message: "Incomplete info" })
    } else {
        const result = await db.query(`INSERT INTO menu_items(name,category,wait_time) VALUES($1,$2,$3) RETURNING *`, [req.body.name, req.body.category, req.body.wait_time])
        return res.status(201).json({ ...result.rows[0], review_count: 0 })
    }
}
