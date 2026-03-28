import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../src/context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useContext(AuthContext);

    // If user is not authenticated, redirect to login page
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
