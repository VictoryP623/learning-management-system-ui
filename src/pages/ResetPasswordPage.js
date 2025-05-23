// src/pages/ResetPasswordPage.js
import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const ResetPasswordPage = () => {
    const [params] = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = params.get("token");
        if (!token) {
            setMsg("❌ No token found.");
            return;
        }
        if (password.length < 6) {
            setMsg("❌ Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            setMsg("❌ Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/auth/reset-password?token=${token}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                setMsg("✅ Reset successful! You may now login.");
            } else {
                const error = await res.json().catch(() => ({}));
                setMsg("❌ Reset failed: " + (error?.message || "Unknown error"));
            }
        } catch {
            setMsg("❌ Reset failed: Network error");
        }
        setLoading(false);
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="card shadow p-4" style={{ width: 400 }}>
                <h2 className="text-center mb-4">Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="New password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            minLength={6}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Confirm new password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-success w-100"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Reset Password"}
                    </button>
                </form>
                {msg && (
                    <div className="alert mt-3" style={{ color: msg.includes("✅") ? "green" : "red" }}>
                        {msg}
                    </div>
                )}
                {msg.includes("successful") && (
                    <div className="text-center mt-3">
                        <Link
                            to="/login"
                            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow"
                            style={{
                                fontSize: 18,
                                letterSpacing: 1,
                                boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
                            }}
                        >
                            Go to Login
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResetPasswordPage;
