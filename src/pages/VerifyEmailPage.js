import React, { useEffect, useState } from 'react';

const VerifyEmailPage = () => {
    const [message, setMessage] = useState('Đang xác thực...');
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) {
            setMessage('Link xác thực không hợp lệ.');
            return;
        }
        fetch(`http://localhost:8080/api/auth/verify?token=${token}`)
            .then(res => res.json())
            .then(data => {
                console.log("API response:", data);
                if (data.statusCode === 200) {
                    setMessage('Xác thực thành công! Bạn sẽ được chuyển về trang đăng nhập...');
                    setTimeout(() => { window.location.href = "/login"; }, 2000);
                } else {
                    setMessage(data.error || data.message || "Xác thực thất bại!");
                }
            })
            .catch(() => setMessage('Có lỗi xảy ra khi xác thực.'));
    }, []);

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">Xác thực Email</h2>
            <div className="alert alert-info text-center">{message}</div>
        </div>
    );
};
export default VerifyEmailPage;
