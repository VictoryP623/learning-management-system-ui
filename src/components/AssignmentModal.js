import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const DEFAULT_FORM = {
    title: '',
    description: '',
    dueAt: '',
    maxScore: 100
};

function AssignmentModal({ show, onHide, onSubmit, assignment }) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [error, setError] = useState('');

    useEffect(() => {
        if (assignment) {
            setForm({
                title: assignment.title || '',
                description: assignment.description || '',
                dueAt: assignment.dueAt ? assignment.dueAt.slice(0, 16) : '', // yyyy-MM-ddTHH:mm
                maxScore: assignment.maxScore ?? 100
            });
        } else {
            setForm(DEFAULT_FORM);
        }
        setError('');
    }, [assignment, show]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        if (!form.title.trim()) return 'Tiêu đề bài tập không được để trống!';
        if (form.maxScore == null || form.maxScore <= 0) return 'Điểm tối đa phải > 0!';
        return '';
    };

    const handleSubmit = () => {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        // Chuẩn hoá dueAt về ISO nếu có
        const payload = {
            title: form.title.trim(),
            description: form.description?.trim() || null,
            maxScore: Number(form.maxScore),
            dueAt: form.dueAt || null
        };

        onSubmit(payload);

    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{assignment ? 'Sửa bài tập' : 'Thêm bài tập'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Tiêu đề</Form.Label>
                        <Form.Control
                            value={form.title}
                            onChange={e => handleChange('title', e.target.value)}
                            placeholder="Ví dụ: Bài tập tuần 1"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={form.description}
                            onChange={e => handleChange('description', e.target.value)}
                            placeholder="Nội dung yêu cầu bài tập..."
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Hạn nộp</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={form.dueAt}
                                    onChange={e => handleChange('dueAt', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Điểm tối đa</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={form.maxScore}
                                    onChange={e => handleChange('maxScore', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
                {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    {assignment ? 'Lưu' : 'Thêm'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AssignmentModal;
