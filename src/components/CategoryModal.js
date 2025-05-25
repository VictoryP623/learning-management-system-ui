import React, { useState, useEffect } from 'react';

const CategoryModal = ({ show, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        // Reset lại input mỗi khi modal show và initialData thay đổi
        if (show) {
            setName(initialData ? initialData.name : '');
        }
    }, [show, initialData]);

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99
        }}>
            <div style={{
                background: '#fff', borderRadius: 18, padding: 30, minWidth: 320, maxWidth: 400,
                boxShadow: '0 4px 24px #0003', textAlign: "center", position: "relative"
            }}>
                <h4>{initialData ? "Edit Category" : "Add Category"}</h4>
                <input
                    type="text"
                    className="form-control mb-3"
                    value={name}
                    placeholder="Category name"
                    onChange={e => setName(e.target.value)}
                />
                <div>
                    <button
                        className="btn btn-primary me-2"
                        onClick={() => onSubmit(name)}
                        disabled={!name.trim()}
                    >
                        {initialData ? "Update" : "Add"}
                    </button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;
