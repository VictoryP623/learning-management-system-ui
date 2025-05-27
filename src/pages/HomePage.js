import React, { useEffect, useState } from 'react';
import { getCourses } from '../services/api';
import Course from '../components/Course';
import { FaChalkboardTeacher, FaLaptopCode, FaRegClock, FaRocket } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const features = [
    {
        icon: <FaChalkboardTeacher size={34} color="#1677ff" />,
        title: "Giảng viên chuyên môn",
        desc: "Học hỏi từ các chuyên gia hàng đầu trong ngành và các nhà giáo dục có tay nghề cao."
    },
    {
        icon: <FaLaptopCode size={34} color="#00c4cc" />,
        title: "Học tập tương tác",
        desc: "Tham gia thông qua các dự án thực hành, câu đố và thảo luận."
    },
    {
        icon: <FaRegClock size={34} color="#ffc107" />,
        title: "Lịch trình linh hoạt",
        desc: "Học mọi lúc, mọi nơi — học theo tốc độ của riêng bạn."
    },
    {
        icon: <FaRocket size={34} color="#ff5b5b" />,
        title: "Tăng cường nghề nghiệp",
        desc: "Rèn luyện những kỹ năng giúp tăng cơ hội nghề nghiệp của bạn."
    }
];

const HomePage = () => {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            const data = await getCourses({ page: 0, limit: 99 });
            setCourses(Array.isArray(data.data) ? data.data : []);
        };
        fetchCourses();
    }, []);

    const handleCtaClick = () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            navigate("/courses");
        } else {
            navigate("/signup");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            width: "100%",
            background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
            paddingBottom: 0
        }}>
            {/* Features section */}
            <section style={{ background: "transparent", padding: "48px 0 18px 0" }}>
                <div className="container d-flex flex-column align-items-center">
                    <div style={{
                        background: "#fff",
                        borderRadius: 26,
                        boxShadow: "0 6px 32px #00306e18",
                        padding: "40px 18px",
                        margin: "0 auto 35px auto",
                        maxWidth: 1400,
                        width: "100%",
                    }}>
                        <h2 className="text-center mb-4 fw-bold"
                            style={{
                                color: "#1677ff",
                                fontWeight: 900,
                                fontSize: 32,
                                letterSpacing: 0.3,
                                marginBottom: 38
                            }}
                        >
                            Tại sao chọn LMS của chúng tôi?
                        </h2>
                        <div className="row justify-content-center">
                            {features.map((f, i) => (
                                <div className="col-12 col-sm-6 col-lg-3 mb-4" key={i}>
                                    <div
                                        className="p-4 h-100 text-center"
                                        style={{
                                            background: "#f8faff",
                                            borderRadius: 18,
                                            boxShadow: "0 2px 16px #00306e0c",
                                            transition: "transform 0.17s",
                                            minHeight: 220,
                                            border: "1.5px solid #e2e7f3"
                                        }}
                                    >
                                        <div style={{ marginBottom: 14 }}>{f.icon}</div>
                                        <div style={{ fontWeight: 700, color: "#23262a", fontSize: 18, marginBottom: 7 }}>{f.title}</div>
                                        <div style={{ color: "#5380c7", fontSize: 15 }}>{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            <section style={{ background: "transparent", padding: "0 0 28px 0" }}>
                <div className="container d-flex flex-column align-items-center">
                    <div style={{
                        background: "#fff",
                        borderRadius: 26,
                        boxShadow: "0 6px 32px #00306e16",
                        padding: "38px 10px 35px 10px",
                        margin: "0 auto",
                        maxWidth: 1280,
                        width: "100%",
                    }}>
                        <h2 className="text-center mb-4 fw-bold" style={{ color: "#1677ff", fontWeight: 900, fontSize: 28, letterSpacing: 0.3 }}>Khoá học nổi bật</h2>
                        <Course
                            courses={courses.slice(0, 6)}
                            emptyText="Không có khoá học nổi bật."
                        />
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta py-5" style={{
                background: "transparent",
                color: "#fff",
                padding: "32px 0 36px 0"
            }}>
                <div className="container text-center">
                    <div style={{
                        background: "#fff",
                        borderRadius: 22,
                        boxShadow: "0 3px 16px #00306e1b",
                        padding: "36px 18px",
                        maxWidth: 640,
                        margin: "0 auto"
                    }}>
                        <h2 className="fw-bold mb-3" style={{ color: "#1677ff", letterSpacing: 0.2, fontWeight: 900 }}>Sẵn sàng bắt đầu học?</h2>
                        <p className="lead mb-4" style={{ color: "#2b3759", fontWeight: 600, fontSize: 17 }}>
                            Đăng ký ngay và khám phá hàng trăm khoá học chất lượng!
                        </p>
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
                            onClick={handleCtaClick}
                        >
                            Đăng ký ngay
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
