import { useNavigate, Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import AuthLayout, { PasswordInput } from "../components/AuthLayout";

function Register() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
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

    async function handleRegister(e) {
        e.preventDefault()
        if (!name.trim()) {
            fail('Please enter your name')
            return
        }
        if (!email.trim() || email.trim().length < 10) {
            fail('Please enter a valid email')
            return
        }
        if (!password) {
            fail('Please choose a password')
            return
        }
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            })
            const data = await response.json()
            if (!response.ok) {
                fail(data.message ?? 'Could not create account')
            } else {
                login(data.token)
                navigate('/dashboard')
            }
        } catch (err) {
            console.log(err)
            fail('Could not reach the server')
        }
        setLoading(false)
    }

    return (
        <AuthLayout title="Create your account" subtitle="Join your campus on Bitewise. It takes a few seconds." shake={invalidShake}>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <label className="text-sm font-medium flex flex-col gap-1.5">
                    Name
                    <input autoFocus type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
                </label>
                <label className="text-sm font-medium flex flex-col gap-1.5">
                    Email
                    <input type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
                </label>
                <label className="text-sm font-medium flex flex-col gap-1.5">
                    Password
                    <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                </label>
                {error && <p className="text-sm text-tomato-dark">{error}</p>}
                <button type="submit" disabled={loading} className="btn btn-dark mt-2">{loading ? 'Creating account…' : 'Create account'}</button>
            </form>
            <p className="text-sm text-muted text-center mt-6">
                Already have an account? <Link to='/login' className="font-semibold text-ink hover:text-tomato transition">Log in</Link>
            </p>
        </AuthLayout>
    )
}

export default Register
