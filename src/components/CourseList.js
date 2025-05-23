import React, { useState, useMemo } from 'react';

// CHỈ lấy status đúng theo backend:
const statusList = [
    "APPROVED",
    "REJECTED"
];

const CourseList = ({ courses, instructors, onChangeStatus }) => {
    const [selectedInstructor, setSelectedInstructor] = useState("");
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [pendingStatus, setPendingStatus] = useState("");

    const filteredCourses = useMemo(() => {
        if (!selectedInstructor) return courses;
        return courses.filter(c => c.instructorName === selectedInstructor);
    }, [courses, selectedInstructor]);

    const handleStatusChange = (courseId, currentStatus) => {
        setEditingCourseId(courseId);
        setPendingStatus(currentStatus === "PENDING" ? "APPROVED" : currentStatus);
    };

    const handleConfirm = (courseId) => {
        onChangeStatus(courseId, pendingStatus);
        setEditingCourseId(null);
        setPendingStatus("");
    };

    const handleCancel = () => {
        setEditingCourseId(null);
        setPendingStatus("");
    };

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <label htmlFor="instructor-filter"><b>Instructor: </b></label>
                <select
                    id="instructor-filter"
                    value={selectedInstructor}
                    onChange={e => setSelectedInstructor(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: 6 }}
                >
                    <option value="">All</option>
                    {instructors.map(inst => (
                        <option key={inst.id} value={inst.fullname || inst.name}>
                            {inst.fullname || inst.name}
                        </option>
                    ))}
                </select>
            </div>
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
                                    <select
                                        value={pendingStatus}
                                        onChange={e => setPendingStatus(e.target.value)}
                                        style={{ padding: '3px 10px', borderRadius: 6 }}
                                    >
                                        {statusList.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                ) : (
                                    // Hiển thị PENDING nếu status null/undefined/"" (chưa set)
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
