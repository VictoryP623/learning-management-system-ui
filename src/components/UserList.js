import React, { useState, useMemo } from 'react';

const roles = [
    { label: "All", value: "" },
    { label: "Admin", value: "Admin" },
    { label: "Instructor", value: "Instructor" },
    { label: "Student", value: "Student" },
];

// CHỈ dùng các status backend có:
const statusList = [
    "ACTIVE",
    "DEACTIVE",
    "NOT_VERIFY"
];

const UserList = ({ users, onChangeStatus }) => {
    const [selectedRole, setSelectedRole] = useState("");
    const [editingUserId, setEditingUserId] = useState(null);
    const [pendingStatus, setPendingStatus] = useState("");

    const filteredUsers = useMemo(() => {
        if (!selectedRole) return users;
        return users.filter(u =>
            u.role && u.role.toLowerCase() === selectedRole.toLowerCase()
        );
    }, [users, selectedRole]);

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
        <div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <label htmlFor="role-filter"><b>Role: </b></label>
                <select
                    id="role-filter"
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: 6 }}
                >
                    {roles.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                </select>
            </div>
            <table className="table table-bordered" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>ID</th>
                        <th style={{ textAlign: "center" }}>Full Name</th>
                        <th style={{ textAlign: "center" }}>Email</th>
                        <th style={{ textAlign: "center" }}>Role</th>
                        <th style={{ textAlign: "center" }}>Date of Birth</th>
                        <th style={{ textAlign: "center" }}>Address</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {(filteredUsers && filteredUsers.length > 0) ? filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td style={{ textAlign: "center" }}>{user.id}</td>
                            <td style={{ textAlign: "left" }}>{user.fullname || user.name}</td>
                            <td style={{ textAlign: "left" }}>{user.email}</td>
                            <td style={{ textAlign: "left" }}>{user.role}</td>
                            <td style={{ textAlign: "left" }}>
                                {user.birthdate
                                    ? ("" + user.birthdate).split("T")[0]
                                    : ""}
                            </td>
                            <td style={{ textAlign: "left" }}>{user.address}</td>
                            <td style={{ textAlign: "left" }}>
                                {editingUserId === user.id ? (
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
                                    <span style={{ textTransform: "capitalize" }}>{user.status || "ACTIVE"}</span>
                                )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                                {editingUserId === user.id ? (
                                    <>
                                        <button className="btn btn-success btn-sm" style={{ marginRight: 4 }} onClick={() => handleConfirm(user.id)}>Confirm</button>
                                        <button className="btn btn-secondary btn-sm" onClick={handleCancel}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(user.id, user.status || "ACTIVE")}>Change</button>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', color: '#888' }}>No users found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
