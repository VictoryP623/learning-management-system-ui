import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser, FaUserGraduate } from "react-icons/fa";
import { Link } from "react-router-dom";

const SignUpPage = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullname: "",
        role: "Student"
    });
    const [msg, setMsg] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMsg("");
        setSuccess(false);

        if (form.password !== form.confirmPassword) {
            setMsg("Passwords do not match!");
            setSuccess(false);
            return;
        }
        if (form.password.length < 6) {
            setMsg("Bạn phải nhập mật khẩu ít nhất 6 ký tự.");
            setSuccess(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8081/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    fullname: form.fullname,
                    role: form.role
                }),
            });
            if (res.ok) {
                setMsg("Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác minh.");
                setSuccess(true);
                setForm({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    fullname: "",
                    role: "Student"
                });
            } else {
                const errorData = await res.json();
                if (errorData && errorData.data && errorData.data.password) {
                    setMsg(errorData.data.password[0]);
                } else if (errorData && errorData.error) {
                    setMsg(errorData.error);
                } else {
                    setMsg("Đăng ký không thành công. Hãy thử email khác.");
                }
                setSuccess(false);
            }
        } catch (e) {
            setMsg("Lỗi mạng. Vui lòng thử lại.");
            setSuccess(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{
            minHeight: "75vh",
            background: "linear-gradient(90deg,#1677ff 0%,#49c6e5 100%)"
        }}>
            <div style={{
                minWidth: 340, maxWidth: 400, width: '100%',
                background: "#fff",
                borderRadius: 20,
                padding: "32px 26px 24px 26px",
                boxShadow: "0 8px 28px 0 #00306e24"
            }}>
                <h2 className="text-center mb-4 fw-bold" style={{ color: "#1566c2" }}>Sign Up</h2>
                {msg &&
                    <div className={`alert ${success ? "alert-success" : "alert-danger"}`} role="alert">
                        {msg}
                    </div>
                }
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text bg-white border-end-0"><FaUser /></span>
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
                    <div className="form-group mb-3">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text bg-white border-end-0"><FaEnvelope /></span>
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
                    <div className="form-group mb-3">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text bg-white border-end-0"><FaLock /></span>
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
                    <div className="form-group mb-3">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text bg-white border-end-0"><FaLock /></span>
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
                    <div className="form-group mb-4">
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text bg-white border-end-0"><FaUserGraduate /></span>
                            <select
                                name="role"
                                className="form-select border-start-0"
                                value={form.role}
                                onChange={handleChange}
                                style={{ borderLeft: 0 }}
                            >
                                <option value="Student">Student</option>
                                <option value="Instructor">Instructor</option>
                            </select>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">
                        <button type="submit"
                            className="btn btn-primary rounded-pill px-5 fw-semibold"
                            style={{ fontSize: 18, minWidth: 120 }}
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
                <div className="text-center mt-3">
                    <span>Already have an account? </span>
                    <Link to="/login" className="btn btn-outline-primary rounded-pill px-3 py-1 fw-semibold ms-1"
                        style={{ fontSize: 16, minWidth: 100 }}>
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
