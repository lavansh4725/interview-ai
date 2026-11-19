import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import "../auth.form.scss";
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../../../context/toast.context';

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            const msg = "Please enter both your email and password.";
            setError(msg);
            showToast(msg, "error");
            return;
        }

        const res = await handleLogin({ email, password });
        if (res?.success) {
            showToast("Welcome back! Logged in successfully.", "success");
            navigate('/');
        } else {
            const errorMsg = res?.error || "Invalid email or password. Please try again.";
            setError(errorMsg);
            showToast(errorMsg, "error");
        }
    };

    if (loading) {
        return (
            <main role="status" aria-live="polite">
                <h1>Loading...</h1>
            </main>
        );
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                {error && (
                    <div className="form-error-alert" role="alert" aria-live="assertive">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>

                        <input
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError("");
                            }}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>

                        <input
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError("");
                            }}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button className="button primary-button" type="submit">
                        Login
                    </button>
                </form>

                <p>
                    Don't have an account?{" "}
                    <Link to={"/register"}>Register</Link>
                </p>
            </div>
        </main>
    );
};

export default Login;