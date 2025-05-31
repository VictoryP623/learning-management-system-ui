import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { FaEnvelope, FaLock } from "react-icons/fa";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Điều hướng dựa trên vai trò
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
            setError('Vui lòng nhập đầy đủ email và mật khẩu.');
            return;
        }
        try {
            const data = await loginUser(email, password);
            const tokens = Array.isArray(data.data) ? data.data[0] : data.data;
            if (tokens?.accessToken) {
                localStorage.setItem('accessToken', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);
                window.dispatchEvent(new Event("userChanged"));
                navigateBasedOnRole(tokens.accessToken);
            } else {
                setError('Sai tài khoản hoặc mật khẩu.');
            }
        } catch (err) {
            if (err.response) {
                const errorMsg = err.response.data?.error || "";
                if (err.response.status === 403 && errorMsg.includes("deactivated")) {
                    setError("Tài khoản của bạn chưa được xét duyệt bởi hệ thống.");
                } else if (err.response.status === 401) {
                    setError('Mật khẩu không đúng.');
                } else if (err.response.status === 404 && errorMsg.includes("Account does not exist")) {
                    setError('Tài khoản không tồn tại.');
                } else {
                    setError('Có lỗi xảy ra. Vui lòng thử lại.');
                }
            } else {
                setError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    };


    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh', background: 'linear-gradient(90deg,#1677ff 0%,#49c6e5 100%)' }}>
            <div
                style={{
                    background: '#fff',
                    borderRadius: 20,
                    boxShadow: '0 6px 32px #00306e18',
                    padding: '36px 32px',
                    minWidth: 340,
                    maxWidth: 380,
                    width: '100%',
                }}
            >
                <h2 className="text-center mb-4 fw-bold" style={{ color: "#1566c2" }}>Đăng nhập</h2>
                <form onSubmit={handleLogin}>
                    {error && <div className="alert alert-danger text-center py-2">{error}</div>}
                    {/* Email */}
                    <div className="mb-3">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text rounded-0 border-end-0 bg-white">
                                <FaEnvelope />
                            </span>
                            <input
                                type="email"
                                className="form-control border-start-0"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoFocus
                                style={{ fontSize: 16 }}
                            />
                        </div>
                    </div>
                    {/* Password */}
                    <div className="mb-3">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text rounded-0 border-end-0 bg-white">
                                <FaLock />
                            </span>
                            <input
                                type="password"
                                className="form-control border-start-0"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ fontSize: 16 }}
                            />
                        </div>
                    </div>
                    {/* Forgot password */}
                    <div className="text-end mb-2">
                        <Link
                            to="/forgot-password"
                            className="btn btn-link p-0 fw-semibold"
                            style={{
                                color: "#1677ff",
                                textDecoration: "underline",
                                fontSize: 15,
                                letterSpacing: 0.2,
                            }}
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>
                    {/* Login button */}
                    <button
                        type="submit"
                        className="btn btn-primary rounded-pill w-100 fw-bold"
                        style={{
                            fontSize: 18,
                            minHeight: 44,
                            margin: "10px 0 8px 0",
                            boxShadow: '0 3px 18px #1677ff22'
                        }}
                    >
                        Đăng nhập
                    </button>
                </form>
                {/* Sign Up */}
                <div className="mt-3 text-center">
                    <span>Bạn chưa có tài khoản?</span>{" "}
                    <Link
                        to="/signup"
                        className="btn btn-outline-primary rounded-pill px-3 py-1 fw-semibold ms-1"
                        style={{ fontSize: 16, minWidth: 100 }}
                    >
                        Đăng ký
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
