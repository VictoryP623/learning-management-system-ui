import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const Hero = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const role = decoded.role;
                if (role === "Admin") navigate("/admin-dashboard");
                else if (role === "Instructor") navigate("/instructor-dashboard");
                else navigate("/my-courses"); // hoặc navigate("/profile");
            } catch {
                navigate("/signup"); // nếu token lỗi
            }
        } else {
            navigate("/signup");
        }
    };

    return (
        <section
            className="hero text-center"
            style={{
                background: 'linear-gradient(120deg,#1677ff 0%,#00306e 100%)',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center'
            }}
        >
            {/* Background shape */}
            <div
                style={{
                    position: 'absolute',
                    top: '-120px',
                    left: '-140px',
                    width: 450,
                    height: 300,
                    background: 'radial-gradient(circle,#fff4 40%,#0000 80%)',
                    zIndex: 1,
                    filter: 'blur(8px)'
                }}
            />
            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                <h1
                    className="display-4 fw-bold mb-3"
                    style={{
                        fontWeight: 900,
                        fontSize: '2.8rem',
                        letterSpacing: 0.2,
                        textShadow: '0 2px 8px #0001'
                    }}
                >
                    <span style={{
                        background: 'linear-gradient(90deg,#fff,#4fc3f7 80%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Learn&nbsp;From
                    </span>
                    <span style={{
                        background: 'linear-gradient(90deg,#ffc107,#fff176 80%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginLeft: 8
                    }}>
                        The&nbsp;Best
                    </span>
                </h1>
                <p className="lead mb-4" style={{
                    color: '#e1e8ff',
                    fontSize: '1.27rem',
                    fontWeight: 500,
                    textShadow: '0 1px 5px #0002'
                }}>
                    Mở khóa tiềm năng của bạn. Bắt đầu hành trình học tập cùng chúng tôi ngay hôm nay!
                </p>
                <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
                    <button
                        className="btn btn-warning btn-lg px-5 fw-bold shadow"
                        style={{
                            color: '#00306e',
                            borderRadius: 30,
                            fontSize: 20,
                            boxShadow: '0 3px 18px 0 #00306e22',
                            letterSpacing: 0.1,
                            border: 'none'
                        }}
                        onClick={handleGetStarted}
                    >
                        Get Started
                    </button>
                    <a
                        href="/courses"
                        className="btn btn-outline-light btn-lg px-5 fw-bold"
                        style={{
                            borderRadius: 30,
                            fontSize: 20,
                            letterSpacing: 0.1,
                            borderWidth: 2
                        }}
                    >
                        Browse Courses
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
