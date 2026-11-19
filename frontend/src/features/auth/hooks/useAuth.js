import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import {
    login,
    register,
    logout,
    getMe
} from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);

    const {
        user,
        setUser,
        loading,
        setLoading
    } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);

        try {
            const data = await login({ email, password });
            if (data?.user) {
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data?.message || "Invalid credentials." };
            }
        } catch (err) {
            let message = "Failed to log in. Please check your credentials.";
            if (err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err.code === "ERR_NETWORK" || !err.response) {
                message = "Unable to connect to the backend server. Please verify the backend is running on port 5000.";
            } else if (err.response?.status === 404) {
                message = "Backend login route not found (404). Please ensure the backend server is running on port 5000.";
            } else if (err.message) {
                message = err.message;
            }
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);

        try {
            const data = await register({
                username,
                email,
                password
            });

            if (data?.user) {
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data?.message || "Registration failed." };
            }
        } catch (err) {
            let message = "Registration failed. Please try again.";
            if (err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err.code === "ERR_NETWORK" || !err.response) {
                message = "Unable to connect to the backend server. Please verify the backend is running on port 5000.";
            } else if (err.response?.status === 404) {
                message = "Backend register route not found (404). Please ensure the backend server is running on port 5000.";
            } else if (err.message) {
                message = err.message;
            }
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);

        try {
            await logout();
            setUser(null);
            return { success: true };
        } catch (err) {
            setUser(null);
            return { success: true };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                if (data?.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getAndSetUser();
    }, []);

    return {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout
    };
};