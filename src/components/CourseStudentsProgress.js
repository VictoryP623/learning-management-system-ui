// src/components/CourseStudentsProgress.js
import React, { useEffect, useMemo, useState } from 'react';
import { getCourseStudentsProgress } from '../services/api';

const tableWrapperStyle = {
    width: '100%',
    padding: '6px 6px 14px 6px',
    borderRadius: 16,
    background: '#f8fbff',
    boxShadow: '0 2px 16px rgba(0, 48, 110, 0.06)',
};

const tableStyle = {
    width: '100%',
    marginTop: 10,
    background: 'transparent',
};

// Helper: lấy số từ nhiều key khác nhau, fallback defaultValue
function pickNumber(obj, keys, defaultValue = 0) {
    for (const k of keys) {
        const v = obj?.[k];
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
        if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) {
            return Number(v);
        }
    }
    return defaultValue;
}

// Helper: lấy string từ nhiều key
function pickString(obj, keys, defaultValue = '') {
    for (const k of keys) {
        const v = obj?.[k];
        if (typeof v === 'string' && v.trim() !== '') return v;
    }
    return defaultValue;
}

// Format percent hiển thị đẹp
function formatPercent(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return '0%';
    return `${Math.round(n)}%`;
}

// Format score hiển thị (null => "-")
function formatScore(value) {
    if (value === null || value === undefined) return '-';
    const n = Number(value);
    if (Number.isNaN(n)) return '-';
    return n.toFixed(1);
}

// Gom thống kê cho 1 học viên (MAP ĐÚNG FIELD BE)
function getStudentStats(stu) {
    const studentName = pickString(stu, ['studentName', 'name', 'fullname'], 'N/A');
    const studentEmail = pickString(stu, ['studentEmail', 'email'], 'N/A');

    const completedLessons = pickNumber(stu, ['completedLessons', 'completedLessonCount', 'lessonsCompleted'], 0);
    const totalLessons = pickNumber(stu, ['totalLessons', 'totalLessonCount', 'lessonCount'], 0);

    const submittedAssignments = pickNumber(
        stu,
        ['submittedAssignments', 'submittedAssignmentsCount', 'assignmentsSubmitted'],
        0
    );
    const totalAssignments = pickNumber(stu, ['totalAssignments', 'totalAssignmentsCount', 'assignmentCount'], 0);

    // avgAssignmentScore: BE có thể trả null => giữ nguyên null
    const avgRaw = stu?.avgAssignmentScore;
    const avgAssignmentScore =
        avgRaw === null || avgRaw === undefined
            ? null
            : (Number.isNaN(Number(avgRaw)) ? null : Number(avgRaw));

    // Quizzes: BE của bạn đang trả quizzesAttempted
    const completedQuizzes = pickNumber(
        stu,
        ['completedQuizzes', 'completedQuizzesCount', 'quizzesCompleted', 'quizzesAttempted'],
        0
    );
    const totalQuizzes = pickNumber(stu, ['totalQuizzes', 'totalQuizzesCount', 'quizCount'], 0);

    // Progress: BE đang trả progressPercent (trong ảnh Network)
    const progressPercentage = pickNumber(
        stu,
        ['progressPercentage', 'progressPercent', 'progress'],
        0
    );

    return {
        studentId: stu?.studentId,
        studentName,
        studentEmail,
        completedLessons,
        totalLessons,
        submittedAssignments,
        totalAssignments,
        avgAssignmentScore,
        completedQuizzes,
        totalQuizzes,
        progressPercentage,
    };
}

