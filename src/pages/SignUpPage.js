// src/pages/SignUpPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Dùng để điều hướng trang
import { signUpUser } from '../services/api';  // Hàm gọi API đăng ký

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();  // Hook dùng để chuyển hướng

    const handleSignUp = async (e) => {
        e.preventDefault();  // Ngừng hành động mặc định khi submit form
        setError('');

        // Kiểm tra xem email, mật khẩu và xác nhận mật khẩu đã được điền chưa
        if (!email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp không
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            // Gọi API đăng ký
            const data = await signUpUser(email, password);

            if (data.token) {
                // Lưu token vào localStorage hoặc context để xác thực người dùng
                localStorage.setItem('token', data.token);
                navigate('/courses');  // Chuyển đến trang khóa học sau khi đăng ký thành công
            } else {
                setError('Error creating account. Please try again.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">Sign Up</h2>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <form onSubmit={handleSignUp}>
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

                        <div className="form-group mb-3">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                            Sign Up
                        </button>
                    </form>
                    <p className="mt-3 text-center">
                        Already have an account? <a href="/login">Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
