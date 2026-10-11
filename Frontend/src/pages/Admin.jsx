import { useContext, useState, useEffect } from "react";
import { MenuContext } from "../context/MenuContext";
import { DishTile } from "../components/ui";
import { categoryStyle } from "../lib/format";

function Admin() {

    const { items, setItems } = useContext(MenuContext);

    const [dishName, setDishName] = useState('');
    const [dishCategory, setDishCategory] = useState('');
    const [dishWaitTime, setDishWaitTime] = useState('');
    const [toast, setToast] = useState(null);
    const [topDishes, setTopDishes] = useState([])
    const [summary, setSummary] = useState(null)

    const categories = [...new Set(items.map(item => item.category))]

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/top-dishes`)
            .then(res => res.json())
            .then(data => setTopDishes(data))
            .catch(err => console.log(err))
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/summary`)
            .then(res => res.json())
            .then(data => setSummary(data))
            .catch(err => console.log(err))
    }, [])

    function showToast(type, text) {
        setToast({ type, text })
        setTimeout(() => setToast(null), 3000)
    }

    async function handleAdd(e) {
        e.preventDefault()
        if (!dishName.trim() || !dishCategory.trim() || !dishWaitTime) {
            showToast('error', 'Please fill all the fields')
            return
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dishes/addDish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: dishName.trim(), category: dishCategory.trim(), wait_time: Number(dishWaitTime) })
            })
            if (response.ok) {
                const newDish = await response.json()
                setItems([...items, newDish])
                setDishName('')
                setDishCategory('')
                setDishWaitTime('')
                showToast('success', `${newDish.name} added to the menu`)
            } else if (response.status === 403) {
                showToast('error', 'Only admins can add dishes')
            } else {
                showToast('error', 'Failed to add dish')
            }
        } catch (err) {
            console.log(err)
        }
    }

    const maxCount = Math.max(1, ...topDishes.map(d => Number(d.message_count)))

    return (
        <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-12 page-fade-in">
            <div className="max-w-6xl mx-auto">
                <p className="eyebrow mb-2">Admin</p>
                <h1 className="font-display text-4xl font-semibold mb-8">Canteen overview</h1>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        ['Dishes', items.length],
                        ['Categories', categories.length],
                        ['Reviews', summary?.reviews ?? '–'],
                        ['Active reviewers', summary?.reviewers ?? '–'],
                    ].map(([label, value]) => (
                        <div key={label} className="card p-5">
                            <p className="text-sm text-muted mb-1">{label}</p>
                            <p className="font-display text-3xl font-semibold">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-6 mb-8">
                    <section className="card p-6 lg:col-span-3">
                        <h2 className="font-semibold mb-1">Top dishes by activity</h2>
                        <p className="text-sm text-muted mb-5">Ranked by number of reviews</p>
                        <ol className="space-y-4">
                            {topDishes.map((dish, index) => (
                                <li key={dish.id ?? dish.name} className="flex items-center gap-4">
                                    <span className="w-5 text-sm font-semibold text-muted">{index + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium truncate">{dish.name}</span>
                                            <span className="text-muted">{dish.message_count}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-cream overflow-hidden">
                                            <div className="h-full rounded-full bg-tomato" style={{ width: `${(Number(dish.message_count) / maxCount) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <form onSubmit={handleAdd} className="card p-6 lg:col-span-2 flex flex-col gap-4">
                        <div>
                            <h2 className="font-semibold mb-1">Add a dish</h2>
                            <p className="text-sm text-muted">It shows up on the menu right away.</p>
                        </div>
                        <label className="text-sm font-medium flex flex-col gap-1.5">
                            Name
                            <input type="text" placeholder="e.g. Masala Dosa" value={dishName} onChange={(e) => setDishName(e.target.value)} className="input" />
                        </label>
                        <label className="text-sm font-medium flex flex-col gap-1.5">
                            Category
                            <input type="text" list="admin-categories" placeholder="e.g. Breakfast" value={dishCategory} onChange={(e) => setDishCategory(e.target.value)} className="input" />
                            <datalist id="admin-categories">
                                {categories.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </label>
                        <label className="text-sm font-medium flex flex-col gap-1.5">
                            Wait time (minutes)
                            <input type="number" min="1" placeholder="e.g. 8" value={dishWaitTime} onChange={(e) => setDishWaitTime(e.target.value)} className="input" />
                        </label>
                        <button type="submit" className="btn btn-primary mt-1">Add dish</button>
                    </form>
                </div>

                {items.length > 0 && (
                    <section className="card overflow-hidden">
                        <div className="p-6 pb-4">
                            <h2 className="font-semibold">All dishes</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-y border-line text-muted bg-cream/50">
                                        <th className="px-6 py-3 font-medium">Dish</th>
                                        <th className="px-6 py-3 font-medium">Category</th>
                                        <th className="px-6 py-3 font-medium">Wait</th>
                                        <th className="px-6 py-3 font-medium text-right">Reviews</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {items.map(item => {
                                        const style = categoryStyle(item.category)
                                        return (
                                            <tr key={item.id} className="hover:bg-cream/40 transition">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <DishTile name={item.name} category={item.category} size="h-9 w-9 text-sm !rounded-xl" />
                                                        <span className="font-medium whitespace-nowrap">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3"><span className={`chip ${style.bg} ${style.text}`}>{item.category}</span></td>
                                                <td className="px-6 py-3 text-ink-soft whitespace-nowrap">{item.wait_time} min</td>
                                                <td className="px-6 py-3 text-ink-soft text-right">{item.review_count ?? 0}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>

            {toast && (
                <div className={`fixed bottom-6 right-6 left-6 sm:left-auto px-5 py-3 rounded-full shadow-lg text-sm font-medium page-fade-in z-50 ${toast.type === 'success' ? 'bg-ink text-white' : 'bg-tomato text-white'}`}>
                    {toast.text}
                </div>
            )}
        </div>
    )
}

export default Admin;
