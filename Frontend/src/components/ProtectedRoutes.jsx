import { useContext } from "react";
import { Navigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
    const { isLoggedIn, isAdmin } = useContext(AuthContext);
    if (!isLoggedIn) return <Navigate to='/login' />
    if (adminOnly && !isAdmin) return <Navigate to='/dashboard' />
    return children
}

export default ProtectedRoute;
