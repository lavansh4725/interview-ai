import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import "../auth.form.scss";
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../../../context/toast.context';

const Register = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { loading, handleRegister } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !email.trim() || !password.trim()) {
            const msg = "Please fill in all required fields.";
            setError(msg);
            showToast(msg, "error");
            return;
        }

        if (password.length < 6) {
            const msg = "Password must be at least 6 characters long.";
            setError(msg);
            showToast(msg, "error");
            return;
        }

        const res = await handleRegister({ username, email, password });
        if (res?.success) {
            showToast("Account created successfully! Welcome to RoleReady AI.", "success");
            navigate("/");
        } else {
            const errorMsg = res?.error || "Registration failed. Please try again.";
            setError(errorMsg);
            showToast(errorMsg, "error");
        }
    };

    if (loading) {
        return (
            <main role="status" aria-live="polite">
                <h1>Creating your account...</h1>
            </main>
        );
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

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
                        <label htmlFor="username">Username</label>

                        <input
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (error) setError("");
                            }}
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter username"
                            required
                        />
                    </div>

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
                            placeholder="Enter password (min 6 characters)"
                            required
                        />
                    </div>

                    <button className="button primary-button" type="submit">
                        Register
                    </button>
                </form>

                <p>
                    Already have an account?{" "}
                    <Link to={"/login"}>Login</Link>
                </p>
            </div>
        </main>
    );
};

export default Register;