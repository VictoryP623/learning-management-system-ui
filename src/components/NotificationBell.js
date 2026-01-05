import React, { useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useNavigate } from "react-router-dom";
import {
    listNotifications,
    unreadCount,
    markRead,
    markAllRead,
} from "../services/notificationService";

const WS_BASE = process.env.REACT_APP_WS_BASE || "http://localhost:8081";
const WS_ENDPOINT = `${WS_BASE}/ws`;
const TOPIC = "/user/queue/notifications";

export default function NotificationBell() {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("ALL");

    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);

    const [page, setPage] = useState(0);
    const size = 20;
    const [last, setLast] = useState(true);
    const [loading, setLoading] = useState(false);

    const mountedRef = useRef(false);

    // sessionKey: đổi token => đổi session => reset & reconnect WS
    const token = localStorage.getItem("accessToken") || "";
    const sessionKey = token ? token.slice(-16) : "guest";

    const visibleItems = useMemo(() => {
        if (tab === "UNREAD") return items.filter((x) => !x.readFlag);
        return items;
    }, [items, tab]);

    // Reset state khi đổi account / logout
    useEffect(() => {
        setOpen(false);
        setTab("ALL");
        setItems([]);
        setUnread(0);
        setPage(0);
        setLast(true);
        setLoading(false);
    }, [sessionKey]);

    // initial unread count (refetch theo session)
    useEffect(() => {
        mountedRef.current = true;

        (async () => {
            try {
                const t = localStorage.getItem("accessToken");
                if (!t) {
                    if (mountedRef.current) setUnread(0);
                    return;
                }
                const c = await unreadCount();
                if (mountedRef.current) setUnread(Number(c || 0));
            } catch { }
        })();

        return () => {
            mountedRef.current = false;
        };
    }, [sessionKey]);

    // load first page when open
    useEffect(() => {
        if (!open) return;
        if (items.length > 0) return;

        (async () => {
            setLoading(true);
            try {
                const page0 = await listNotifications(0, size);
                const content = page0?.data || page0?.content || [];
                setItems(content);

                try {
                    const c = await unreadCount();
                    setUnread(Number(c || 0));
                } catch { }

                setPage(0);
                const computedLast = (page0.pageNumber + 1) >= page0.totalPages;
                setLast(Boolean(computedLast));
            } finally {
                setLoading(false);
            }
        })();
    }, [open, items.length]);

    // websocket connect (reconnect theo sessionKey)
    useEffect(() => {
        const t = localStorage.getItem("accessToken");
        if (!t) return;

        const sock = new SockJS(WS_ENDPOINT);
        const c = new Client({
            webSocketFactory: () => sock,
            reconnectDelay: 3000,
            connectHeaders: { Authorization: `Bearer ${t}` },
            onConnect: () => {
                c.subscribe(TOPIC, (msg) => {
                    try {
                        const notif = JSON.parse(msg.body);
                        setItems((prev) => {
                            if (notif?.id && prev.some((x) => x.id === notif.id)) return prev;
                            return [notif, ...prev];
                        });
                        if (!notif?.readFlag) setUnread((u) => u + 1);
                    } catch { }
                });
            },
        });

        c.activate();

        return () => {
            try {
                c.deactivate();
            } catch { }
        };
    }, [sessionKey]);

    const onLoadMore = async () => {
        if (loading || last) return;
        const next = page + 1;

        setLoading(true);
        try {
            const res = await listNotifications(next, size);
            const content = res?.data || res?.content || [];
            setItems((prev) => [...prev, ...content]);
            setPage(next);
            const computedLast = (res.pageNumber + 1) >= res.totalPages;
            setLast(Boolean(computedLast));
        } finally {
            setLoading(false);
        }
    };

    const onMarkRead = async (id) => {
        try {
            await markRead(id);
            setItems((prev) =>
                prev.map((it) => (it.id === id ? { ...it, readFlag: true } : it))
            );
            setUnread((u) => Math.max(0, u - 1));
        } catch { }
    };

    const onMarkAll = async () => {
        try {
            await markAllRead();
            setItems((prev) => prev.map((it) => ({ ...it, readFlag: true })));
            setUnread(0);
        } catch { }
    };

    const resolveNotificationPath = (n) => {
        // parse courseId từ dataJson nếu có
        let courseId = null;
        try {
            const data = n?.dataJson ? JSON.parse(n.dataJson) : null;
            courseId = data?.courseId ?? null;
        } catch { }

        // ưu tiên mapping theo topic (ổn định, không phụ thuộc linkUrl)
        switch (n?.topic) {
            case "INSTRUCTOR_COURSE_APPROVED":
            case "INSTRUCTOR_COURSE_REJECTED":
                // theo routes.js của bạn: /instructor/course/:id
                return courseId ? `/instructor/course/${courseId}` : "/instructor-dashboard";

            case "ADMIN_COURSE_SUBMITTED":
                // theo routes.js của bạn: /courses/:id/review
                return courseId ? `/course/${courseId}` : "/admin-dashboard";

            default: {
                // fallback: dùng linkUrl nhưng normalize + fix plural
                if (!n?.linkUrl) return null;
                let p = n.linkUrl.startsWith("/") ? n.linkUrl : `/${n.linkUrl}`;

                // backend đang trả /instructor/courses/:id nhưng FE route là /instructor/course/:id
                p = p.replace(/^\/instructor\/courses\/(\d+)$/, "/instructor/course/$1");

                return p;
            }
        }
    };

    const onOpenLink = async (n) => {
        if (!n.readFlag) await onMarkRead(n.id);

        const path = resolveNotificationPath(n);
        if (path) {
            navigate(path);
            setOpen(false);
        }
    };


    return (
        <div style={styles.wrap}>
            <button onClick={() => setOpen((o) => !o)} style={styles.bellBtn} title="Notifications">
                <span style={styles.bellIcon}>🔔</span>
                {unread > 0 && <span style={styles.badge}>{unread > 99 ? "99+" : unread}</span>}
            </button>

            {open && (
                <div style={styles.popover}>
                    <div style={styles.header}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={styles.title}>Notifications</div>
                            {unread > 0 && <div style={styles.unreadPill}>{unread} unread</div>}
                        </div>
                        <button onClick={onMarkAll} style={styles.linkBtn}>Mark all read</button>
                    </div>

                    <div style={styles.tabs}>
                        <button onClick={() => setTab("ALL")} style={tab === "ALL" ? styles.tabActive : styles.tab}>All</button>
                        <button onClick={() => setTab("UNREAD")} style={tab === "UNREAD" ? styles.tabActive : styles.tab}>Unread</button>
                    </div>

                    <div style={styles.list}>
                        {loading && items.length === 0 && <div style={styles.empty}>Loading...</div>}
                        {!loading && visibleItems.length === 0 && <div style={styles.empty}>No notifications</div>}

                        {visibleItems.map((n) => (
                            <div
                                key={n.id}
                                style={{ ...styles.item, background: n.readFlag ? "#fff" : "#f6f7ff" }}
                                onClick={() => onOpenLink(n)}
                                role="button"
                                tabIndex={0}
                            >
                                <div style={styles.left}>
                                    <div style={styles.icon}>{iconOf(n.type)}</div>
                                    {!n.readFlag && <div style={styles.dot} />}
                                </div>

                                <div style={styles.body}>
                                    <div style={styles.row1}>
                                        <div style={styles.itemTitle}>{n.title}</div>
                                        {!n.readFlag && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
                                                style={styles.miniBtn}
                                            >
                                                Mark read
                                            </button>
                                        )}
                                    </div>

                                    <div style={styles.msg}>{n.message}</div>

                                    <div style={styles.meta}>
                                        <span style={styles.topic}>{n.topic}</span>
                                        <span style={styles.sep}>•</span>
                                        <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.footer}>
                        {!last ? (
                            <button onClick={onLoadMore} style={styles.loadMore} disabled={loading}>
                                {loading ? "Loading..." : "Load more"}
                            </button>
                        ) : (
                            <div style={styles.footerHint}>You’re all caught up.</div>
                        )}
                    </div>
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

const styles = {
    wrap: { position: "relative", display: "inline-block" },
    bellBtn: {
        position: "relative",
        width: 40,
        height: 40,
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "#fff",
        cursor: "pointer",
    },
    bellIcon: { fontSize: 18 },
    badge: {
        position: "absolute",
        top: -6,
        right: -6,
        background: "#dc2626",
        color: "#fff",
        fontSize: 12,
        padding: "2px 6px",
        borderRadius: 999,
        border: "2px solid #fff",
        lineHeight: 1.2,
    },
    popover: {
        position: "absolute",
        right: 0,
        marginTop: 10,
        width: 420,
        maxHeight: "70vh",
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 10px 25px rgba(0,0,0,.12)",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
    },
    header: {
        padding: "10px 12px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { fontWeight: 700, fontSize: 14 },
    unreadPill: {
        fontSize: 12,
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "#f8fafc",
        color: "#111827",
    },
    linkBtn: {
        fontSize: 12,
        color: "#2563eb",
        background: "transparent",
        border: "none",
        cursor: "pointer",
    },
    tabs: { padding: 8, display: "flex", gap: 8, borderBottom: "1px solid #f1f5f9" },
    tab: {
        fontSize: 12,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "#fff",
        cursor: "pointer",
    },
    tabActive: {
        fontSize: 12,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #c7d2fe",
        background: "#eef2ff",
        cursor: "pointer",
        fontWeight: 600,
    },
    list: { overflow: "auto", maxHeight: "55vh" },
    empty: { padding: 14, fontSize: 13, color: "#6b7280" },
    item: { padding: 12, display: "flex", gap: 10, borderBottom: "1px solid #f3f4f6", cursor: "pointer" },
    left: { width: 36, position: "relative", display: "flex", alignItems: "center" },
    icon: { width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" },
    dot: { position: "absolute", right: 2, top: 6, width: 8, height: 8, borderRadius: 999, background: "#2563eb" },
    body: { flex: 1, minWidth: 0 },
    row1: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
    itemTitle: { fontWeight: 700, fontSize: 13, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    miniBtn: { fontSize: 12, color: "#2563eb", background: "transparent", border: "none", cursor: "pointer", flexShrink: 0 },
    msg: { fontSize: 13, color: "#374151", marginTop: 4 },
    meta: { fontSize: 12, color: "#9ca3af", marginTop: 6, display: "flex", gap: 6, alignItems: "center" },
    topic: { fontSize: 11, padding: "2px 6px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#f8fafc", color: "#6b7280" },
    sep: { opacity: 0.7 },
    footer: { padding: 10, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "center" },
    loadMore: { fontSize: 13, border: "1px solid #e5e7eb", background: "#fff", borderRadius: 10, padding: "7px 12px", cursor: "pointer" },
    footerHint: { fontSize: 12, color: "#9ca3af" },
};
