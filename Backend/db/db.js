import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

console.log({ HAS_DATABASE_URL: !!process.env.DATABASE_URL })

const { Pool } = pg

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

export default db