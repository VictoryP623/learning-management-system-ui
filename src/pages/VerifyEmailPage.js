// src/pages/VerifyEmailPage.js
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const VerifyEmailPage = () => {
    const [params] = useSearchParams();
    const [msg, setMsg] = useState("Verifying...");

    useEffect(() => {
        const token = params.get("token");
        if (!token) {
            setMsg("No token found.");
            return;
        }
        fetch(`/api/auth/verify?token=${token}`)
            .then(res => {
                if (res.ok) setMsg("Email verified! You can login now.");
                else setMsg("Verification failed.");
            });
    }, [params]);

    return (
        <div>
            <h2>Verify Email</h2>
            <p>{msg}</p>
        </div>
    );
};

export default VerifyEmailPage;
