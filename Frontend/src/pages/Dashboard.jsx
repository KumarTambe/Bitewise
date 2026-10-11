import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { MenuContext } from "../context/MenuContext";
import AIRecommender from "../components/AIRecommender"
import { Link } from "react-router-dom";
import { ChatIcon, ClockIcon, DishTile } from "../components/ui";
import { categoryStyle } from "../lib/format";

function greeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

function DishCardSkeleton() {
    return (
        <div className="card p-5 flex gap-4">
            <div className="h-14 w-14 skeleton !rounded-2xl"></div>
            <div className="flex-1">
                <div className="h-4 w-2/3 skeleton mb-3"></div>
                <div className="h-3 w-1/3 skeleton"></div>
            </div>
        </div>
    )
}

function DishCard({ item }) {
    const style = categoryStyle(item.category)
    return (
        <Link
            to={`/dish/${item.id}`}
            className="card p-5 flex flex-col gap-4 transition hover:border-ink/30 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ink"
        >
            <div className="flex items-start gap-4">
                <DishTile name={item.name} category={item.category} />
                <div className="min-w-0">
                    <h3 className="font-semibold text-lg leading-snug truncate">{item.name}</h3>
                    <span className={`chip mt-1 ${style.bg} ${style.text}`}>{item.category}</span>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted border-t border-line pt-3">
                <span className="flex items-center gap-1.5"><ClockIcon /> {item.wait_time} min</span>
                <span className="flex items-center gap-1.5"><ChatIcon /> {item.review_count ?? 0} {Number(item.review_count) === 1 ? 'review' : 'reviews'}</span>
            </div>
        </Link>
    )
}

function Dashboard() {
    const { user } = useContext(AuthContext)
    const { items } = useContext(MenuContext);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')
    const [summary, setSummary] = useState(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/summary`)
            .then(res => res.ok ? res.json() : null)
            .then(data => setSummary(data))
            .catch(err => console.log(err))
    }, [])

    // get unique categories so that we can display items category wise
    const categories = [...new Set(items.map((item) => item.category))]

    // filter items acc. to the search term and selected category
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        (activeCategory === 'All' || item.category === activeCategory)
    )

    const popular = [...items].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0)).slice(0, 3)

    return (
        <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-12 page-fade-in">
            <div className="max-w-6xl mx-auto">

                <section className="grid lg:grid-cols-5 gap-6 mb-12">
                    <div className="lg:col-span-3 flex flex-col justify-center">
                        <p className="eyebrow mb-3">{greeting()}{user ? `, ${user.split(' ')[0]}` : ''}</p>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] mb-5">
                            What are you <span className="italic text-tomato">craving</span> today?
                        </h1>
                        <p className="text-ink-soft text-lg mb-7 max-w-xl">
                            Browse the campus canteen menu, check wait times, and see what other students are saying before you queue.
                        </p>

                        <div className="relative max-w-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search vada pav, chai, thali…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input !pl-11 !rounded-full !py-3.5"
                            />
                        </div>

                        {summary && (
                            <dl className="flex flex-wrap gap-x-8 gap-y-3 mt-8">
                                {[
                                    ['Dishes', summary.dishes],
                                    ['Reviews', summary.reviews],
                                    ['Students reviewing', summary.reviewers],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <dd className="font-display text-3xl font-semibold">{value}</dd>
                                        <dt className="text-sm text-muted">{label}</dt>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <AIRecommender />
                    </div>
                </section>

                {popular.length > 0 && popular[0].review_count > 0 && !debouncedSearch && activeCategory === 'All' && (
                    <section className="mb-12">
                        <div className="flex items-end justify-between mb-4">
                            <h2 className="font-display text-2xl font-semibold">Most talked about</h2>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {popular.map((item, i) => (
                                <Link key={item.id} to={`/dish/${item.id}`} className="card p-5 flex items-center gap-4 hover:border-ink/30 transition">
                                    <span className="font-display text-3xl font-semibold text-line w-8">{i + 1}</span>
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate">{item.name}</p>
                                        <p className="text-sm text-muted">{item.review_count} reviews</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
                        <h2 className="font-display text-2xl font-semibold">Today's menu</h2>
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                            {['All', ...categories].map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${activeCategory === category ? 'bg-ink text-white border-ink' : 'bg-paper border-line text-ink-soft hover:border-ink/40'}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => <DishCardSkeleton key={i} />)}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="card text-center py-16">
                            <p className="font-display text-xl font-semibold mb-1">{searchTerm ? `Nothing matches "${searchTerm}"` : 'No dishes here yet'}</p>
                            <p className="text-muted text-sm">Try another dish or clear the filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map(item => <DishCard key={item.id} item={item} />)}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default Dashboard;
