import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthLayout, { PasswordInput } from "../components/AuthLayout";

function Login() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [invalidShake, setInvalidShake] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    function fail(message) {
        setError(message)
        setInvalidShake(true)
        setTimeout(() => setInvalidShake(false), 500)
    }

    async function handleLogIn(e) {
        e.preventDefault()
        if (!email.trim() || email.trim().length < 10) {
            fail('Please enter a valid email')
            return
        }
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await response.json()
            if (!response.ok) {
                fail(data.message ?? 'Could not log in')
            } else {
                login(data.token)
                navigate('/dashboard')
            }
        } catch (err) {
            console.log(err);
            fail('Could not reach the server')
        }
        setLoading(false)
    }

    return (
        <AuthLayout title="Welcome back" subtitle="Log in to review dishes and join the conversation." shake={invalidShake}>
            <form onSubmit={handleLogIn} className="flex flex-col gap-4">
                <label className="text-sm font-medium flex flex-col gap-1.5">
                    Email
                    <input autoFocus type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
                </label>
                <label className="text-sm font-medium flex flex-col gap-1.5">
                    Password
                    <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                </label>
                {error && <p className="text-sm text-tomato-dark">{error}</p>}
                <button type="submit" disabled={loading} className="btn btn-dark mt-2">{loading ? 'Logging in…' : 'Log in'}</button>
            </form>
            <p className="text-sm text-muted text-center mt-6">
                New to Bitewise? <Link to='/register' className="font-semibold text-ink hover:text-tomato transition">Create an account</Link>
            </p>
        </AuthLayout>
    )
}

export default Login;
