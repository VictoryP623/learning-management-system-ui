import React, { useMemo } from "react";
import StudentAssignmentItem from "./StudentAssignmentItem";

export default function StudentAssignmentLessonSection({ lesson, courseId }) {
    const assignments = useMemo(() => {
        const list = Array.isArray(lesson.assignments) ? lesson.assignments : [];
        // BE đã sort theo dueAt rồi; FE vẫn “safe sort” nếu muốn
        return list;
    }, [lesson.assignments]);

    if (!assignments.length) return null;

    return (
        <div style={{ marginBottom: 22 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 10,
                }}
            >
                <h4 style={{ margin: 0, fontWeight: 800 }}>
                    {lesson.lessonName || `Lesson ${lesson.lessonId}`}
                </h4>
                <span style={{ color: "#777" }}>
                    {assignments.length} assignment(s)
                </span>
            </div>

            <div className="d-flex flex-column gap-2">
                {assignments.map((a) => (
                    <StudentAssignmentItem
                        key={a.assignmentId}
                        assignment={a}
                        courseId={courseId}
                    />
                ))}
            </div>
        </div>
    );
}
