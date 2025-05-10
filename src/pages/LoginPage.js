// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Dùng để điều hướng trang
import { loginUser } from '../services/api';  // Hàm gọi API đăng nhập

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();  // Hook dùng để chuyển hướng

    const handleLogin = async (e) => {
        e.preventDefault();  // Ngừng hành động mặc định khi submit form
        setError('');

        // Kiểm tra xem email và password đã được điền chưa
        if (!email || !password) {
            setError('Please fill in both fields.');
            return;
        }

        try {
            // Gọi API đăng nhập
            const data = await loginUser(email, password);

            if (data.token) {
                // Lưu token vào localStorage hoặc context để xác thực người dùng
                localStorage.setItem('token', data.token);
                navigate('/courses');  // Chuyển đến trang khóa học sau khi đăng nhập thành công
            } else {
                setError('Invalid email or password.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error(err);
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
                                onChange={(e) => setEmail(e.target.value)}
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
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                            Login
                        </button>
                    </form>
                    <p className="mt-3 text-center">
                        Don't have an account? <a href="/signup">Sign Up</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
