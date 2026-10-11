import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Avatar } from "../components/ui";

function Chat() {
    const [savedMessages, setSavedMessages] = useState(() => [
        { id: Date.now() - 1000 * 60 * 12, user: "Bitewise", text: "Welcome to the community board! Ask what's fresh, share today's specials, or find someone to grab chai with." }
    ])
    const { user } = useContext(AuthContext)
    const [msg, setMsg] = useState('');
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [savedMessages])

    function handleSubmit(e) {
        e.preventDefault()
        if (!msg.trim()) return
        setSavedMessages([...savedMessages, { id: Date.now(), user: user ?? 'You', text: msg }])
        setMsg('');
    }

    return (
        <div className="px-4 sm:px-6 py-8 page-fade-in">
            <div className="max-w-3xl mx-auto">
                <p className="eyebrow mb-2">Community</p>
                <h1 className="font-display text-4xl font-semibold mb-6">General discussion</h1>

                <div className="card flex flex-col h-[65vh] min-h-96">
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                        {savedMessages.map((message) => {
                            const isMine = message.user === (user ?? 'You');
                            return (
                                <div key={message.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                                    <Avatar name={message.user} />
                                    <div className={`max-w-[75%] ${isMine ? 'text-right' : ''}`}>
                                        <div className={`flex items-baseline gap-2 mb-1 ${isMine ? 'justify-end' : ''}`}>
                                            <span className="font-semibold text-sm">{message.user}</span>
                                            <span className="text-xs text-muted">
                                                {new Date(message.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={`inline-block text-left rounded-2xl px-4 py-2.5 break-words ${isMine ? 'bg-ink text-white rounded-tr-sm' : 'bg-cream text-ink rounded-tl-sm'}`}>{message.text}</p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={bottomRef}></div>
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-line p-3 flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message…"
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            className="input !rounded-full"
                        />
                        <button type="submit" disabled={!msg.trim()} className="btn btn-primary shrink-0">Send</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Chat;
