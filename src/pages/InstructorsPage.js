import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllInstructors } from '../services/api';
import { FaSearch } from 'react-icons/fa';

// Hàm search nâng cao như bạn yêu cầu
function matchByWordProgressive(text, search) {
    if (!search) return true;
    if (!text) return false;
    const words = text.trim().toLowerCase().split(/\s+/);
    const s = search.trim().toLowerCase();
    let idx = 0;
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let j = 0;
        while (j < word.length && idx < s.length && word[j] === s[idx]) {
            j++;
            idx++;
        }
        if (idx === s.length) return true;
    }
    return false;
}

const cardStyle = {
    border: "none",
    borderRadius: 18,
    background: "#fff",
    boxShadow: "0 4px 24px #00306e16",
    padding: "24px 20px 18px 20px",
    marginBottom: 18,
    minWidth: 240,
    maxWidth: 320,
    flex: "1 1 250px",
    cursor: "pointer",
    transition: "transform 0.16s, box-shadow 0.18s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
};

const avatarStyle = {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#1677ff22",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 27,
    color: "#1566c2",
    marginBottom: 13,
    overflow: "hidden",
    boxShadow: "0 2px 16px #1677ff16"
};

const InstructorsPage = () => {
    const [instructors, setInstructors] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await getAllInstructors({ name: '', page: 0, limit: 99 }, token);
                setInstructors(res.data?.data || []);
            } catch (error) {
                setInstructors([]);
            }
        };
        fetchInstructors();
    }, []);

    const filteredInstructors = instructors.filter(inst =>
        matchByWordProgressive(inst.fullname || inst.name || '', search)
    );

    // Tạo avatar text (lấy 2 ký tự đầu)
    const getAvatarText = (fullname) => {
        if (!fullname) return "";
        const words = fullname.split(" ");
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    return (
        <div style={{
            minHeight: "75vh",
            background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
            padding: "48px 0 38px 0"
        }}>
            <div className="container">
                <h2
                    className="text-center fw-bold mb-4"
                    style={{
                        color: "#fff",
                        letterSpacing: 0.12,
                        fontWeight: 900,
                        fontSize: 32,
                        textShadow: "0 2px 16px #00306e55, 0 0.5px 1px #1566c2"
                    }}
                >
                    Danh sách Giảng viên
                </h2>
                <div className="d-flex justify-content-center mb-4">
                    <div style={{ position: 'relative', width: 330 }}>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm kiếm theo tên, chữ cái đầu..."
                            className="form-control shadow-sm"
                            style={{
                                borderRadius: 16,
                                fontSize: 16,
                                paddingLeft: 38,
                                paddingRight: 8,
                                background: "#fff",
                                boxShadow: "0 1.5px 10px #1677ff09"
                            }}
                        />
                        <FaSearch style={{
                            position: "absolute",
                            left: 12,
                            top: 10,
                            color: "#1677ffbb",
                            fontSize: 18
                        }} />
                    </div>
                </div>
                <div style={{
                    background: "#fff",
                    borderRadius: 26,
                    boxShadow: "0 4px 36px #1677ff18",
                    padding: "32px 10px",
                    maxWidth: 1300,
                    margin: "0 auto"
                }}>
                    {filteredInstructors.length === 0 ? (
                        <div className="text-center py-5" style={{ color: "#888", fontSize: 19 }}>
                            Không tìm thấy giảng viên phù hợp
                        </div>
                    ) : (
                        <div
                            className="instructors-grid"
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "32px 24px",
                                justifyContent: "center",
                            }}
                        >
                            {filteredInstructors.map(inst => (
                                <div
                                    key={inst.id}
                                    style={cardStyle}
                                    onClick={() => navigate(`/instructors/${inst.id}`, { state: inst })}
                                    className="instructor-card"
                                    tabIndex={0}
                                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && navigate(`/instructors/${inst.id}`, { state: inst })}
                                    onMouseOver={e => { e.currentTarget.style.transform = "translateY(-5px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 8px 32px #1677ff22"; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px #00306e16"; }}
                                >
                                    <div style={avatarStyle}>
                                        {inst.avatarUrl
                                            ? <img src={inst.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                                            : getAvatarText(inst.fullname || inst.name)
                                        }
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 18, color: "#23262a", marginBottom: 3, textAlign: "center" }}>
                                        {inst.fullname}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorsPage;
