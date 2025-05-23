import React, { useState } from "react";

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

        // Kiểm tra mật khẩu nhập lại
        if (form.password !== form.confirmPassword) {
            setMsg("Passwords do not match!");
            setSuccess(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/auth/register", {
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
                setMsg("Register successful! Please check your email to verify.");
                setSuccess(true);
                setForm({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    fullname: "",
                    role: "Student"
                });
            } else {
                setMsg("Register failed. Try another email.");
                setSuccess(false);
            }
        } catch (e) {
            setMsg("Network error. Please try again.");
            setSuccess(false);
        }
    };

    return (
        <div className="container py-5 d-flex flex-column align-items-center">
            <div style={{ minWidth: 320, maxWidth: 400, width: '100%' }}>
                <h2 className="text-center mb-4" style={{ fontWeight: 700 }}>Sign Up</h2>
                {msg &&
                    <div className={`alert ${success ? "alert-success" : "alert-danger"}`} role="alert">
                        {msg}
                    </div>
                }
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <input
                            name="fullname"
                            className="form-control"
                            placeholder="Full Name"
                            value={form.fullname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            name="email"
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            name="password"
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            name="confirmPassword"
                            type="password"
                            className="form-control"
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group mb-4">
                        <select
                            name="role"
                            className="form-control"
                            value={form.role}
                            onChange={handleChange}
                        >
                            <option value="Student">Student</option>
                            <option value="Instructor">Instructor</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100" style={{ fontWeight: 600, fontSize: 18 }}>
                        Sign Up
                    </button>
                </form>
                <div className="text-center mt-3">
                    Already have an account? <a href="/login">Login</a>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
