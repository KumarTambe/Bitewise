import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MenuContext } from "../context/MenuContext";
import { AuthContext } from "../context/AuthContext";
import { Avatar, ChatIcon, ClockIcon, DishTile } from "../components/ui";
import { categoryStyle, timeAgo } from "../lib/format";


function DishChat() {
    const { id } = useParams();
    const { items, setItems } = useContext(MenuContext)
    const { user, isLoggedIn } = useContext(AuthContext)
    const [msg, setMsg] = useState('')
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    async function fetchMessages() {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dishes/${id}/getAllMessages`)
        if (!response.ok) throw new Error("We ran into an error while fetching")
        return response.json()
    }

    async function getMessages() {
        try {
            setMessages(await fetchMessages())
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        let ignore = false
        fetchMessages()
            .then(data => { if (!ignore) setMessages(data) })
            .catch(err => console.log(err))
            .finally(() => { if (!ignore) setLoading(false) })
        return () => { ignore = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const dish = items.find(item => item.id === Number(id))
    const style = categoryStyle(dish?.category)
    const reviewers = new Set(messages.map(m => m.user_id)).size

    async function handleSubmit(e) {
        e.preventDefault()
        if (!msg.trim() || sending) return
        setSending(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dishes/${id}/sendMessage`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ text: msg })
            })
            if (response.ok) {
                setMsg('')
                getMessages()
                setItems(items.map(item => item.id === Number(id) ? { ...item, review_count: (item.review_count ?? 0) + 1 } : item))
            }
        } catch (err) {
            console.log(err)
        }
        setSending(false)
    }

    return (
        <div className="min-h-screen px-4 sm:px-6 py-8 page-fade-in">
            <div className="max-w-3xl mx-auto">
                <Link to='/dashboard' className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to menu
                </Link>

                <header className="card p-6 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    <DishTile name={dish?.name ?? ''} category={dish?.category} size="h-20 w-20 text-3xl" />
                    <div className="flex-1 min-w-0">
                        <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-2">{dish ? dish.name : 'Dish'}</h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                            {dish && <span className={`chip ${style.bg} ${style.text}`}>{dish.category}</span>}
                            {dish && <span className="flex items-center gap-1.5"><ClockIcon /> {dish.wait_time} min wait</span>}
                            <span className="flex items-center gap-1.5"><ChatIcon /> {messages.length} reviews from {reviewers} {reviewers === 1 ? 'student' : 'students'}</span>
                        </div>
                    </div>
                </header>

                {isLoggedIn ? (
                    <form onSubmit={handleSubmit} className="card p-4 mb-6 flex items-start gap-3">
                        <Avatar name={user ?? 'You'} />
                        <div className="flex-1 flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder={`What did you think of the ${dish?.name ?? 'dish'}?`}
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                className="input"
                            />
                            <button type="submit" disabled={sending || !msg.trim()} className="btn btn-primary shrink-0">
                                {sending ? 'Posting…' : 'Post review'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="card p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-ink-soft">Log in to share your take on this dish.</p>
                        <Link to='/login' className="btn btn-dark">Log in</Link>
                    </div>
                )}

                <section className="card divide-y divide-line">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-5 flex gap-3">
                                <div className="h-9 w-9 skeleton !rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-3 w-1/4 skeleton mb-2"></div>
                                    <div className="h-3 w-3/4 skeleton"></div>
                                </div>
                            </div>
                        ))
                    ) : messages.length === 0 ? (
                        <div className="text-center py-14 px-6">
                            <p className="font-display text-xl font-semibold mb-1">No reviews yet</p>
                            <p className="text-muted text-sm">Be the first to say something about this dish.</p>
                        </div>
                    ) : (
                        messages.map(message => (
                            <article key={message.id} className="p-5 flex gap-3">
                                <Avatar name={message.user_name ?? `User ${message.user_id}`} />
                                <div className="min-w-0">
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                        <span className="font-semibold text-sm">{message.user_name ?? `User ${message.user_id}`}</span>
                                        {message.created_at && <span className="text-xs text-muted">{timeAgo(message.created_at)}</span>}
                                    </div>
                                    <p className="text-ink-soft break-words">{message.text}</p>
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </div>
        </div>
    )
}

export default DishChat;
