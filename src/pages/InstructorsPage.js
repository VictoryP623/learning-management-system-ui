// src/pages/InstructorsPage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllInstructors } from '../services/api'; // API trả về toàn bộ instructors

// Hàm kiểm tra: search "chữ cái đầu của từng từ", và tiến theo input như bạn yêu cầu
function matchByWordProgressive(text, search) {
    if (!search) return true;
    if (!text) return false;
    const words = text.trim().toLowerCase().split(/\s+/);    // ['pham', 'chien', 'thang']
    const s = search.trim().toLowerCase();
    let idx = 0;
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let j = 0;
        while (j < word.length && idx < s.length && word[j] === s[idx]) {
            j++;
            idx++;
        }
        if (idx === s.length) return true; // matched hết search string
    }
    return false;
}

const InstructorsPage = () => {
    const [instructors, setInstructors] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await getAllInstructors({ name: '', page: 0, limit: 99 }, token);
                console.log('instructors:', res.data?.data);
                setInstructors(res.data?.data || []);
            } catch (error) {
                setInstructors([]);
            }
        };
        fetchInstructors();
    }, []);


    // Áp dụng filter theo kiểu chữ cái đầu từng từ và progressive như yêu cầu
    const filteredInstructors = instructors.filter(inst =>
        matchByWordProgressive(inst.fullname || inst.name || '', search)
    );

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">Danh sách Giảng viên</h2>
            <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm"
                className="form-control mb-3"
                style={{ maxWidth: 320 }}
            />
            <ul className="list-group">
                {filteredInstructors.length === 0 && (
                    <li className="list-group-item text-center">Không tìm thấy giảng viên phù hợp</li>
                )}
                <ul className="list-group">
                    {filteredInstructors.map(inst => (
                        <li
                            key={inst.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                            onClick={() => navigate(`/instructors/${inst.id}`, { state: inst })}
                            style={{ cursor: 'pointer' }}
                        >
                            <span>{inst.fullname}</span>
                        </li>
                    ))}
                </ul>


            </ul>
        </div>
    );
};

export default InstructorsPage;
