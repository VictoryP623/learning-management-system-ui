import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { Link } from "react-router-dom";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Hàm xác định role và điều hướng đúng dashboard
    const navigateBasedOnRole = (accessToken) => {
        if (!accessToken) return;
        try {
            const decoded = jwtDecode(accessToken);
            const role = decoded.role;
            if (role === 'Admin') navigate('/admin-dashboard');
            else if (role === 'Instructor') navigate('/instructor-dashboard');
            else navigate('/profile');
        } catch {
            navigate('/');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please fill in both fields.');
            return;
        }
        try {
            // Gọi API đăng nhập
            const data = await loginUser(email, password);
            // Response data.data là 1 array chứa object token!
            const tokens = Array.isArray(data.data) ? data.data[0] : data.data;
            if (tokens?.accessToken) {
                localStorage.setItem('accessToken', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);
                // KHÔNG set localStorage user nữa!
                window.dispatchEvent(new Event("userChanged"));
                navigateBasedOnRole(tokens.accessToken);
            } else {
                setError('Invalid email or password.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">Login</h2>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <form onSubmit={handleLogin}>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="form-group mb-3">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="d-flex justify-content-center mb-2">
                            <button
                                type="submit"
                                className="btn btn-primary rounded-pill px-4 py-1 fw-semibold"
                                style={{ fontSize: 16, minWidth: 100 }}
                            >
                                Login
                            </button>
                        </div>
                        <div className="text-end mt-2">
                            <Link
                                to="/forgot-password"
                                className="btn btn-link p-0 fw-semibold"
                                style={{
                                    color: "#0d6efd",
                                    textDecoration: "underline",
                                    fontSize: 15,
                                    letterSpacing: 0.2,
                                }}
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </form>
                    <div className="mt-3 text-center">
                        <span>Don't have an account?</span>{" "}
                        <Link
                            to="/signup"
                            className="btn btn-outline-primary rounded-pill px-3 py-1 fw-semibold ms-1"
                            style={{ fontSize: 16, minWidth: 100 }}
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
