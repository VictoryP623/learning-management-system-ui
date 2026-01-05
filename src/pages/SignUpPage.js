import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser, FaUserGraduate } from "react-icons/fa";
import { Link } from "react-router-dom";

// ================== API CONFIG ==================
const API_BASE = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");
const API_URL = `${API_BASE}/api`;
// =================================================

const SignUpPage = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullname: "",
        role: "Student",
    });
    const [msg, setMsg] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        setSuccess(false);

        // ===== validate =====
        if (form.password !== form.confirmPassword) {
            setMsg("Mật khẩu xác nhận không khớp!");
            return;
        }
        if (form.password.length < 6) {
            setMsg("Bạn phải nhập mật khẩu ít nhất 6 ký tự.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    fullname: form.fullname,
                    role: form.role,
                }),
            });

            const body = await res.json().catch(() => ({}));

            if (res.ok) {
                setMsg("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.");
                setSuccess(true);
                setForm({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    fullname: "",
                    role: "Student",
                });
            } else {
                // handle error message từ BE
                if (body?.data?.password?.length) {
                    setMsg(body.data.password[0]);
                } else if (body?.message) {
                    setMsg(body.message);
                } else if (body?.error) {
                    setMsg(body.error);
                } else {
                    setMsg("Đăng ký không thành công. Hãy thử email khác.");
                }
                setSuccess(false);
            }
        } catch (err) {
            console.error("register error:", err);
            setMsg("Lỗi mạng. Vui lòng thử lại.");
            setSuccess(false);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
                minHeight: "75vh",
                background: "linear-gradient(90deg,#1677ff 0%,#49c6e5 100%)",
            }}
        >
            <div
                style={{
                    minWidth: 340,
                    maxWidth: 400,
                    width: "100%",
                    background: "#fff",
                    borderRadius: 20,
                    padding: "32px 26px 24px 26px",
                    boxShadow: "0 8px 28px 0 #00306e24",
                }}
            >
                <h2 className="text-center mb-4 fw-bold" style={{ color: "#1566c2" }}>
                    Sign Up
                </h2>

                {msg && (
                    <div className={`alert ${success ? "alert-success" : "alert-danger"}`} role="alert">
                        {msg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Fullname */}
                    <div className="form-group mb-3">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text bg-white border-end-0">
                                <FaUser />
                            </span>
                            <input
                                name="fullname"
                                className="form-control border-start-0"
                                placeholder="Full Name"
                                value={form.fullname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-group mb-3">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text bg-white border-end-0">
                                <FaEnvelope />
                            </span>
                            <input
                                name="email"
                                type="email"
                                className="form-control border-start-0"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group mb-3">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text bg-white border-end-0">
                                <FaLock />
                            </span>
                            <input
                                name="password"
                                type="password"
                                className="form-control border-start-0"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group mb-3">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text bg-white border-end-0">
                                <FaLock />
                            </span>
                            <input
                                name="confirmPassword"
                                type="password"
                                className="form-control border-start-0"
                                placeholder="Confirm Password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="form-group mb-4">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text bg-white border-end-0">
                                <FaUserGraduate />
                            </span>
                            <select
                                name="role"
                                className="form-select border-start-0"
                                value={form.role}
                                onChange={handleChange}
                            >
                                <option value="Student">Student</option>
                                <option value="Instructor">Instructor</option>
                            </select>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center">
                        <button
                            type="submit"
                            className="btn btn-primary rounded-pill px-5 fw-semibold"
                            style={{ fontSize: 18, minWidth: 120 }}
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                <div className="text-center mt-3">
                    <span>Already have an account? </span>
                    <Link
                        to="/login"
                        className="btn btn-outline-primary rounded-pill px-3 py-1 fw-semibold ms-1"
                        style={{ fontSize: 16, minWidth: 100 }}
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
