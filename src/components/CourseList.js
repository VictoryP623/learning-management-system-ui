import React, { useState, useMemo } from 'react';

const statusList = [
    "APPROVED",
    "REJECTED"
];

const CourseList = ({ courses, onChangeStatus, search }) => {
    const [selectedInstructor] = useState("");
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [pendingStatus, setPendingStatus] = useState("");
    const [rejectReason, setRejectReason] = useState("");

    const filteredCourses = useMemo(() => {
        let arr = courses;
        if (selectedInstructor) arr = arr.filter(c => c.instructorName === selectedInstructor);
        if (search && search.trim() !== '') {
            arr = arr.filter(c =>
                (c.name || '')
                    .trim()
                    .toLowerCase()
                    .startsWith(search.trim().toLowerCase())
            );
        }
        return arr;
    }, [courses, selectedInstructor, search]);

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
        <div>
            
            <table className="table table-bordered" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>ID</th>
                        <th style={{ textAlign: "center" }}>Name</th>
                        <th style={{ textAlign: "center" }}>Price</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th style={{ textAlign: "center" }}>Created At</th>
                        <th style={{ textAlign: "center" }}>Updated At</th>
                        <th style={{ textAlign: "center", minWidth: 150 }}>Instructor</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {(filteredCourses && filteredCourses.length > 0) ? filteredCourses.map(course => (
                        <tr key={course.id}>
                            <td style={{ textAlign: "center" }}>{course.id}</td>
                            <td style={{ textAlign: "left" }}>{course.name}</td>
                            <td style={{ textAlign: "left" }}>{course.price}</td>
                            <td style={{ textAlign: "left", textTransform: "capitalize" }}>
                                {editingCourseId === course.id ? (
                                    <>
                                        <select
                                            value={pendingStatus}
                                            onChange={e => setPendingStatus(e.target.value)}
                                            style={{ padding: '3px 10px', borderRadius: 6 }}
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
                                                style={{ marginLeft: 8, minWidth: 180 }}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <span>
                                        {course.status
                                            ? course.status
                                            : "PENDING"}
                                    </span>
                                )}
                            </td>
                            <td style={{ textAlign: "left" }}>
                                {course.createdAt
                                    ? ("" + course.createdAt).split("T")[0]
                                    : (course.created_at ? ("" + course.created_at).split("T")[0] : "")
                                }
                            </td>
                            <td style={{ textAlign: "left" }}>
                                {course.updatedAt
                                    ? ("" + course.updatedAt).split("T")[0]
                                    : (course.updated_at ? ("" + course.updated_at).split("T")[0] : "")
                                }
                            </td>
                            <td style={{ textAlign: "left", maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {course.instructorName}
                            </td>
                            <td style={{ textAlign: "center" }}>
                                {editingCourseId === course.id ? (
                                    <>
                                        <button className="btn btn-success btn-sm" style={{ marginRight: 4 }} onClick={() => handleConfirm(course.id)}>Confirm</button>
                                        <button className="btn btn-secondary btn-sm" onClick={handleCancel}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(course.id, course.status || statusList[0])}>Change</button>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', color: '#888' }}>No courses found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CourseList;
