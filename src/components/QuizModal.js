import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const defaultAnswer = { text: '', isCorrect: false };

function QuizModal({ show, onHide, onSubmit, quizData }) {
    const [question, setQuestion] = useState('');
    const [quizType, setQuizType] = useState('ONE_CHOICE');
    const [answers, setAnswers] = useState([{ ...defaultAnswer }, { ...defaultAnswer }]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (quizData) {
            setQuestion(quizData.question);
            setQuizType(quizData.quizType);
            setAnswers(quizData.answerOptions.length ? quizData.answerOptions : [{ ...defaultAnswer }, { ...defaultAnswer }]);
        } else {
            setQuestion('');
            setQuizType('ONE_CHOICE');
            setAnswers([{ ...defaultAnswer }, { ...defaultAnswer }]);
        }
        setError('');
    }, [quizData, show]);

    const handleAnswerChange = (idx, field, value) => {
        setAnswers(prev =>
            prev.map((a, i) =>
                i === idx ? { ...a, [field]: value } : a
            )
        );
    };

    const addAnswer = () => setAnswers(prev => [...prev, { ...defaultAnswer }]);
    const removeAnswer = idx => setAnswers(prev => prev.filter((_, i) => i !== idx));

    const validate = () => {
        if (!question.trim()) return 'Câu hỏi không được để trống!';
        if (answers.length < 2) return 'Cần ít nhất 2 đáp án!';
        if (answers.some(a => !a.text.trim())) return 'Đáp án không được để trống!';
        const correctCount = answers.filter(a => a.isCorrect).length;
        if (quizType === 'ONE_CHOICE' && correctCount !== 1) return 'Chọn chính xác 1 đáp án đúng!';
        if (quizType === 'MULTI_CHOICE' && correctCount < 1) return 'Phải có ít nhất 1 đáp án đúng!';
        return '';
    };

    const handleSubmit = () => {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        onSubmit({
            question: question.trim(),
            quizType,
            answerOptions: answers.map((a, i) => ({
                text: a.text,
                isCorrect: !!a.isCorrect,
                keyValue: i + 1
            }))
        });
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{quizData ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Câu hỏi</Form.Label>
                        <Form.Control value={question} onChange={e => setQuestion(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mt-3">
                        <Form.Label>Loại câu hỏi</Form.Label>
                        <Form.Select value={quizType} onChange={e => setQuizType(e.target.value)}>
                            <option value="ONE_CHOICE">Một đáp án đúng</option>
                            <option value="MULTI_CHOICE">Nhiều đáp án đúng</option>
                        </Form.Select>
                    </Form.Group>
                    <div className="mt-3">
                        <b>Đáp án</b>
                        {answers.map((a, idx) => (
                            <Row key={idx} className="align-items-center mb-2">
                                <Col xs={7}>
                                    <Form.Control
                                        value={a.text}
                                        placeholder={`Đáp án ${idx + 1}`}
                                        onChange={e => handleAnswerChange(idx, 'text', e.target.value)}
                                    />
                                </Col>
                                <Col xs={3}>
                                    <Form.Check
                                        type={quizType === 'ONE_CHOICE' ? 'radio' : 'checkbox'}
                                        name="isCorrect"
                                        checked={!!a.isCorrect}
                                        onChange={e => {
                                            if (quizType === 'ONE_CHOICE') {
                                                setAnswers(ans => ans.map((ans, i) => ({
                                                    ...ans, isCorrect: i === idx
                                                })));
                                            } else {
                                                handleAnswerChange(idx, 'isCorrect', e.target.checked);
                                            }
                                        }}
                                        label="Đúng"
                                    />
                                </Col>
                                <Col xs={2}>
                                    {answers.length > 2 &&
                                        <Button variant="outline-danger" size="sm" onClick={() => removeAnswer(idx)}>Xóa</Button>
                                    }
                                </Col>
                            </Row>
                        ))}
                        <Button className="mt-1" variant="outline-primary" onClick={addAnswer}>Thêm đáp án</Button>
                    </div>
                </Form>
                {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Đóng</Button>
                <Button variant="primary" onClick={handleSubmit}>{quizData ? 'Lưu' : 'Thêm'}</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default QuizModal;
