// src/pages/CourseReviewPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CourseReviewPage = () => {
    const { id } = useParams();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/courses/${id}/reviews`)
            .then((res) => res.json())
            .then((data) => {
                setReviews(data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Loading reviews...</p>;

    return (
        <div>
            <h2>Course Reviews</h2>
            <ul>
                {reviews.map((r, idx) => (
                    <li key={idx}>
                        <strong>{r.reviewerName}:</strong> {r.content}
                    </li>
                ))}
            </ul>
            {/* Thêm form gửi review nếu cần */}
        </div>
    );
};

export default CourseReviewPage;
