import React, { useState, useMemo } from 'react';

const statusList = [
    "APPROVED",
    "REJECTED"
];

const CourseList = ({ courses, onChangeStatus, search }) => {
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [pendingStatus, setPendingStatus] = useState("");
    const [rejectReason, setRejectReason] = useState("");

    const filteredCourses = useMemo(() => {
        let arr = courses;
        if (search && search.trim() !== '') {
            arr = arr.filter(c =>
                (c.name || '')
                    .trim()
                    .toLowerCase()
                    .startsWith(search.trim().toLowerCase())
            );
        }
        return arr;
    }, [courses, search]);

    const handleStatusChange = (courseId, currentStatus) => {
        setEditingCourseId(courseId);
        setPendingStatus(currentStatus === "PENDING" ? "APPROVED" : currentStatus);
        setRejectReason("");
    };

    const handleConfirm = (courseId) => {
        if (pendingStatus === "REJECTED" && !rejectReason.trim()) {
            alert("Vui lòng nhập lý do từ chối!");
            return;
        }
        onChangeStatus(courseId, pendingStatus, rejectReason);
        setEditingCourseId(null);
        setPendingStatus("");
        setRejectReason("");
    };

    const handleCancel = () => {
        setEditingCourseId(null);
        setPendingStatus("");
        setRejectReason("");
    };

    return (
        <div className="table-responsive">
            <table className="table align-middle table-hover" style={{ borderRadius: 14, overflow: "hidden" }}>
                <thead style={{ background: "#1677ff", color: "#fff" }}>
                    <tr>
                        <th className="text-center">ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Instructor</th>
                        <th className="text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCourses.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center text-secondary py-4">Không tìm thấy khóa học nào.</td>
                        </tr>
                    )}
                    {filteredCourses.map(course => (
                        <tr key={course.id}>
                            <td className="text-center">{course.id}</td>
                            <td>{course.name}</td>
                            <td>{course.price}</td>
                            <td className="text-capitalize">
                                {editingCourseId === course.id ? (
                                    <>
                                        <select
                                            value={pendingStatus}
                                            onChange={e => setPendingStatus(e.target.value)}
                                            className="form-select form-select-sm d-inline-block"
                                            style={{ maxWidth: 120, borderRadius: 18, display: "inline-block" }}
                                        >
                                            {statusList.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        {pendingStatus === "REJECTED" && (
                                            <input
                                                type="text"
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                                placeholder="Nhập lý do từ chối"
                                                className="form-control form-control-sm d-inline-block ms-2"
                                                style={{ minWidth: 160, borderRadius: 16 }}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <span>{course.status ? course.status : "PENDING"}</span>
                                )}
                            </td>
                            <td>{(course.createdAt || course.created_at || '').split("T")[0]}</td>
                            <td>{(course.updatedAt || course.updated_at || '').split("T")[0]}</td>
                            <td className="text-truncate" style={{ maxWidth: 180 }}>{course.instructorName}</td>
                            <td className="text-center">
                                {editingCourseId === course.id ? (
                                    <>
                                        <button className="btn btn-success btn-sm rounded-pill px-3 me-2" onClick={() => handleConfirm(course.id)}>Confirm</button>
                                        <button className="btn btn-secondary btn-sm rounded-pill px-3" onClick={handleCancel}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => handleStatusChange(course.id, course.status || statusList[0])}>Change</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CourseList;
