import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { uploadLessonResource } from '../services/api'; // Giả sử bạn đã tạo hàm này trong api.js

function UploadLessonResource() {
    const { lessonId } = useParams();
    const [file, setFile] = useState(null);
    const [resourceName] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!file) {
            setError('Chọn file để upload!');
            return;
        }
        try {
            await uploadLessonResource(lessonId, file, resourceName);
            setSuccess('Tải lên tài nguyên thành công!');
        } catch (err) {
            setError('Tải lên thất bại!');
        }
    };

    return (
        <div style={{ maxWidth: 480, margin: "40px auto", padding: 32, background: "#fff", borderRadius: 8 }}>
            <h3>Upload Resource cho bài học</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Chọn file (video/pdf/ảnh...)</label>
                    <input
                        className="form-control"
                        type="file"
                        onChange={e => setFile(e.target.files[0])}
                        required
                    />
                </div>
                <button className="btn btn-success" type="submit">Upload</button>
            </form>
            {success && <div style={{ color: "green", marginTop: 16 }}>{success}</div>}
            {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
        </div>
    );
}

export default UploadLessonResource;
