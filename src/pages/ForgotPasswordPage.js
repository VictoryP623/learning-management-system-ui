import React, { useState } from "react";
import { forgotPassword } from "../services/api";
import { FaEnvelopeOpenText } from "react-icons/fa";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        setLoading(true);
        try {
            const res = await forgotPassword(email);
            if (res.ok) setMsg("✅ Check your email for reset instructions!");
            else setMsg("❌ Failed to send reset email.");
        } catch {
            setMsg("❌ Something went wrong.");
        }
        setLoading(false);
    };

    return (
        <div
            style={{
                minHeight: "70vh",
                background: "linear-gradient(110deg, #1677ff 0%, #49c6e5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 28,
                    boxShadow: "0 8px 40px #00306e22",
                    padding: "38px 32px 30px 32px",
                    minWidth: 320,
                    maxWidth: 410,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <div style={{ background: "#1677ff11", borderRadius: 18, padding: 12, marginBottom: 10 }}>
                    <FaEnvelopeOpenText size={32} color="#1677ff" />
                </div>
                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: 20,
                        fontWeight: 900,
                        color: "#1677ff",
                        letterSpacing: 0.7,
                        fontSize: 25,
                    }}
                >
                    Forgot Password
                </h2>
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <div className="form-group mb-3">
                        <input
                            type="email"
                            required
                            className="form-control rounded-pill px-4 py-2"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ fontSize: 16 }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary rounded-pill w-100 fw-semibold"
                        style={{
                            fontSize: 18,
                            padding: "10px 0",
                            letterSpacing: 0.7,
                            boxShadow: "0 2px 10px #1677ff13"
                        }}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
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
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
