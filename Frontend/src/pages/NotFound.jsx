import { Link } from 'react-router-dom'

function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 page-fade-in">
            <div className="text-center max-w-md">
                <p className="font-display text-8xl sm:text-9xl font-semibold text-tomato mb-4">404</p>
                <h1 className="font-display text-2xl font-semibold mb-2">This page is off the menu</h1>
                <p className="text-muted mb-8">The page you're looking for doesn't exist or has been moved.</p>
                <Link to='/dashboard' className="btn btn-dark">Back to menu</Link>
            </div>
        </div>
    )
}

export default NotFound
