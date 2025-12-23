import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QuizModal from './QuizModal';

function QuizList({ lessonId, isEditing }) {
    const [quizzes, setQuizzes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    const fetchQuizzes = async () => {
        setLoading(true);
        setErr('');
        const token = localStorage.getItem('accessToken');
        try {
            const res = await axios.get(`http://localhost:8081/api/quizzes?lessonId=${lessonId}&page=0&size=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(res.data?.data?.content || res.data?.data || res.data?.content || []);
        } catch {
            setErr('Không tải được danh sách quiz!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lessonId) fetchQuizzes();
        // eslint-disable-next-line
    }, [lessonId, showModal]);

    const handleAdd = () => { setEditingQuiz(null); setShowModal(true); };
    const handleEdit = (quiz) => { setEditingQuiz(quiz); setShowModal(true); };
    const handleDelete = async (quizId) => {
        if (!window.confirm("Xóa câu hỏi này?")) return;
        const token = localStorage.getItem('accessToken');
        await axios.delete(`http://localhost:8081/api/quizzes/${quizId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchQuizzes();
    };
    const handleSubmit = async (quizData) => {
        const token = localStorage.getItem('accessToken');
        if (editingQuiz) {
            await axios.patch(`http://localhost:8081/api/quizzes/${editingQuiz.id}`, {
                ...quizData, lessonId
            }, { headers: { Authorization: `Bearer ${token}` } });
        } else {
            await axios.post(`http://localhost:8081/api/quizzes`, {
                ...quizData, lessonId
            }, { headers: { Authorization: `Bearer ${token}` } });
        }
        setShowModal(false);
    };

    if (!lessonId) return null;
    return (
        <div style={{ margin: "24px 0" }}>
            <h5>Quản lý câu hỏi trắc nghiệm</h5>
            {loading && <div>Đang tải...</div>}
            {err && <div style={{ color: 'red' }}>{err}</div>}
            <div>
                <button className="btn btn-success mb-2" onClick={handleAdd} disabled={!isEditing}>Thêm câu hỏi</button>
            </div>
            {quizzes.length === 0 && <div>Chưa có câu hỏi nào.</div>}
            {quizzes.map((quiz, idx) => (
                <div key={quiz.id} style={{ border: "1px solid #ddd", borderRadius: 7, margin: "8px 0", padding: 12 }}>
                    <div><b>Câu hỏi {idx + 1}:</b> {quiz.question}</div>
                    <div>Loại: {quiz.quizType === "ONE_CHOICE" ? "Một đáp án đúng" : "Nhiều đáp án đúng"}</div>
                    <div>
                        {quiz.answerOptions.map(a => (
                            <div key={a.keyValue} style={{ display: "inline-block", marginRight: 12 }}>
                                {a.text} {a.isCorrect ? <b style={{ color: "green" }}>(Đúng)</b> : ""}
                            </div>
                        ))}
                    </div>
                    <div className="mt-1">
                        <button className="btn btn-warning btn-sm" onClick={() => handleEdit(quiz)} disabled={!isEditing}>Sửa</button>{' '}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(quiz.id)} disabled={!isEditing}>Xóa</button>
                    </div>
                </div>
            ))}
            <QuizModal show={showModal} onHide={() => setShowModal(false)} onSubmit={handleSubmit} quizData={editingQuiz} />
        </div>
    );
}
export default QuizList;
