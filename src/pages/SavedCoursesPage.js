// src/pages/SavedCoursesPage.js
import React, { useEffect, useState } from "react";

const SavedCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    useEffect(() => {
        fetch("/api/saved-courses")
            .then(res => res.json())
            .then(data => setCourses(data.data || []));
    }, []);

    return (
        <div>
            <h2>Saved Courses</h2>
            <ul>
                {courses.map(course => (
                    <li key={course.id}>
                        <strong>{course.name}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SavedCoursesPage;
