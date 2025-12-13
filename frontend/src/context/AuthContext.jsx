import { createContext, useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";

// Create Auth Context
const AuthContext = createContext();

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "/api";

// Axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load current user
    const loadUser = useCallback(async () => {
        try {
            const response = await api.get("/auth/me");
            setUser(response.data.user);
            setError(null);
        } catch (err) {
            console.error("Load user error:", err);
            setError(err.response?.data?.message || "Failed to load user");
            logout();
        } finally {
            setLoading(false);
        }
    }, []);

    // Load user on mount if token exists
    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token, loadUser]);

    // Register
    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await api.post("/auth/register", userData);
            const { token, user } = response.data;

            localStorage.setItem("token", token);
            setToken(token);
            setUser(user);
            setError(null);

            return { success: true, data: response.data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Registration failed";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await api.post("/auth/login", { email, password });
            const { token, user } = response.data;

            localStorage.setItem("token", token);
            setToken(token);
            setUser(user);
            setError(null);

            return { success: true, data: response.data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Login failed";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setError(null);
    };

    const value = {
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
        isPatient: user?.role === "patient",
        isDoctor: user?.role === "doctor",
        isAdmin: user?.role === "admin",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Export API instance for use in other components
export { api };
