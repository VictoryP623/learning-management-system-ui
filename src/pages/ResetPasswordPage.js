import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";

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
        <div
            style={{
                minHeight: '70vh',
                background: 'linear-gradient(110deg, #1677ff 0%, #49c6e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 28,
                    boxShadow: '0 8px 40px #00306e22',
                    padding: '38px 30px 30px 30px',
                    minWidth: 320,
                    maxWidth: 410,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <div style={{ background: "#1677ff11", borderRadius: 18, padding: 12, marginBottom: 10 }}>
                    <FaLock size={32} color="#1677ff" />
                </div>
                <h2
                    style={{
                        textAlign: 'center',
                        marginBottom: 18,
                        fontWeight: 900,
                        color: '#1677ff',
                        letterSpacing: 0.7,
                        fontSize: 25
                    }}
                >
                    Reset Password
                </h2>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <div className="form-group mb-3">
                        <input
                            type="password"
                            className="form-control rounded-pill px-4 py-2"
                            placeholder="New password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            minLength={6}
                            required
                            style={{ fontSize: 16 }}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            type="password"
                            className="form-control rounded-pill px-4 py-2"
                            placeholder="Confirm new password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                            style={{ fontSize: 16 }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary rounded-pill w-100 fw-semibold"
                        style={{
                            fontSize: 18,
                            padding: '10px 0',
                            letterSpacing: 0.6,
                            boxShadow: "0 2px 10px #1677ff13"
                        }}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Reset Password"}
                    </button>
                </form>
                {msg && (
                    <div
                        className="alert mt-3 text-center"
                        style={{
                            color: msg.includes("✅") ? "#368a1d" : "#d32f2f",
                            background: msg.includes("✅") ? "#e9fce7" : "#ffecec",
                            borderRadius: 16,
                            fontWeight: 600,
                            fontSize: 15,
                            padding: '10px 8px 9px 8px',
                            minWidth: 160,
                            marginTop: 15,
                            boxShadow: '0 2px 10px 0 #1677ff11'
                        }}
                    >
                        {msg}
                    </div>
                )}
                {msg.includes("successful") && (
                    <div className="text-center mt-3">
                        <Link
                            to="/login"
                            className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow"
                            style={{
                                fontSize: 17,
                                letterSpacing: 0.9,
                                boxShadow: "0 2px 10px #1677ff16"
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
