import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Route guard.
 *   <ProtectedRoute>...</ProtectedRoute>          requires any logged-in user
 *   <ProtectedRoute adminOnly>...</ProtectedRoute> requires isAdmin=true
 *
 * Requirement (Phase III #1d/e): non-admin users cannot reach create/edit
 * routes. We also hide the buttons in the UI — this is the second line of
 * defense (the final line being backend isAdmin middleware).
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isLoggedIn, isAdmin } = useSelector((s) => s.auth);
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }
    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;
