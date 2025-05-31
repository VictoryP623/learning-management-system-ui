import React, { useState, useMemo } from 'react';

const statusList = [
    "ACTIVE",
    "DEACTIVE",
    "NOT_VERIFY"
];

const UserList = ({ users, onChangeStatus, search }) => {
    const [editingUserId, setEditingUserId] = useState(null);
    const [pendingStatus, setPendingStatus] = useState("");

    const filteredUsers = useMemo(() => {
        let arr = users;
        if (search && search.trim() !== '') {
            arr = arr.filter(u =>
                (u.fullname || u.name || '')
                    .trim()
                    .toLowerCase()
                    .startsWith(search.trim().toLowerCase())
            );
        }
        return arr;
    }, [users, search]);

    const handleStatusChange = (userId, newStatus) => {
        setEditingUserId(userId);
        setPendingStatus(newStatus);
    };

    const handleConfirm = (userId) => {
        onChangeStatus(userId, pendingStatus);
        setEditingUserId(null);
        setPendingStatus("");
    };

    const handleCancel = () => {
        setEditingUserId(null);
        setPendingStatus("");
    };

    return (
        <div className="table-responsive">
            <table className="table align-middle table-hover" style={{ borderRadius: 14, overflow: "hidden" }}>
                <thead style={{ background: "#1677ff", color: "#fff" }}>
                    <tr>
                        <th className="text-center">ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Date of Birth</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th className="text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center text-secondary py-4">No users found.</td>
                        </tr>
                    )}
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td className="text-center">{user.id}</td>
                            <td>{user.fullname || user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.birthdate ? ("" + user.birthdate).split("T")[0] : ""}</td>
                            <td>{user.address}</td>
                            <td className="text-capitalize">
                                {editingUserId === user.id ? (
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
                                ) : (
                                    <span>{user.status || "ACTIVE"}</span>
                                )}
                            </td>
                            <td className="text-center">
                                {editingUserId === user.id ? (
                                    <>
                                        <button className="btn btn-success btn-sm rounded-pill px-3 me-2" onClick={() => handleConfirm(user.id)}>Confirm</button>
                                        <button className="btn btn-secondary btn-sm rounded-pill px-3" onClick={handleCancel}>Cancel</button>
                                    </>
                                ) : (
                                    <button
                                        className="btn btn-primary btn-sm rounded-pill px-3"
                                        onClick={() => handleStatusChange(user.id, user.status || "ACTIVE")}
                                        disabled={user.role && user.role.toLowerCase() === 'admin'}
                                        style={user.role && user.role.toLowerCase() === 'admin'
                                            ? { opacity: 0.6, pointerEvents: 'none', cursor: 'not-allowed' }
                                            : {}
                                        }
                                        title={user.role && user.role.toLowerCase() === 'admin'
                                            ? "Không thể đổi trạng thái Admin"
                                            : ""}
                                    >
                                        Change
                                    </button>
                                )}

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
