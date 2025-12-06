// src/components/NotificationBell.jsx
import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { listNotifications, markRead, markAllRead } from "../services/notificationService";
import { jwtDecode } from "jwt-decode";

// BE WebSocket endpoint KHÔNG có /api
const WS_BASE = "http://localhost:8080";

// (Có thể giữ lại nếu bạn dùng nơi khác)
function getCurrentUserId() {
    const stored = localStorage.getItem("userId");
    if (stored) return Number(stored);

    const token = localStorage.getItem("accessToken");
    if (token && token.split(".").length === 3) {
        try {
            const payload = jwtDecode(token);
            return payload.id || payload.userId || payload.uid || null;
        } catch { }
    }
    return null;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);

    // state phân trang
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    const [last, setLast] = useState(true); // mặc định true để không load trước khi mở

    const clientRef = useRef(null);

    // FE subscribe cố định /user/queue/notifications để nhận convertAndSendToUser(..., "/queue/notifications", ...)
    const topic = "/user/queue/notifications";

    // chỉ load khi mở dropdown lần đầu
    useEffect(() => {
        if (!open || items.length > 0) return;
        (async () => {
            try {
                const page0 = await listNotifications(0, size);
                const content = page0?.data || page0?.content || [];
                setItems(content);
                setUnread(content.filter((x) => !x.readFlag).length);
                setPage(0);
                const computedLast = (page0.pageNumber + 1) >= page0.totalPages;
                setLast(computedLast);
            } catch { }
        })();
    }, [open, size, items.length]);

    // kết nối realtime (kèm JWT trong connectHeaders)
    useEffect(() => {
        const sock = new SockJS(`${WS_BASE}/ws`);
        const c = new Client({
            webSocketFactory: () => sock,
            reconnectDelay: 3000,
            connectHeaders: (() => {
                const token = localStorage.getItem("accessToken");
                return token ? { Authorization: `Bearer ${token}` } : {};
            })(),
            onConnect: () => {
                c.subscribe(topic, (msg) => {
                    try {
                        const notif = JSON.parse(msg.body);
                        setItems((prev) => [notif, ...prev]);
                        setUnread((u) => u + 1);
                    } catch { }
                });
            },
            // debug: (str) => console.log(str),
        });
        c.activate();
        clientRef.current = c;
        return () => c.deactivate();
    }, [topic]);

    //  load thêm trang tiếp theo
    const onLoadMore = async () => {
        const next = page + 1;
        const res = await listNotifications(next, size);
        const content = res?.data || res?.content || [];
        setItems((prev) => [...prev, ...content]);
        setPage(next);
        const computedLast = (res.pageNumber + 1) >= res.totalPages;
        setLast(computedLast);
    };

    const onMarkRead = async (id) => {
        await markRead(id);
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, readFlag: true } : it)));
        setUnread((u) => Math.max(0, u - 1));
    };

    const onMarkAll = async () => {
        await markAllRead();
        setItems((prev) => prev.map((it) => ({ ...it, readFlag: true })));
        setUnread(0);
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Notifications"
                style={{
                    position: "relative",
                    borderRadius: 999,
                    padding: 8,
                    background: "transparent",
                    border: "1px solid #e5e7eb",
                    cursor: "pointer",
                }}
                title="Notifications"
            >
                🔔
                {unread > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            background: "#dc2626",
                            color: "#fff",
                            fontSize: 12,
                            padding: "2px 6px",
                            borderRadius: 999,
                        }}
                    >
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        marginTop: 8,
                        width: 360,
                        maxHeight: "60vh",
                        overflow: "auto",
                        background: "#fff",
                        boxShadow: "0 10px 25px rgba(0,0,0,.1)",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            borderBottom: "1px solid #eee",
                        }}
                    >
                        <div style={{ fontWeight: 600 }}>Notifications</div>
                        <button
                            onClick={onMarkAll}
                            style={{
                                fontSize: 12,
                                color: "#2563eb",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Mark all as read
                        </button>
                    </div>

                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {items.length === 0 && (
                            <li style={{ padding: 12, fontSize: 14, color: "#6b7280" }}>No notifications</li>
                        )}
                        {items.map((n) => (
                            <li
                                key={n.id}
                                style={{
                                    padding: 12,
                                    borderBottom: "1px solid #f3f4f6",
                                    background: n.readFlag ? "#fff" : "#f9f9ff",
                                }}
                            >
                                <div style={{ display: "flex", gap: 8 }}>
                                    <span style={{ marginTop: 2 }}>{iconOf(n.type)}</span>
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div style={{ fontWeight: 600 }}>{n.title}</div>
                                            {!n.readFlag && (
                                                <button
                                                    onClick={() => onMarkRead(n.id)}
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#2563eb",
                                                        background: "transparent",
                                                        border: "none",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Mark read
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 14, color: "#374151" }}>{n.message}</div>
                                        {n.linkUrl && (
                                            <a href={n.linkUrl} style={{ fontSize: 12, color: "#2563eb" }}>
                                                Open
                                            </a>
                                        )}
                                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {!last && (
                        <div style={{ padding: 8, textAlign: "center" }}>
                            <button
                                onClick={onLoadMore}
                                style={{
                                    fontSize: 13,
                                    border: "1px solid #e5e7eb",
                                    background: "#fff",
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    cursor: "pointer",
                                }}
                            >
                                Load more
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function iconOf(t) {
    if (t === "SUCCESS") return "✅";
    if (t === "WARNING") return "⚠️";
    if (t === "ERROR") return "⛔";
    return "ℹ️";
}
