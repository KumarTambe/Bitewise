import { useState } from "react";

const suggestions = ['something spicy', 'light & quick', 'cold drink', 'very hungry']

// Gemini replies in light markdown: render numbered items, bullets and **bold**
function FormattedText({ text }) {
    const inline = (line) => line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong> : part
    )
    return text.split('\n').filter(line => line.trim()).map((line, i) => {
        const bullet = line.match(/^(\s*)[-*]\s+(.*)/)
        if (bullet) {
            return (
                <p key={i} className={`flex gap-2 ${bullet[1].length ? 'pl-5' : ''}`}>
                    <span className="text-tomato">•</span><span>{inline(bullet[2])}</span>
                </p>
            )
        }
        const numbered = line.match(/^\s*(\d+)\.\s+(.*)/)
        if (numbered) {
            return (
                <p key={i} className="flex gap-2 pt-1">
                    <span className="text-tomato font-semibold">{numbered[1]}.</span><span>{inline(numbered[2])}</span>
                </p>
            )
        }
        return <p key={i}>{inline(line.trim())}</p>
    })
}

function AIRecommender() {

    const [mood, setMood] = useState('');
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState('')
    const [feedback, setFeedback] = useState(null)

    function handleFeedback(value) {
        setFeedback(value);
        localStorage.setItem('feedback', JSON.stringify({
            mood: mood,
            recommendation: recommendation,
            helpful: value == 'helpful'
        }))
    }

    async function handleSubmit(value = mood) {
        if (!value.trim() || loading) return
        setLoading(true)
        setFeedback(null)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood: value })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            setRecommendation(data.text)
            setMood('')
        } catch {
            setRecommendation('Sorry, could not get a recommendation. Try again.')
        }
        setLoading(false)
    }

    return (
        <div className="bg-ink text-white rounded-[20px] p-6 sm:p-7 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-tomato"></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Ask Bitewise AI</span>
            </div>
            <h2 className="font-display text-2xl font-semibold mb-1">Not sure what to eat?</h2>
            <p className="text-white/60 text-sm mb-5">Describe your mood and we'll pick from today's menu.</p>

            <form
                onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
                className="flex items-center gap-2 bg-white/10 rounded-full p-1.5 pl-5 focus-within:bg-white/15 transition"
            >
                <input
                    type="text"
                    placeholder="e.g. something spicy and filling"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/40 outline-none text-sm"
                />
                <button type="submit" disabled={loading || !mood.trim()} className="btn btn-primary !py-2 !px-4 shrink-0">
                    {loading ? 'Thinking…' : 'Suggest'}
                </button>
            </form>

            {!recommendation && !loading && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {suggestions.map(s => (
                        <button
                            key={s}
                            onClick={() => { setMood(s); handleSubmit(s) }}
                            className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/40 transition"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {loading && (
                <div className="mt-5 space-y-2">
                    <div className="h-3 w-full rounded bg-white/10 animate-pulse"></div>
                    <div className="h-3 w-4/5 rounded bg-white/10 animate-pulse"></div>
                    <div className="h-3 w-3/5 rounded bg-white/10 animate-pulse"></div>
                </div>
            )}

            {recommendation && !loading && (
                <div className="mt-5 text-sm leading-relaxed text-white/80 space-y-2 page-fade-in max-h-72 overflow-y-auto pr-1">
                    <FormattedText text={recommendation} />

                    {!feedback ? (
                        <div className="flex items-center gap-2 pt-2">
                            <span className="text-xs text-white/50 mr-1">Was this helpful?</span>
                            <button onClick={() => handleFeedback('helpful')} className="text-xs px-3 py-1.5 rounded-full border border-white/15 hover:border-white/40 transition">Yes</button>
                            <button onClick={() => handleFeedback('not-helpful')} className="text-xs px-3 py-1.5 rounded-full border border-white/15 hover:border-white/40 transition">No</button>
                        </div>
                    ) : (
                        <p className="text-xs text-white/50 pt-2">Thanks for the feedback!</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default AIRecommender;
