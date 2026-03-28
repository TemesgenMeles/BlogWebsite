import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                return jwtDecode(token);
            } catch (e) {
                return null;
            }
        }
         return null;
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();

    const loginUser = async (username, password) => {
        setError(null);
        setIsLoggingIn(true);
        try {
            const response = await axiosInstance.post('/api/token/', {
                username,
                password
            });
            
            if (response.status === 200) {
                const { access, refresh } = response.data;
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                const decodedUser = jwtDecode(access);
                setUser(decodedUser);
                navigate('/admin');
            }
        } catch (error) {
            console.error('Login error', error);
            if (error.response && error.response.status === 401) {
                setError('Invalid username or password.');
            } else {
                setError('A network error occurred. Please try again later.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const clearError = () => setError(null);

    const contextData = {
        user,
        loginUser,
        logoutUser,
        error,
        isLoggingIn,
        clearError
    };

    useEffect(() => {
        setLoading(false);
    }, [user, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen bg-slate-950 font-sans">
                    <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};
