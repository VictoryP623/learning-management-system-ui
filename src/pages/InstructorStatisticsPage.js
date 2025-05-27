import React, { useEffect, useState } from 'react';

// Hàm fetch thông tin profile user
const getUserProfile = async (token) => {
    const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Không lấy được thông tin user');
    return await res.json();
};

const getInstructorIdByUserId = async (token, userId) => {
    const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/instructors/by-user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Không lấy được instructorId');
    return await res.json();
};

const getEarnings = async (token, instructorId) => {
    const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/instructors/${instructorId}/earnings`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Không lấy được earnings');
    const body = await res.json();
    return body.data;
};

const InstructorStatisticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [earnings, setEarnings] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const user = await getUserProfile(token);
                const instructorIdObj = await getInstructorIdByUserId(token, user.id);
                const instructorId = instructorIdObj.id || instructorIdObj; // Có thể trả về số trực tiếp
                const earningList = await getEarnings(token, instructorId);
                setEarnings(earningList || []);
                setTotal((earningList || []).reduce((acc, item) => acc + (item.revenue || 0), 0));
            } catch (e) {
                alert(e.message || 'Đã có lỗi xảy ra');
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading)
        return (
            <div style={{
                minHeight: "75vh",
                background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 26
            }}>
                Đang tải dữ liệu...
            </div>
        );

    return (
        <div style={{
            minHeight: "75vh",
            background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
            padding: "0 0 60px 0"
        }}>
            <div style={{
                maxWidth: 850,
                margin: "0 auto",
                padding: "54px 0 0 0"
            }}>
                <div style={{
                    background: "#fff",
                    borderRadius: 18,
                    boxShadow: "0 8px 28px #1677ff28",
                    padding: "38px 38px 30px 38px",
                }}>
                    <h2 style={{
                        textAlign: 'center',
                        fontWeight: 800,
                        color: "#1566c2",
                        letterSpacing: 0.1,
                        marginBottom: 32
                    }}>
                        Thống kê doanh số khoá học
                    </h2>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            borderRadius: 12,
                            background: "#fafcff",
                            fontSize: 17,
                            marginBottom: 0,
                            overflow: "hidden",
                            boxShadow: "0 2px 8px #e9f0ff17"
                        }}>
                            <thead>
                                <tr style={{ background: "#e9f4ff" }}>
                                    <th style={thStyle}>ID khoá học</th>
                                    <th style={thStyle}>Tên khoá học</th>
                                    <th style={thStyle}>Đã bán</th>
                                    <th style={thStyle}>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earnings.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{
                                            textAlign: "center",
                                            color: "#aaa",
                                            fontWeight: 500,
                                            padding: 34,
                                            fontSize: 17
                                        }}>
                                            Không có dữ liệu.
                                        </td>
                                    </tr>
                                )}
                                {earnings.map((item) => (
                                    <tr key={item.courseId}>
                                        <td style={tdStyle}>{item.courseId}</td>
                                        <td style={tdStyle}>{item.courseName}</td>
                                        <td style={tdStyle}>{item.soldCount || 0}</td>
                                        <td style={{ ...tdStyle, color: "#1cb061", fontWeight: 700 }}>
                                            {item.revenue ? item.revenue.toLocaleString() : 0} $
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={3} style={{
                                        ...tdStyle,
                                        background: "#f5fafd",
                                        fontWeight: 800,
                                        fontSize: 18,
                                        color: "#1677ff"
                                    }}>
                                        Tổng doanh thu
                                    </td>
                                    <td style={{
                                        ...tdStyle,
                                        background: "#f5fafd",
                                        fontWeight: 900,
                                        fontSize: 20,
                                        color: "#1cb061",
                                        letterSpacing: 0.4
                                    }}>
                                        {total.toLocaleString()} $
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const thStyle = {
    textAlign: "center",
    padding: "18px 10px",
    background: "#e9f4ff",
    fontWeight: 700,
    fontSize: 17,
    color: "#1566c2",
    letterSpacing: 0.1,
    borderBottom: "2px solid #e2eaf5"
};
const tdStyle = {
    padding: "14px 10px",
    borderBottom: "1.2px solid #f0f4fa",
    background: "#fff",
    textAlign: "center"
};

export default InstructorStatisticsPage;
