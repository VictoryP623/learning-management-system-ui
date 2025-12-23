import React, { useEffect, useState } from 'react';
import AssignmentModal from './AssignmentModal';
import {
    getAssignmentsByLesson,
    createAssignment,
    updateAssignment,
    deleteAssignment
} from '../services/api';

function AssignmentList({ lessonId, isEditing }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);

    const fetchAssignments = async () => {
        if (!lessonId) return;
        setLoading(true);
        setErr('');
        const token = localStorage.getItem('accessToken');
        try {
            const res = await getAssignmentsByLesson(lessonId, token);
            const data = res.data?.data || res.data || [];
            setAssignments(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setErr('Không tải được danh sách bài tập!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
        // eslint-disable-next-line
    }, [lessonId, showModal]);

    const handleAdd = () => {
        setEditingAssignment(null);
        setShowModal(true);
    };

    const handleEdit = (assignment) => {
        setEditingAssignment(assignment);
        setShowModal(true);
    };

    const handleDelete = async (assignmentId) => {
        if (!window.confirm('Xóa bài tập này?')) return;
        const token = localStorage.getItem('accessToken');
        try {
            await deleteAssignment(assignmentId, token);
            fetchAssignments();
        } catch (e) {
            console.error(e);
            alert('Xóa thất bại');
        }
    };

    const handleSubmit = async (payload) => {
        const token = localStorage.getItem('accessToken');
        try {
            if (editingAssignment) {
                await updateAssignment(editingAssignment.id, { ...payload, lessonId }, token);
            } else {
                await createAssignment({ ...payload, lessonId }, token);
            }
            setShowModal(false);
        } catch (e) {
            console.error(e);
            alert('Lưu bài tập thất bại!');
        }
    };

    if (!lessonId) return null;

    return (
        <div style={{ margin: '24px 0' }}>
            <h5>Bài tập (Assignment) của bài học</h5>
            {loading && <div>Đang tải...</div>}
            {err && <div style={{ color: 'red' }}>{err}</div>}

            <div className="mb-2">
                <button
                    className="btn btn-success"
                    onClick={handleAdd}
                    disabled={!isEditing}
                >
                    Thêm bài tập
                </button>
            </div>

            {assignments.length === 0 && !loading && (
                <div>Chưa có bài tập nào.</div>
            )}

            {assignments.map((a) => (
                <div
                    key={a.id}
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: 7,
                        margin: '8px 0',
                        padding: 12
                    }}
                >
                    <div><b>{a.title}</b></div>
                    {a.description && (
                        <div style={{ fontSize: 14, color: '#555' }}>
                            {a.description}
                        </div>
                    )}
                    <div style={{ fontSize: 13, color: '#777' }}>
                        Hạn nộp:{' '}
                        {a.dueAt
                            ? new Date(a.dueAt).toLocaleString('vi-VN')
                            : 'Không có'}
                        {a.maxScore != null && (
                            <> · Điểm tối đa: {a.maxScore}</>
                        )}
                    </div>
                    <div className="mt-1">
                        <button
                            className="btn btn-warning btn-sm me-1"
                            onClick={() => handleEdit(a)}
                            disabled={!isEditing}
                        >
                            Sửa
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(a.id)}
                            disabled={!isEditing}
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            ))}

            <AssignmentModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSubmit={handleSubmit}
                assignment={editingAssignment}
            />
        </div>
    );
}

export default AssignmentList;
