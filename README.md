# Bitewise

**An AI-powered campus canteen platform.** Browse the live menu, check wait times, read what other students think of each dish, and let AI pick your next meal based on your mood.

> 🔗 **Live demo:** _add your link here_

![Bitewise screenshot](docs/screenshot.png)

---

## Features

- **Live menu**: dishes grouped by category with search, category filters and estimated wait times
- **Dish reviews**: every dish has its own review thread showing who posted and when
- **AI dish recommender**: describe your mood ("something spicy and filling") and Gemini suggests dishes from the current menu
- **"Most talked about"**: highlights the dishes with the most student activity
- **Authentication**: register and log in with JWT; passwords are hashed with bcrypt
- **Admin panel**: add new dishes, see overall stats and rank dishes by activity
- **Role-based access**: admin-only routes are protected on both the backend (middleware) and the frontend (route guard)
- **Responsive UI**: works on mobile, tablet and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router 7, Tailwind CSS 4 |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (hosted on Neon) |
| Auth | JSON Web Tokens, bcrypt |
| AI | Google Gemini 2.5 Flash |

## Architecture

```
React (Vite)  ──HTTP──▶  Express API  ──▶  PostgreSQL (Neon)
                              │
                              └──▶  Gemini API (server-side only)
```

The Gemini API key lives only on the backend. The frontend sends the user's mood to `POST /api/recommend`. The server loads the current menu from the database, builds the prompt, calls Gemini and returns the response. No API key ever reaches the browser.

## Project Structure

```
├── Backend
│   ├── controllers/      # route handlers (auth, menu, messages, analytics, recommend)
│   ├── db/               # PostgreSQL connection pool
│   ├── middleware/       # Authorization (JWT) and adminOnly
│   ├── routes/           # Express routers
│   ├── scripts/          # demo data seeding
│   ├── app.js
│   └── server.js
└── Frontend
    └── src
        ├── components/   # Navbar, AIRecommender, layout and UI primitives
        ├── context/      # AuthContext, MenuContext
        ├── lib/          # formatting helpers
        └── pages/        # Dashboard, DishChat, Admin, Chat, Login, Register
```

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local or a free [Neon](https://neon.tech) instance)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Create the database tables

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    password TEXT,
    role VARCHAR(50) DEFAULT 'user'
);

CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    wait_time INTEGER
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    dish_id INTEGER REFERENCES menu_items(id),
    user_id INTEGER REFERENCES users(id),
    text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

To make an account an admin, register it through the app and then run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

### 3. Set up the backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
PORT=3000
```

Start the server:

```bash
npm start
```

### 4. Set up the frontend

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### 5. (Optional) Load demo data

To fill the menu with sample reviews for local development:

```bash
cd Backend
npm run seed         # adds demo users and reviews
npm run seed:clean   # removes everything the seed script added
```

Demo accounts use a dedicated email domain and cannot be logged into, so they can be removed cleanly at any time.

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | none | Create an account |
| POST | `/api/auth/login` | none | Log in and receive a JWT |
| GET | `/api/dishes/getAllDishes` | none | All dishes with review counts |
| POST | `/api/dishes/addDish` | Admin | Add a dish `{ name, category, wait_time }` |
| GET | `/api/dishes/:dishId/getAllMessages` | none | Reviews for a dish, newest first |
| POST | `/api/dishes/:dishId/sendMessage` | User | Post a review `{ text }` |
| GET | `/api/analytics/top-dishes` | none | Top 5 dishes by number of reviews |
| GET | `/api/analytics/summary` | none | Total dishes, reviews and reviewers |
| POST | `/api/recommend` | none | AI recommendation `{ mood }` → `{ text }` |

Authenticated routes expect the header `Authorization: Bearer <token>`.

- Requests without a token get **401**.
- Non-admins calling admin routes get **403**.

## Security Notes

- Passwords are hashed with bcrypt and never stored in plain text
- The JWT carries the user's id, name and role; `adminOnly` middleware checks `role === 'admin'` after token verification
- The Gemini API key is kept server-side and never shipped to the client
- All SQL queries are parameterised to prevent SQL injection

## Future Improvements

- Star ratings alongside text reviews
- Real-time updates with WebSockets
- Live order queue and pickup notifications
- Persistent general chat
- Edit and delete dishes from the admin panel

## Author

**Kumar Tambe**: [GitHub](https://github.com/<your-username>) · [LinkedIn](https://linkedin.com/in/<your-profile>)
