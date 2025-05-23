import React, { useState } from "react";
import { forgotPassword } from "../services/api";

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
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="card shadow p-4" style={{ width: 400 }}>
                <h2 className="text-center mb-4">Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <input
                            type="email"
                            required
                            className="form-control"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>
                {msg && <div className="alert mt-3" style={{ color: msg.includes("✅") ? "green" : "red" }}>{msg}</div>}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
