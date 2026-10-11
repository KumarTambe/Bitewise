import { createContext, useState } from "react";

export const AuthContext = createContext();

// read name/role from the JWT payload so they survive a page refresh
function readToken(token) {
    if (!token) return null
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        return { name: payload.name ?? null, role: payload.role ?? 'user' }
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(() => readToken(localStorage.getItem('token')))

    function login(token) {
        localStorage.setItem('token', token)
        setSession(readToken(token))
    }

    function logout() {
        localStorage.removeItem('token')
        setSession(null)
    }

    const value = {
        user: session?.name ?? null,
        isLoggedIn: !!session,
        isAdmin: session?.role === 'admin',
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
