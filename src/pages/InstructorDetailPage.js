import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getCoursesbyInstructor } from '../services/api';
import Course from '../components/Course';
import { FaEnvelope } from "react-icons/fa";

const avatarStyle = {
    width: 84,
    height: 84,
    borderRadius: "50%",
    background: "#1677ff22",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: 34,
    color: "#1677ff",
    margin: "0 auto 14px auto",
    boxShadow: "0 2px 18px #1677ff16",
    overflow: "hidden"
};

// Helper for text avatar
function getAvatarText(fullname = "") {
    if (!fullname) return "";
    const words = fullname.split(" ");
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const InstructorDetailPage = () => {
    const { instructorId } = useParams();
    const location = useLocation();
    const instructor = location.state;
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            const resCourses = await getCoursesbyInstructor(instructorId, token);
            const approvedCourses = (resCourses.data.data || []).filter(
                course => course.status === "APPROVED"
            );
            setCourses(approvedCourses);
        };
        fetchData();
    }, [instructorId]);

    if (!instructor) return <div>Loading...</div>;

    return (
        <div
            style={{
                minHeight: "75vh",
                background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                padding: "50px 0"
            }}
        >
            <div className="container">
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 26,
                        boxShadow: "0 4px 36px #1677ff18",
                        padding: "38px 26px 24px 26px",
                        maxWidth: 540,
                        margin: "0 auto 40px auto",
                        textAlign: "center"
                    }}
                >
                    <div style={avatarStyle}>
                        {instructor.avatarUrl
                            ? <img src={instructor.avatarUrl} alt="avatar"
                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                            />
                            : getAvatarText(instructor.fullname || instructor.name)
                        }
                    </div>
                    <h2
                        style={{
                            color: "#1677ff",
                            fontWeight: 900,
                            fontSize: 30,
                            marginBottom: 6,
                            letterSpacing: 0.5
                        }}
                    >
                        {instructor.fullname || instructor.name}
                    </h2>
                    <div style={{ color: "#6c7a91", fontSize: 16, marginBottom: 6 }}>
                        <FaEnvelope style={{ marginRight: 7, color: "#1677ff" }} />
                        {instructor.email}
                    </div>
                </div>
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 22,
                        boxShadow: "0 2px 18px #1677ff13",
                        padding: "30px 24px 24px 24px",
                        maxWidth: 1080,
                        margin: "0 auto"
                    }}
                >
                    <h4
                        className="mb-3"
                        style={{
                            color: "#1677ff",
                            fontWeight: 800,
                            letterSpacing: 0.1,
                            textAlign: "center"
                        }}
                    >
                        Các khóa học của giảng viên
                    </h4>
                    <Course courses={courses} emptyText="Chưa có khoá học nào." />
                </div>
            </div>
        </div>
    );
};

export default InstructorDetailPage;