// Modal “level 2” – xem chi tiết hơn cho 1 học viên
function StudentDetailModal({ stats, onClose }) {
    if (!stats) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1050,
            }}
        >
            <div
                style={{
                    width: '96%',
                    maxWidth: 540,
                    background: '#fff',
                    borderRadius: 20,
                    padding: '22px 22px 18px 22px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                    }}
                >
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1677ff' }}>
                            Chi tiết tiến độ học viên
                        </div>
                        <div style={{ fontWeight: 600 }}>{stats.studentName}</div>
                        <div style={{ fontSize: 13, color: '#66748b' }}>{stats.studentEmail}</div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            fontSize: 22,
                            lineHeight: 1,
                            cursor: 'pointer',
                            color: '#8c9bb0',
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Progress tổng thể */}
                <div style={{ marginBottom: 14 }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 13,
                            marginBottom: 4,
                            color: '#4b5a71',
                        }}
                    >
                        <span>Tiến độ tổng thể</span>
                        <span style={{ fontWeight: 600 }}>{formatPercent(stats.progressPercentage)}</span>
                    </div>
                    <div
                        style={{
                            height: 10,
                            borderRadius: 999,
                            background: '#e3edff',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${Math.min(100, Math.max(0, stats.progressPercentage || 0))}%`,
                                borderRadius: 999,
                                background: 'linear-gradient(90deg,#1677ff 0%,#49c6e5 100%)',
                            }}
                        />
                    </div>
                </div>

                {/* Khối chi tiết hơn */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        rowGap: 10,
                        fontSize: 14,
                        color: '#2a3648',
                    }}
                >
                    <div
                        style={{
                            padding: '8px 10px',
                            borderRadius: 12,
                            background: '#f5f9ff',
                        }}
                    >
                        <div style={{ fontSize: 13, color: '#6c7a91', marginBottom: 3 }}>Lessons</div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>
                            {stats.completedLessons}/{stats.totalLessons} bài đã hoàn thành
                        </div>
                        <div style={{ fontSize: 12.5, color: '#6c7a91' }}>
                            Học viên này đã hoàn thành {stats.completedLessons} trên tổng số{' '}
                            {stats.totalLessons} bài học trong khoá.
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '8px 10px',
                            borderRadius: 12,
                            background: '#f5fff7',
                        }}
                    >
                        <div style={{ fontSize: 13, color: '#6c7a91', marginBottom: 3 }}>Assignments</div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>
                            {stats.submittedAssignments}/{stats.totalAssignments} bài đã nộp
                            {stats.avgAssignmentScore != null && (
                                <span style={{ marginLeft: 6, fontWeight: 500 }}>
                                    – Điểm TB: {formatScore(stats.avgAssignmentScore)}
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: 12.5, color: '#6c7a91' }}>
                            Bao gồm tất cả bài tập thuộc các bài học trong khoá này.
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '8px 10px',
                            borderRadius: 12,
                            background: '#fff7f5',
                        }}
                    >
                        <div style={{ fontSize: 13, color: '#6c7a91', marginBottom: 3 }}>Quizzes</div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>
                            {stats.completedQuizzes}/{stats.totalQuizzes} quiz đã làm
                        </div>
                        <div style={{ fontSize: 12.5, color: '#6c7a91' }}>
                            Thống kê dựa trên số quiz đã attempt trong khoá.
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 16,
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-primary"
                        style={{
                            borderRadius: 999,
                            padding: '6px 22px',
                            fontWeight: 600,
                            fontSize: 14,
                        }}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

const CourseStudentsProgress = ({ courseId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('index'); // index | name | progress | avgScore

    // học viên đang chọn để hiện panel dưới bảng
    const [selectedStudent, setSelectedStudent] = useState(null);
    // modal level 2
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!courseId) return;
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setError('Bạn cần đăng nhập để xem danh sách học viên.');
                    setLoading(false);
                    return;
                }
                const res = await getCourseStudentsProgress(courseId, token);
                const data = res?.data?.data ?? res?.data ?? [];
                setStudents(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                setError('Không tải được danh sách học viên & tiến độ.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    const filteredAndSorted = useMemo(() => {
        let list = [...students];

        // Filter theo tên / email
        if (search.trim() !== '') {
            const keyword = search.trim().toLowerCase();
            list = list.filter((s) => {
                const name = pickString(s, ['studentName', 'name', 'fullname']).toLowerCase();
                const email = pickString(s, ['studentEmail', 'email']).toLowerCase();
                return name.includes(keyword) || email.includes(keyword);
            });
        }

        // Sort
        list.sort((a, b) => {
            if (sortBy === 'name') {
                const nameA = pickString(a, ['studentName', 'name', 'fullname']);
                const nameB = pickString(b, ['studentName', 'name', 'fullname']);
                return nameA.localeCompare(nameB);
            }
            if (sortBy === 'progress') {
                const pA = pickNumber(a, ['progressPercentage', 'progressPercent', 'progress'], 0);
                const pB = pickNumber(b, ['progressPercentage', 'progressPercent', 'progress'], 0);
                return pB - pA;
            }
            if (sortBy === 'avgScore') {
                const aAvg = a?.avgAssignmentScore;
                const bAvg = b?.avgAssignmentScore;

                const aVal = (aAvg === null || aAvg === undefined || Number.isNaN(Number(aAvg))) ? -1 : Number(aAvg);
                const bVal = (bAvg === null || bAvg === undefined || Number.isNaN(Number(bAvg))) ? -1 : Number(bAvg);

                // điểm cao lên trước; null xuống cuối (vì -1)
                return bVal - aVal;
            }
            // index: giữ nguyên thứ tự
            return 0;
        });

        return list;
    }, [students, search, sortBy]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '18px 0', fontWeight: 600 }}>
                Đang tải danh sách học viên...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '18px 0', color: 'red' }}>
                {error}
            </div>
        );
    }

    if (!students || students.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '18px 0', color: '#999' }}>
                Chưa có học viên nào đăng ký khoá học này.
            </div>
        );
    }

    // Stats cho student đang chọn (nếu có)
    const selectedStats = selectedStudent ? getStudentStats(selectedStudent) : null;

    return (
        <div>
            {/* Bộ lọc & sort */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    alignItems: 'center',
                    marginBottom: 10,
                }}
            >
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm theo tên hoặc email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        maxWidth: 260,
                        borderRadius: 999,
                        paddingInline: 16,
                        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                    }}
                />
                <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                        maxWidth: 220,
                        borderRadius: 999,
                        paddingInline: 12,
                        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                    }}
                >
                    <option value="index">Sắp xếp theo thứ tự</option>
                    <option value="name">Sắp xếp theo tên</option>
                    <option value="progress">Sắp xếp theo tiến độ</option>
                    <option value="avgScore">Sắp xếp theo điểm bài tập</option>
                </select>
            </div>

            {/* Bảng */}
            <div style={tableWrapperStyle}>
                <table className="table" style={tableStyle}>
                    <thead>
                        <tr style={{ color: '#1d3557', fontWeight: 600, fontSize: 15 }}>
                            <th style={{ width: 40 }}>#</th>
                            <th style={{ width: 180 }}>Học viên</th>
                            <th style={{ width: 210 }}>Email</th>
                            <th style={{ width: 100 }}>Lessons</th>
                            <th style={{ width: 130 }}>Assignments</th>
                            <th style={{ width: 90, textAlign: 'right' }}>Avg Assignment</th>
                            <th style={{ width: 90 }}>Quizzes</th>
                            <th style={{ width: 90, textAlign: 'right' }}>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSorted.map((stu, index) => {
                            const stats = getStudentStats(stu);
                            const isSelected = selectedStudent === stu;

                            return (
                                <tr
                                    key={stu.studentId ?? index}
                                    style={{
                                        fontSize: 14.5,
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#e8f3ff' : 'transparent',
                                    }}
                                    onClick={() =>
                                        setSelectedStudent((prev) => (prev === stu ? null : stu))
                                    }
                                >
                                    <td>{index + 1}</td>
                                    <td>{stats.studentName}</td>
                                    <td>{stats.studentEmail}</td>
                                    <td>{stats.completedLessons}/{stats.totalLessons}</td>
                                    <td>{stats.submittedAssignments}/{stats.totalAssignments}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {formatScore(stats.avgAssignmentScore)}
                                    </td>
                                    <td>{stats.completedQuizzes}/{stats.totalQuizzes}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                        {formatPercent(stats.progressPercentage)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Panel chi tiết cho học viên được chọn */}
            {selectedStats && (
                <div
                    style={{
                        marginTop: 18,
                        padding: '14px 18px 16px 18px',
                        borderRadius: 16,
                        background: '#ffffff',
                        boxShadow: '0 2px 16px rgba(0, 48, 110, 0.08)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 10,
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#1677ff' }}>
                                Chi tiết học viên
                            </div>
                            <div style={{ fontWeight: 600 }}>{selectedStats.studentName}</div>
                            <div style={{ fontSize: 13, color: '#66748b' }}>
                                {selectedStats.studentEmail}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            style={{ borderRadius: 999, fontWeight: 600 }}
                            onClick={() => setShowDetailModal(true)}
                        >
                            Xem chi tiết
                        </button>
                    </div>

                    {/* Progress bar tổng thể */}
                    <div style={{ marginBottom: 12 }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 13,
                                marginBottom: 4,
                                color: '#4b5a71',
                            }}
                        >
                            <span>Tiến độ tổng thể</span>
                            <span style={{ fontWeight: 600 }}>
                                {formatPercent(selectedStats.progressPercentage)}
                            </span>
                        </div>
                        <div
                            style={{
                                height: 10,
                                borderRadius: 999,
                                background: '#e3edff',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    height: '100%',
                                    width: `${Math.min(
                                        100,
                                        Math.max(0, selectedStats.progressPercentage || 0)
                                    )}%`,
                                    borderRadius: 999,
                                    background:
                                        'linear-gradient(90deg,#1677ff 0%,#49c6e5 100%)',
                                    transition: 'width 0.3s ease',
                                }}
                            />
                        </div>
                    </div>

                    {/* 3 card tóm tắt */}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 14,
                            fontSize: 14,
                            color: '#2a3648',
                        }}
                    >
                        <div
                            style={{
                                flex: '1 1 150px',
                                padding: '6px 10px',
                                borderRadius: 10,
                                background: '#f5f9ff',
                            }}
                        >
                            <div style={{ fontSize: 13, color: '#6c7a91' }}>Lessons</div>
                            <div style={{ fontWeight: 700 }}>
                                {selectedStats.completedLessons}/{selectedStats.totalLessons}
                            </div>
                        </div>
                        <div
                            style={{
                                flex: '1 1 170px',
                                padding: '6px 10px',
                                borderRadius: 10,
                                background: '#f5fff7',
                            }}
                        >
                            <div style={{ fontSize: 13, color: '#6c7a91' }}>
                                Assignments (đã nộp / tổng)
                            </div>
                            <div style={{ fontWeight: 700 }}>
                                {selectedStats.submittedAssignments}/{selectedStats.totalAssignments}
                                {selectedStats.avgAssignmentScore != null && (
                                    <span style={{ marginLeft: 6, fontWeight: 500 }}>
                                        – Avg:&nbsp;{formatScore(selectedStats.avgAssignmentScore)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div
                            style={{
                                flex: '1 1 150px',
                                padding: '6px 10px',
                                borderRadius: 10,
                                background: '#fff7f5',
                            }}
                        >
                            <div style={{ fontSize: 13, color: '#6c7a91' }}>Quizzes</div>
                            <div style={{ fontWeight: 700 }}>
                                {selectedStats.completedQuizzes}/{selectedStats.totalQuizzes}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal level 2 */}
            {showDetailModal && selectedStats && (
                <StudentDetailModal
                    stats={selectedStats}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
};

export default CourseStudentsProgress;
