import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Logo } from "./ui";

function Navbar() {

    const { user, isLoggedIn, isAdmin, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (location.pathname === '/login' || location.pathname === '/register') return null

    function handleLogOut() {
        logout()
        navigate('/login')
        setMobileOpen(false)
    }

    const links = [
        { to: '/dashboard', label: 'Menu' },
        ...(isLoggedIn ? [{ to: '/chat', label: 'Community' }] : []),
        ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
    ]

    function navLinkClasses(path) {
        const isActive = location.pathname === path;
        return `px-4 py-2 rounded-full text-sm font-medium transition ${isActive ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink hover:bg-paper'}`;
    }

    return (
        <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-line">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link to='/dashboard' className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                    <Logo />
                    <span className="font-display text-2xl font-semibold tracking-tight">Bitewise</span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {links.map(link => (
                        <Link key={link.to} to={link.to} className={navLinkClasses(link.to)}>{link.label}</Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <div className="flex items-center gap-2">
                                <Avatar name={user ?? 'You'} size="h-8 w-8 text-xs" />
                                <span className="text-sm font-medium">{user ?? 'You'}</span>
                            </div>
                            <button onClick={handleLogOut} className="btn btn-ghost !py-2 !px-4">Log out</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} className="btn btn-ghost !py-2 !px-4">Log in</button>
                            <button onClick={() => navigate('/register')} className="btn btn-dark !py-2 !px-4">Sign up</button>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-full hover:bg-paper"
                    aria-label="Toggle menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {mobileOpen
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />}
                    </svg>
                </button>
            </div>

            {mobileOpen && (
                <div className="md:hidden border-t border-line bg-cream px-4 py-4 flex flex-col gap-2 page-fade-in">
                    {links.map(link => (
                        <Link key={link.to} to={link.to} className={navLinkClasses(link.to)} onClick={() => setMobileOpen(false)}>{link.label}</Link>
                    ))}
                    <div className="border-t border-line mt-2 pt-3 flex gap-2">
                        {isLoggedIn ? (
                            <button onClick={handleLogOut} className="btn btn-ghost flex-1">Log out</button>
                        ) : (
                            <>
                                <button onClick={() => { navigate('/login'); setMobileOpen(false) }} className="btn btn-ghost flex-1">Log in</button>
                                <button onClick={() => { navigate('/register'); setMobileOpen(false) }} className="btn btn-dark flex-1">Sign up</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar;
