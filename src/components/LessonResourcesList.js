import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Button, Chip } from "@mui/material";

function guessLabel(url = "", type = "") {
    if (type) return type;
    const lower = (url || "").toLowerCase();
    if (lower.endsWith(".pdf")) return "PDF";
    if (/\.(jpg|jpeg|png|gif|webp)$/.test(lower)) return "IMAGE";
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "DOCX";
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return "XLSX";
    if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov")) return "VIDEO";
    return "FILE";
}

export default function LessonResourcesList({
    title = "Tài liệu đính kèm",
    resources = [],
    canDelete = false,
    onDelete,
}) {
    if (!resources || resources.length === 0) {
        return (
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
                Chưa có dữ liệu.
            </Typography>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
                {title}
            </Typography>

            <List>
                {resources.map((r) => (
                    <ListItem
                        key={r.id}
                        sx={{ bgcolor: "#f7fbff", borderRadius: 2, mb: 1 }}
                        secondaryAction={
                            canDelete ? (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => onDelete?.(r.id)}
                                    sx={{ fontWeight: 800, borderRadius: 2 }}
                                >
                                    Xóa
                                </Button>
                            ) : null
                        }
                    >
                        <ListItemText
                            primary={<span style={{ fontWeight: 800 }}>{r.name || "Tài liệu"}</span>}
                            secondary={
                                <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#1677ff", fontWeight: 700 }}
                                >
                                    Mở / Tải xuống
                                </a>
                            }
                        />
                        <Chip
                            label={guessLabel(r.url, r.type)}
                            size="small"
                            sx={{ ml: 2, fontWeight: 800 }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}
