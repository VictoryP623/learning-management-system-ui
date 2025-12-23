import React, { useEffect, useState } from 'react';

const VerifyEmailPage = () => {
    const [message, setMessage] = useState('Đang xác thực...');
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) {
            setMessage('Link xác thực không hợp lệ.');
            setSuccess(false);
            return;
        }
        fetch(`http://localhost:8081/api/auth/verify?token=${token}`)
            .then(res => res.json())
            .then(data => {
                if (data.statusCode === 200) {
                    setMessage('✅ Xác thực thành công! Đang chuyển hướng về trang đăng nhập...');
                    setSuccess(true);
                    setTimeout(() => { window.location.href = "/login"; }, 1800);
                } else {
                    setMessage(data.error || data.message || "❌ Xác thực thất bại!");
                    setSuccess(false);
                }
            })
            .catch(() => {
                setMessage('Có lỗi xảy ra khi xác thực.');
                setSuccess(false);
            });
    }, []);

    return (
        <div
            style={{
                minHeight: '70vh',
                background: 'linear-gradient(100deg,#1677ff 0%,#49c6e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 22,
                    boxShadow: '0 4px 24px #00306e21',
                    padding: '44px 36px 36px 36px',
                    minWidth: 340,
                    maxWidth: 420,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <h2
                    style={{
                        textAlign: 'center',
                        marginBottom: 22,
                        fontWeight: 800,
                        color: '#1677ff',
                        letterSpacing: 0.5,
                    }}
                >
                    Xác thực Email
                </h2>
                <div
                    style={{
                        textAlign: 'center',
                        borderRadius: 18,
                        background: success === null
                            ? '#e3f2fd'
                            : success
                                ? '#e9fce7'
                                : '#ffecec',
                        color: success === null
                            ? '#1769aa'
                            : success
                                ? '#368a1d'
                                : '#d32f2f',
                        fontWeight: 600,
                        fontSize: 18,
                        padding: '18px 10px 16px 10px',
                        marginTop: 10,
                        minWidth: 220,
                        boxShadow: '0 2px 10px 0 #1677ff11'
                    }}
                >
                    {message}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
