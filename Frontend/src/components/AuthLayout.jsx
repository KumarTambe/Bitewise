import { Link } from "react-router-dom";
import { Logo } from "./ui";

export function PasswordInput({ value, onChange, show, onToggle, placeholder = 'Password' }) {
    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="input !pr-16"
            />
            <button
                type="button"
                onClick={onToggle}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-ink transition px-2 py-1 rounded"
            >
                {show ? 'Hide' : 'Show'}
            </button>
        </div>
    )
}

function AuthLayout({ title, subtitle, shake, children }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <aside className="hidden lg:flex flex-col justify-between bg-ink text-white p-12">
                <Link to='/dashboard' className="flex items-center gap-2.5">
                    <Logo />
                    <span className="font-display text-2xl font-semibold">Bitewise</span>
                </Link>
                <div>
                    <p className="font-display text-5xl font-semibold leading-tight mb-6">
                        Know what's good <span className="italic text-tomato">before</span> you queue.
                    </p>
                    <p className="text-white/60 max-w-md">
                        Live menu, honest reviews from fellow students, and an AI that picks your next meal based on your mood.
                    </p>
                </div>
                <p className="text-sm text-white/40">Bitewise · AI-powered campus canteen</p>
            </aside>

            <main className="flex items-center justify-center px-4 py-12 page-fade-in">
                <div className={`w-full max-w-sm ${shake ? 'shake-invalid' : ''}`}>
                    <Link to='/dashboard' className="lg:hidden flex items-center gap-2.5 mb-10">
                        <Logo />
                        <span className="font-display text-2xl font-semibold">Bitewise</span>
                    </Link>
                    <h1 className="font-display text-3xl font-semibold mb-1">{title}</h1>
                    <p className="text-muted mb-8">{subtitle}</p>
                    {children}
                </div>
            </main>
        </div>
    )
}

export default AuthLayout
