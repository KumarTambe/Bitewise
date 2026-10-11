import db from '../db/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function Register(req, res) {
    const email = req.body.email
    if (!email) {
        res.status(404).json({ message: "Email not found" })
    } else {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
        if (result.rows.length > 0) {
            res.status(400).json({ message: "User already exists" })
        } else {
            const password = req.body.password;
            const hashedPass = await bcrypt.hash(password, 10)
            const DBresult = await db.query(`INSERT INTO users(email,name,password) VALUES($1,$2,$3) RETURNING *;`, [email, req.body.name, hashedPass])
            const newUser = DBresult.rows[0]
            const token = jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name }, process.env.JWT_SECRET)
            res.status(201).json({ message: "User created sucessfully", token })
        }
    }
}

export async function Login(req, res) {
    const email = req.body.email
    const password = req.body.password
    if (!email || !password) {
        res.status(404).json({ message: "Enter all details" })
    } else {
        const result = await db.query(`SELECT * FROM users WHERE email= $1;`, [email])
        if (result.rows.length == 0) {
            res.status(404).json({ message: "User not found" })
        } else {
            const isMatch = await bcrypt.compare(password, result.rows[0].password)
            if (!isMatch) {
                res.status(401).json({ message: "Wrong password" })
            } else {
                const token = jwt.sign({ id: result.rows[0].id, role: result.rows[0].role, name: result.rows[0].name }, process.env.JWT_SECRET)
                res.status(200).json({ message: "Login successful", token, role: result.rows[0].role, name: result.rows[0].name })
            }
        }
    }
}