// Seeds demo reviewers and reviews so the menu has activity to show.
//   node scripts/seedReviews.js          -> add seed users + reviews
//   node scripts/seedReviews.js --clean  -> remove everything this script added
// Seeded users all use the SEED_DOMAIN email domain and have an unusable password.
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import db from '../db/db.js'

const SEED_DOMAIN = 'seed.bitewise.local'
const USER_COUNT = 78
const REVIEW_COUNT = 250
const DAYS_BACK = 45

// deterministic PRNG so re-running produces the same data
let seed = 20261011
function rand() {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

const firstNames = ['Aarav', 'Aditi', 'Aditya', 'Ananya', 'Arjun', 'Ishita', 'Rohan', 'Sneha', 'Kunal', 'Pooja', 'Siddharth', 'Neha', 'Varun', 'Riya', 'Omkar', 'Tanvi', 'Yash', 'Shreya', 'Pranav', 'Kavya', 'Harsh', 'Sakshi', 'Nikhil', 'Mrunal', 'Atharva', 'Gauri', 'Soham', 'Vaishnavi', 'Rahul', 'Prachi', 'Manas', 'Isha', 'Tejas', 'Anushka', 'Kartik', 'Diya', 'Vedant', 'Simran', 'Aniket', 'Rutuja', 'Abhishek', 'Komal', 'Sahil', 'Nidhi', 'Chinmay', 'Aishwarya', 'Mihir', 'Shruti', 'Parth', 'Janhavi', 'Rishi', 'Bhakti', 'Dhruv', 'Sanika', 'Ayush', 'Mansi', 'Kshitij', 'Radhika', 'Hrishikesh', 'Pallavi', 'Faizan', 'Zoya', 'Aman', 'Fatima', 'Jay', 'Nupur', 'Rehan', 'Swara', 'Akash', 'Divya', 'Sarthak', 'Esha', 'Kabir', 'Mitali', 'Neel', 'Avani', 'Shubham', 'Tanaya']
const lastNames = ['Patil', 'Deshmukh', 'Kulkarni', 'Joshi', 'Shinde', 'Pawar', 'Jadhav', 'Sharma', 'Iyer', 'Nair', 'Mehta', 'Shah', 'Gupta', 'Rao', 'More', 'Gaikwad', 'Chavan', 'Sawant', 'Khan', 'Shaikh', 'Bhosale', 'Naik', 'Desai', 'Pillai', 'Verma', 'Singh', 'Kamat', 'Thakur', 'Mishra', 'Bhatt']

const dishReviews = {
    'Vada Pav': ['Best vada pav on campus, the dry garlic chutney is the real hero', 'Vada was a bit cold today but still worth 15 rs', 'Grabbed two between lectures, saved my morning', 'Chutney ratio was perfect today', 'Pav was slightly stale around 4pm, go before lunch', 'Honestly better than the stall outside the gate', 'Fried green chilli on the side would make it 10/10', 'Consistent every single day, never disappoints', 'Queue at 1pm is crazy but moves fast', 'Ask for extra chutney, they give it happily', 'Vada was crispy and hot, came straight out of the kadhai', 'Too much oil today ngl'],
    'Misal Pav': ['Tarri was proper spicy, eyes watering but worth it', 'Wish they gave one more pav with it', 'Farsan was soggy today, add it at the end please', 'Decent misal but not Kolhapuri level', 'Perfect before an 8am lab', 'Spice level has gone down this week?', 'Good portion for the price', 'Add a little lemon and it is perfect', 'Ran out by 10:30, come early', 'Usal had a nice depth today'],
    'Thali': ['Value for money, the dal and sabzi were both good', 'Rotis were hard today, rice was fine', 'Sweet on Fridays is a nice touch', 'Sabzi repeats too often, need more variety', 'Filling enough to skip dinner honestly', 'Dal was watery today', 'Paneer sabzi day is the best day', 'Unlimited rice would be a game changer', 'Good home-style food, not too oily', 'Took 20 min during lunch rush but tasted great'],
    'Poha': ['Light and fresh, good start to the day', 'Needs more peanuts and a lemon wedge', 'Sev on top makes all the difference', 'Bit dry today', 'Cheap and quick, my daily breakfast', 'Slightly too much turmeric this morning', 'Perfect with a cutting chai', 'Served hot, onions were crunchy'],
    'Upma': ['Underrated, soft and well tempered', 'Too bland for me, needs chutney', 'Good if you want something light', 'Had lumps today, otherwise fine', 'Coconut chutney with it would be great', 'Surprisingly good, will order again', 'Portion is small for the price'],
    'Samosa': ['Crispy outer layer, aloo filling well spiced', 'Samosa with chai at 4pm is a ritual', 'Was cold, ask them to reheat', 'Green chutney is too watery', 'Big size, one is enough for a snack', 'Filling had peas today, nice change', 'Bit oily but tasty', 'Get the samosa pav combo, thank me later'],
    'Pav Bhaji': ['Butter was generous, bhaji was rich', 'Bhaji was more tomato than veggies today', 'Extra pav costs too much', 'Best thing on the evening menu', 'Wait was long but the taste made up for it', 'Needed more onion and lemon on the side', 'Tastes like street style, really good', 'Slightly too salty today'],
    'Dal Rice': ['Simple and comforting, like ghar ka khana', 'Dal tadka was flavourful today', 'Rice was overcooked', 'Go to when the stomach is not feeling great', 'Add a papad and it is perfect', 'Portion is decent for the price', 'Jeera tadka smelled amazing'],
    'Rajma Chawal': ['Rajma was cooked perfectly, really soft', 'Gravy could be thicker', 'Tastes just like home on a Sunday', 'Huge portion, could not finish', 'Needed a bit more salt', 'Best lunch item on the menu imo', 'Onion salad on the side would be nice', 'Wednesday rajma is a must'],
    'Chole Bhature': ['Bhature were fluffy and huge', 'Heavy for breakfast but no regrets', 'Chole were too spicy for me', 'Pickle and onion on the side was perfect', 'Bhatura was oily today', 'Weekend special vibes on a weekday', 'Takes a while but worth the wait', 'Wish they had a half plate option'],
    'Maggi': ['Midnight study fuel', 'Masala maggi with extra veggies is the move', 'Too watery today', 'They added cheese on request, so good', 'Price went up again', 'Cooked exactly right, not mushy', 'Add an egg, it is worth the extra', 'Comfort food after a bad exam'],
    'Cold Coffee': ['Thick and creamy, not too sweet', 'Way too much sugar today', 'Ask for it without ice cream if you want it lighter', 'Perfect in this heat', 'Needs more coffee, tastes like milk', 'Best cold coffee near campus', 'Glass size feels smaller lately', 'Ordered it before every exam this sem'],
    'Masala Chai': ['Adrak was strong, exactly how I like it', 'Cutting chai for 10 rs, unbeatable', 'Too sweet, ask for less sugar', 'Chai break with friends is the best part of the day', 'Elaichi flavour today was great', 'Was lukewarm in the afternoon', 'Better than any cafe chai', 'Third one of the day, no regrets'],
    'Fresh Lime Soda': ['Sweet and salted mix is perfect', 'Very refreshing after the walk from hostel', 'Less fizz today', 'Nice and tangy', 'Best drink in summer', 'Bit too sour, needed more sugar', 'Quick and cheap, love it'],
    'Lassi': ['Thick sweet lassi with malai on top', 'Not chilled enough', 'Salted lassi option please', 'Great after a spicy lunch', 'Generous glass size', 'Too sweet for my taste', 'Mango lassi would be a great addition'],
    'Paneer Sandwich': ['Paneer was well seasoned and grilled nicely', 'Bread was a bit burnt', 'Healthy-ish option that actually tastes good', 'Needs more paneer filling', 'Green chutney inside was great', 'Good for a quick lunch between labs', 'Cheese add-on is totally worth it'],
    'Bread Omelette': ['Fluffy omelette, loved the green chillies', 'Bread was not toasted enough', 'Protein for gym folks, solid choice', 'Ask for double egg', 'Quick and filling breakfast', 'Ketchup ran out today', 'Masala was just right'],
    'Fried Rice': ['Generous veggies, good wok flavour', 'Bit bland, needed more soy', 'Pair it with noodles for a half and half', 'Too oily today', 'Schezwan version is better', 'Portion is big enough to share', 'Rice was sticky today'],
    'Noodles': ['Hakka noodles were spot on', 'Schezwan noodles are fire', 'Too much vinegar today', 'Came out quickly even during rush', 'Veggies were barely there', 'Good evening snack with friends', 'Ask for extra chilli sauce'],
    'Ice Cream': ['Chocolate scoop was creamy', 'Limited flavours, need more options', 'Perfect after a long practical', 'Slightly melted today', 'Kulfi option would be great', 'Cheap treat, always worth it', 'Butterscotch is the best one']
}

const genericReviews = ['Good for the price', 'Tasty as always', 'Could be better honestly', 'Quick service today', 'Took longer than the wait time shown', 'Would recommend to juniors', 'Not bad, not great', 'Exactly what I needed after class', 'Staff were friendly and quick', 'Quality has improved this month', 'A bit inconsistent day to day', 'Solid 4/5', 'Solid 3/5, okayish', 'My go-to order', 'Tried it for the first time, liked it', 'Ordering again tomorrow', 'Overhyped imo', 'Fresh and hot today', 'Portion felt smaller today', 'Hygiene looked good at the counter']

// heavier weight -> more reviews; every dish gets a baseline
const popularity = { 'Vada Pav': 3, 'Masala Chai': 3, 'Pav Bhaji': 2.5, 'Misal Pav': 2.2, 'Cold Coffee': 2.2, 'Maggi': 2, 'Samosa': 2, 'Thali': 2, 'Chole Bhature': 1.6, 'Rajma Chawal': 1.5 }

function randomTimestamp() {
    const d = new Date()
    d.setDate(d.getDate() - Math.floor(rand() * DAYS_BACK))
    // canteen hours, local time 8:00 - 20:00 with lunch peak
    const hour = rand() < 0.4 ? 12 + Math.floor(rand() * 3) : 8 + Math.floor(rand() * 12)
    d.setHours(hour, Math.floor(rand() * 60), Math.floor(rand() * 60), 0)
    if (d > new Date()) d.setDate(d.getDate() - 1)
    return d
}

async function clean() {
    const users = await db.query(`SELECT id FROM users WHERE email LIKE $1`, [`%@${SEED_DOMAIN}`])
    const ids = users.rows.map(r => r.id)
    if (ids.length) {
        const msgs = await db.query(`DELETE FROM messages WHERE user_id = ANY($1)`, [ids])
        await db.query(`DELETE FROM users WHERE id = ANY($1)`, [ids])
        console.log(`Removed ${msgs.rowCount} reviews and ${ids.length} seed users`)
    } else {
        console.log('No seed data found')
    }
}

async function seedData() {
    const existing = await db.query(`SELECT COUNT(*)::int AS n FROM users WHERE email LIKE $1`, [`%@${SEED_DOMAIN}`])
    if (existing.rows[0].n > 0) {
        console.log('Seed data already exists. Run with --clean first to reseed.')
        return
    }

    const dishes = (await db.query(`SELECT id, name FROM menu_items ORDER BY id`)).rows
    if (!dishes.length) throw new Error('No dishes in menu_items')

    // users: unusable random password, one hash shared to keep seeding fast
    const unusableHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
    const names = new Set()
    while (names.size < USER_COUNT) names.add(`${pick(firstNames)} ${pick(lastNames)}`)

    // build every review first so a failure leaves nothing half-inserted
    const weights = dishes.map(d => popularity[d.name] ?? 1)
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    const perDish = weights.map(w => Math.max(4, Math.round((w / totalWeight) * REVIEW_COUNT)))
    let diff = REVIEW_COUNT - perDish.reduce((a, b) => a + b, 0)
    while (diff !== 0) {
        const i = Math.floor(rand() * perDish.length)
        if (diff > 0) { perDish[i]++; diff-- } else if (perDish[i] > 4) { perDish[i]--; diff++ }
    }

    const client = await db.connect()
    try {
        await client.query('BEGIN')
        const userIds = []
        for (const name of names) {
            const email = `${name.toLowerCase().replace(' ', '.')}${Math.floor(rand() * 90 + 10)}@${SEED_DOMAIN}`
            const r = await client.query(`INSERT INTO users(email,name,password,role) VALUES($1,$2,$3,'user') RETURNING id`, [email, name, unusableHash])
            userIds.push(r.rows[0].id)
        }
        // some people review a lot, most only a few times
        const activeUsers = userIds.slice(0, 18)

        const rows = []
        dishes.forEach((dish, i) => {
            const specific = shuffle(dishReviews[dish.name] ?? [])
            const generic = shuffle(genericReviews)
            const pool = [...specific, ...generic]
            for (let k = 0; k < perDish[i]; k++) {
                const text = pool[k % pool.length]
                const userId = rand() < 0.45 ? pick(activeUsers) : pick(userIds)
                rows.push([dish.id, userId, text, randomTimestamp()])
            }
        })

        for (const [dishId, userId, text, createdAt] of rows) {
            await client.query(`INSERT INTO messages(dish_id,user_id,text,created_at) VALUES($1,$2,$3,$4)`, [dishId, userId, text, createdAt])
        }
        await client.query('COMMIT')
        const reviewers = new Set(rows.map(r => r[1])).size
        console.log(`Added ${userIds.length} users and ${rows.length} reviews (${reviewers} distinct reviewers) across ${dishes.length} dishes`)
    } catch (err) {
        await client.query('ROLLBACK')
        throw err
    } finally {
        client.release()
    }
}

try {
    if (process.argv.includes('--clean')) await clean()
    else await seedData()
} finally {
    await db.end()
}
