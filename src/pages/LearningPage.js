// src/pages/LearningPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Button,
    Box,
    Typography,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
} from "@mui/material";

import {
    getCourseDetail,
    markLessonCompleted,
    getLessonDetail,
    getLessonsByCourse,
    getLessonResources,
    getAssignmentsByLesson,
    getMyAssignmentSubmissionSafe, // ✅ bắt buộc có
} from "../services/api";

import LessonQuiz from "../components/LessonQuiz";
import LessonAssignments from "../components/LessonAssignments";
import LessonResourcesList from "../components/LessonResourcesList";

const PLACEHOLDER_TEXT = "Chưa có nội dung, Sinh viên đợi Giảng viên update";

const isVideoUrl = (url = "", type = "") => {
    if ((type || "").toUpperCase() === "VIDEO") return true;
    const lower = (url || "").toLowerCase();
    return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.endsWith(".m3u8");
};

const fmtDuration = (sec) => {
    const s = Number(sec || 0);
    if (!s || s <= 0) return "";
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
};

const stepTitle = (type) => {
    switch (type) {
        case "DESCRIPTION":
            return "Mô tả bài học";
        case "DOCS":
            return "Tài liệu";
        case "MAIN_VIDEO":
            return "Video";
        case "QUIZ":
            return "Quiz";
        case "ASSIGNMENT":
            return "Assignment";
        case "CONFIRM":
            return "Hoàn tất bài học";
        default:
            return "Nội dung";
    }
};

/**
 * Local storage model (ONLY for in-progress progress, NOT completed truth)
 * - currentStepIndex: vị trí đang đứng
 * - maxStepIndex: vị trí xa nhất đã từng đạt tới (progress không tụt)
 * - done: map stepType -> boolean
 * - videoGatePassed: boolean (đã vượt yêu cầu duration)
 * - mode: LEARN | REVIEW (REVIEW chỉ phục vụ UI, truth completed vẫn lấy từ server)
 */
const storageKey = (lessonId) => `lessonProgress_${lessonId}`;

const loadLessonProgress = (lessonId) => {
    try {
        const raw = localStorage.getItem(storageKey(lessonId));
        if (!raw) return null;
        const parsed = JSON.parse(raw);

        // ✅ Backward-compat cleanup: nếu còn field "completed" từ phiên bản cũ thì bỏ đi
        if (parsed && Object.prototype.hasOwnProperty.call(parsed, "completed")) {
            const { completed, ...rest } = parsed;
            localStorage.setItem(storageKey(lessonId), JSON.stringify(rest));
            return rest;
        }

        return parsed;
    } catch {
        return null;
    }
};

const saveLessonProgress = (lessonId, data) => {
    // ✅ ensure we never persist legacy field "completed"
    const safe = { ...data };
    if (Object.prototype.hasOwnProperty.call(safe, "completed")) delete safe.completed;

    localStorage.setItem(storageKey(lessonId), JSON.stringify(safe));
    return safe;
};

const clearLessonProgress = (lessonId) => {
    try {
        localStorage.removeItem(storageKey(lessonId));
    } catch {
        // ignore
    }
};

const buildDefaultProgress = (lessonId, steps) => {
    const done = {};
    steps.forEach((s) => (done[s.type] = false));

    return {
        lessonId,
        mode: "LEARN",
        currentStepIndex: 0,
        maxStepIndex: 0,
        done,
        videoGatePassed: false,
    };
};

const computePercent = (steps, done) => {
    const total = steps.length || 1;
    const doneCount = steps.reduce((acc, s) => acc + (done?.[s.type] ? 1 : 0), 0);
    return Math.round((doneCount * 100) / total);
};

const LearningPage = () => {
    const { courseId } = useParams();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);

    // server truth
    const [completedLessons, setCompletedLessons] = useState([]); // array of lessonIds that server says completed

    const [loading, setLoading] = useState(true);

    const [resourceError, setResourceError] = useState("");
    const [completeLoading, setCompleteLoading] = useState(false);

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMsg, setDialogMsg] = useState("");

    // resources
    const [lessonResources, setLessonResources] = useState([]);

    // assignment existence
    const [assignmentRequired, setAssignmentRequired] = useState(false);

    // ✅ assignment gating by server
    const [assignmentId, setAssignmentId] = useState(null);
    const [checkingAssignment, setCheckingAssignment] = useState(false);

    // steps/progress
    const [lessonSteps, setLessonSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [lessonPercent, setLessonPercent] = useState(0);

    const [mode, setMode] = useState("LEARN"); // LEARN | REVIEW (REVIEW based on server completion)

    // gating
    const [videoGatePassed, setVideoGatePassed] = useState(false);
    const [videoGateRemaining, setVideoGateRemaining] = useState(0);
    const videoRef = useRef(null);

    const [quizDone, setQuizDone] = useState(false);

    // assignment done flag (must come from server)
    const [assignmentDone, setAssignmentDone] = useState(false);

    // hide lesson panel after complete
    const [hideLessonPanel, setHideLessonPanel] = useState(false);

    /**
     * Load course + lessons list
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("accessToken");

                const [courseRes, lessonsRes] = await Promise.all([
                    getCourseDetail(courseId, token),
                    getLessonsByCourse(courseId, token),
                ]);

                setCourse(courseRes.data);

                const lessonList = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
                setLessons(lessonList);

                // ✅ server truth
                const completedArr = lessonList.filter((l) => !!l.completed).map((l) => l.id);
                setCompletedLessons(completedArr);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchData();
    }, [courseId]);

    /**
     * Per lesson status map:
     * - COMPLETED: only if server says completed
     * - IN_PROGRESS: only if we have local progress
     * - NOT_STARTED: otherwise
     */
    const lessonStatusMap = useMemo(() => {
        const map = new Map();
        (lessons || []).forEach((l) => {
            const serverCompleted = !!l.completed;
            if (serverCompleted) {
                map.set(l.id, { status: "COMPLETED" });
                return;
            }

            const stored = loadLessonProgress(l.id);
            if (stored && typeof stored.currentStepIndex === "number") {
                map.set(l.id, { status: "IN_PROGRESS", stepIndex: stored.currentStepIndex });
                return;
            }

            map.set(l.id, { status: "NOT_STARTED" });
        });
        return map;
    }, [lessons]);

    const fetchLessonResources = async (lessonId, token) => {
        try {
            const res = await getLessonResources(lessonId, 0, 50, token);
            const list = Array.isArray(res?.data?.data) ? res.data.data : [];
            setLessonResources(list);
            return list;
        } catch (e) {
            setLessonResources([]);
            return [];
        }
    };

    // ✅ lấy assignment đầu tiên (nếu lesson có nhiều assignment thì bạn có thể đổi rule sau)
    const fetchFirstAssignment = async (lessonId, token) => {
        try {
            if (!getAssignmentsByLesson) return null;
            const res = await getAssignmentsByLesson(lessonId, token);

            // hỗ trợ cả 2 kiểu payload
            const list =
                Array.isArray(res?.data) ? res.data :
                    Array.isArray(res?.data?.data) ? res.data.data : [];

            return list.length ? list[0] : null;
        } catch {
            return null;
        }
    };

    const refreshAssignmentDone = async (asgIdOverride) => {
        const asgId = asgIdOverride ?? assignmentId;
        if (!asgId) return false;

        const token = localStorage.getItem("accessToken");
        setCheckingAssignment(true);
        try {
            const mySub = await getMyAssignmentSubmissionSafe(asgId, token);
            const submitted = !!mySub; // nếu cần strict: check mySub.status
            setAssignmentDone(submitted);
            return submitted;
        } catch (e) {
            console.error(e);
            setAssignmentDone(false);
            return false;
        } finally {
            setCheckingAssignment(false);
        }
    };

    /**
     * Steps builder:
     * - Always show DESCRIPTION/DOCS/VIDEO/QUIZ/CONFIRM
     * - ASSIGNMENT only if assignmentRequired = true
     */
    const buildStepsForLesson = (hasAssign) => {
        const base = [
            { type: "DESCRIPTION" },
            { type: "DOCS" },
            { type: "MAIN_VIDEO" },
            { type: "QUIZ" },
        ];
        if (hasAssign) base.push({ type: "ASSIGNMENT" });
        base.push({ type: "CONFIRM" });
        return base;
    };

    const resolveOpenBehavior = (lessonId) => {
        // ✅ completed truth: server only
        const isCompleted = completedLessons.includes(lessonId);

        if (isCompleted) {
            return { mode: "REVIEW", stepIndex: 0, videoGatePassed: true };
        }

        const stored = loadLessonProgress(lessonId);
        if (stored && typeof stored.currentStepIndex === "number") {
            return {
                mode: "LEARN",
                stepIndex: Math.max(0, stored.currentStepIndex),
                videoGatePassed: !!stored.videoGatePassed,
            };
        }

        return { mode: "LEARN", stepIndex: 0, videoGatePassed: false };
    };

    const hydrateProgressToState = (lessonId, steps, openMode, openStepIndex) => {
        const totalSteps = steps.length;

        // reset per lesson runtime states
        setQuizDone(false);

        if (openMode === "REVIEW") {
            setLessonPercent(100);
            setCurrentStepIndex(0);
            return;
        }

        const stored = loadLessonProgress(lessonId);
        const base = stored ?? buildDefaultProgress(lessonId, steps);

        // merge step list changes (assignment step may appear/disappear)
        const done = { ...(base.done || {}) };
        steps.forEach((s) => {
            if (typeof done[s.type] !== "boolean") done[s.type] = false;
        });

        // quiz done from stored
        setQuizDone(!!done["QUIZ"]);

        const idx = Math.min(openStepIndex, totalSteps - 1);
        const maxIdx = Math.max(base.maxStepIndex ?? 0, idx);

        const merged = {
            ...base,
            lessonId,
            mode: "LEARN",
            currentStepIndex: idx,
            maxStepIndex: maxIdx,
            done,
        };

        saveLessonProgress(lessonId, merged);

        setCurrentStepIndex(idx);
        setLessonPercent(computePercent(steps, merged.done));
    };

    const handleSelectLesson = async (lessonId) => {
        const lessonInList = lessons.find((l) => l.id === lessonId);
        if (lessonInList && lessonInList.locked) {
            setDialogMsg("Bài học này đang bị khóa. Hãy hoàn thành các bài trước đó để mở khóa.");
            setOpenDialog(true);
            return;
        }

        const token = localStorage.getItem("accessToken");
        try {
            setHideLessonPanel(false);
            setResourceError("");

            // reset per open
            setAssignmentId(null);
            setAssignmentRequired(false);
            setAssignmentDone(false);
            setCheckingAssignment(false);

            const openBehavior = resolveOpenBehavior(lessonId);
            setMode(openBehavior.mode);

            const res = await getLessonDetail(lessonId, token);
            const data = res.data;
            setSelectedLesson(data);

            await fetchLessonResources(lessonId, token);

            // assignment existence + check server submission
            const asg = await fetchFirstAssignment(lessonId, token);
            const hasAssign = !!asg;
            setAssignmentRequired(hasAssign);
            setAssignmentId(asg?.id || null);

            if (hasAssign && asg?.id && openBehavior.mode === "LEARN") {
                await refreshAssignmentDone(asg.id);
            } else if (openBehavior.mode === "REVIEW") {
                // review: coi như done
                setAssignmentDone(true);
            }

            const steps = buildStepsForLesson(hasAssign);
            setLessonSteps(steps);

            setVideoGatePassed(openBehavior.mode === "REVIEW" ? true : !!openBehavior.videoGatePassed);
            setVideoGateRemaining(0);

            hydrateProgressToState(lessonId, steps, openBehavior.mode, openBehavior.stepIndex);
        } catch (e) {
            console.error(e);
            setResourceError("Không tải được nội dung bài học!");
        }
    };

    const totalSteps = lessonSteps.length;
    const currentStep = totalSteps > 0 ? lessonSteps[Math.min(currentStepIndex, totalSteps - 1)] : null;

    const docs = (lessonResources || []).filter((r) => !isVideoUrl(r.url, r.type));
    const videosAttach = (lessonResources || []).filter((r) => isVideoUrl(r.url, r.type));

    const hasMainVideo = !!selectedLesson?.resourceUrl;
    const requiredVideoSec = Number(selectedLesson?.durationSec || 0);

    const persist = (patch) => {
        if (!selectedLesson) return;
        if (mode === "REVIEW") return;

        const lessonId = selectedLesson.id;
        const stored = loadLessonProgress(lessonId);
        const base = stored ?? buildDefaultProgress(lessonId, lessonSteps);

        const next = {
            ...base,
            ...patch,
            lessonId,
            mode: "LEARN",
        };

        // ensure done keys exist
        const done = { ...(next.done || {}) };
        lessonSteps.forEach((s) => {
            if (typeof done[s.type] !== "boolean") done[s.type] = false;
        });
        next.done = done;

        saveLessonProgress(lessonId, next);
        setLessonPercent(computePercent(lessonSteps, next.done));
    };

    const markStepDone = (stepType) => {
        if (!selectedLesson) return;
        if (mode === "REVIEW") return;

        const lessonId = selectedLesson.id;
        const stored = loadLessonProgress(lessonId);
        const base = stored ?? buildDefaultProgress(lessonId, lessonSteps);

        const done = { ...(base.done || {}) };
        done[stepType] = true;

        const maxStepIndex = Math.max(base.maxStepIndex ?? 0, currentStepIndex);

        const next = {
            ...base,
            lessonId,
            done,
            maxStepIndex,
            currentStepIndex,
            mode: "LEARN",
        };

        saveLessonProgress(lessonId, next);
        setLessonPercent(computePercent(lessonSteps, next.done));
    };

    /**
     * Next/Prev rules:
     * - REVIEW: free next/prev
     * - LEARN:
     *   - QUIZ: cannot next unless quizDone
     *   - MAIN_VIDEO: cannot next unless videoGatePassed OR no requiredVideoSec
     *   - ASSIGNMENT: cannot next unless assignmentDone (server)
     */
    const canGoPrev = useMemo(() => {
        if (!selectedLesson || !currentStep) return false;
        return currentStepIndex > 0;
    }, [selectedLesson, currentStep, currentStepIndex]);

    const canGoNext = useMemo(() => {
        if (!selectedLesson || !currentStep) return false;
        if (currentStep.type === "CONFIRM") return false;

        if (mode === "REVIEW") return true;

        if (currentStep.type === "QUIZ") return !!quizDone;

        if (currentStep.type === "MAIN_VIDEO") {
            if (videoGatePassed) return true;
            if (!requiredVideoSec || requiredVideoSec <= 0) return true;
            return videoGateRemaining <= 0;
        }

        if (currentStep.type === "ASSIGNMENT") {
            return !!assignmentDone;
        }

        return true;
    }, [
        selectedLesson,
        currentStep,
        mode,
        quizDone,
        videoGatePassed,
        requiredVideoSec,
        videoGateRemaining,
        assignmentDone,
    ]);

    const handlePrevStep = () => {
        if (!selectedLesson) return;
        const prevIndex = Math.max(currentStepIndex - 1, 0);
        setCurrentStepIndex(prevIndex);

        if (mode === "LEARN") {
            const stored = loadLessonProgress(selectedLesson.id);
            persist({
                currentStepIndex: prevIndex,
                maxStepIndex: Math.max(stored?.maxStepIndex ?? 0, prevIndex),
            });
        }
    };

    const handleNextStep = () => {
        if (!selectedLesson || !currentStep) return;
        if (!canGoNext) return;

        // Khi rời step (LEARN) thì mark step đó là done (trừ QUIZ/ASSIGNMENT/VIDEO có logic riêng)
        if (mode === "LEARN") {
            if (currentStep.type === "DESCRIPTION" || currentStep.type === "DOCS") {
                markStepDone(currentStep.type);
            }
        }

        const nextIndex = Math.min(currentStepIndex + 1, totalSteps - 1);
        setCurrentStepIndex(nextIndex);

        if (mode === "LEARN") {
            const stored = loadLessonProgress(selectedLesson.id);
            const maxIdx = Math.max(stored?.maxStepIndex ?? 0, nextIndex);
            persist({ currentStepIndex: nextIndex, maxStepIndex: maxIdx });
        }
    };

    const handleQuizFinished = () => {
        if (!selectedLesson) return;

        setQuizDone(true);
        if (mode === "LEARN") {
            markStepDone("QUIZ");
        }

        const idxAssignment = lessonSteps.findIndex((s) => s.type === "ASSIGNMENT");
        const idxConfirm = lessonSteps.findIndex((s) => s.type === "CONFIRM");

        let targetIdx = idxConfirm;
        if (idxAssignment !== -1) targetIdx = idxAssignment;

        if (targetIdx !== -1) {
            setCurrentStepIndex(targetIdx);
            if (mode === "LEARN") {
                const stored = loadLessonProgress(selectedLesson.id);
                const maxIdx = Math.max(stored?.maxStepIndex ?? 0, targetIdx);
                persist({ currentStepIndex: targetIdx, maxStepIndex: maxIdx });
            }
        }
    };

    /**
     * Video gate timeupdate
     * - Once passed => done MAIN_VIDEO + videoGatePassed true (monotonic)
     */
    useEffect(() => {
        if (!selectedLesson) return;

        if (mode === "REVIEW") {
            setVideoGateRemaining(0);
            setVideoGatePassed(true);
            return;
        }

        if (videoGatePassed) {
            setVideoGateRemaining(0);
            return;
        }

        if (currentStep?.type !== "MAIN_VIDEO") {
            setVideoGateRemaining(0);
            return;
        }

        if (!requiredVideoSec || requiredVideoSec <= 0) {
            setVideoGateRemaining(0);
            return;
        }

        const v = videoRef.current;
        if (!v) {
            setVideoGateRemaining(requiredVideoSec);
            return;
        }

        const onTimeUpdate = () => {
            const t = Math.floor(Number(v.currentTime || 0));
            const remain = Math.max(requiredVideoSec - t, 0);
            setVideoGateRemaining(remain);

            if (remain <= 0) {
                setVideoGatePassed(true);
                if (mode === "LEARN") {
                    markStepDone("MAIN_VIDEO");
                    persist({ videoGatePassed: true });
                }
            }
        };

        v.addEventListener("timeupdate", onTimeUpdate);
        onTimeUpdate();

        return () => {
            v.removeEventListener("timeupdate", onTimeUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLesson?.id, mode, currentStep?.type, requiredVideoSec, videoGatePassed]);

    const handleConfirmCompleteLesson = async () => {
        if (!selectedLesson) return;

        // ✅ HARD GATE chống bypass
        if (mode === "LEARN" && assignmentRequired && !assignmentDone) {
            setDialogMsg("Bài này có assignment. Bạn cần nộp assignment trước khi xác nhận hoàn thành.");
            setOpenDialog(true);
            return;
        }

        if (mode === "REVIEW") {
            setDialogMsg("Bạn đang ở chế độ Xem lại. Không cần xác nhận hoàn thành.");
            setOpenDialog(true);
            return;
        }

        setCompleteLoading(true);
        const token = localStorage.getItem("accessToken");

        try {
            // mark CONFIRM done locally (in case API slow), but truth still depends on server response
            markStepDone("CONFIRM");

            const res = await markLessonCompleted(selectedLesson.id, token);
            const data = res.data;

            // ✅ Once server confirms, we set server truth in UI + clear local progress for this lesson
            clearLessonProgress(selectedLesson.id);

            setLessonPercent(100);

            setCompletedLessons((prev) => {
                const base = Array.isArray(prev) ? prev : [];
                return base.includes(data.id) ? base : [...base, data.id];
            });

            setLessons((prev) => prev.map((l) => (l.id === data.id ? { ...l, completed: true } : l)));
            setSelectedLesson((prev) => (prev && prev.id === data.id ? { ...prev, completed: true } : prev));

            setHideLessonPanel(true);

            if (data.nextLessonId && !data.nextLessonLocked) {
                setDialogMsg(`Đã hoàn thành "${data.name || "bài học"}". Bạn có thể học tiếp "${data.nextLessonName}".`);
            } else if (data.nextLessonLocked) {
                setDialogMsg("Bạn đã hoàn thành bài này, nhưng bài tiếp theo đang bị khóa. Hãy kiểm tra điều kiện để mở khóa.");
            } else {
                setDialogMsg("Bạn đã hoàn thành bài học!");
            }
            setOpenDialog(true);
        } catch (err) {
            console.error(err);
            setDialogMsg("Không thể xác nhận hoàn thành bài học!");
            setOpenDialog(true);
        } finally {
            setCompleteLoading(false);
        }
    };

    const renderSectionBody = () => {
        if (!selectedLesson || !currentStep) return null;

        switch (currentStep.type) {
            case "DESCRIPTION":
                return !!selectedLesson?.description ? (
                    <Typography sx={{ mb: 2 }}>{selectedLesson.description}</Typography>
                ) : (
                    <Typography sx={{ mb: 2, color: "text.secondary", fontStyle: "italic" }}>{PLACEHOLDER_TEXT}</Typography>
                );

            case "DOCS":
                return docs.length > 0 ? (
                    <Box>
                        <LessonResourcesList title="File tài liệu" resources={docs} canDelete={false} />
                        {videosAttach.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography fontWeight={800} sx={{ mb: 1 }}>
                                    Video tài liệu (đính kèm)
                                </Typography>
                                <LessonResourcesList title="" resources={videosAttach} canDelete={false} />
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box>
                        <Typography sx={{ mb: 2, color: "text.secondary", fontStyle: "italic" }}>{PLACEHOLDER_TEXT}</Typography>
                        {videosAttach.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography fontWeight={800} sx={{ mb: 1 }}>
                                    Video tài liệu (đính kèm)
                                </Typography>
                                <LessonResourcesList title="" resources={videosAttach} canDelete={false} />
                            </Box>
                        )}
                    </Box>
                );

            case "MAIN_VIDEO": {
                if (!hasMainVideo) {
                    return <Typography sx={{ mb: 2, color: "text.secondary", fontStyle: "italic" }}>{PLACEHOLDER_TEXT}</Typography>;
                }

                const showGate = mode === "LEARN" && !videoGatePassed && requiredVideoSec > 0;

                return (
                    <Box sx={{ mt: 1 }}>
                        <video
                            ref={videoRef}
                            src={selectedLesson.resourceUrl}
                            controls
                            width="100%"
                            style={{
                                maxWidth: 720,
                                marginBottom: 10,
                                borderRadius: 10,
                                boxShadow: "0 2px 18px #1677ff15",
                            }}
                        />

                        {!!requiredVideoSec && requiredVideoSec > 0 && (
                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                                Yêu cầu xem tối thiểu: {fmtDuration(requiredVideoSec)}
                                {mode === "LEARN" && videoGatePassed && " (đã đạt)"}
                            </Typography>
                        )}

                        {showGate && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" sx={{ color: "warning.main", fontWeight: 700 }}>
                                    Bạn cần xem thêm: {fmtDuration(videoGateRemaining)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    Khi đủ thời lượng, nút “Tiếp tục” sẽ được mở.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                );
            }

            case "QUIZ":
                return (
                    <Box>
                        <LessonQuiz lessonId={selectedLesson.id} onFinished={handleQuizFinished} />
                        {mode === "LEARN" && !quizDone && (
                            <Typography sx={{ mt: 1, color: "text.secondary", fontStyle: "italic" }}>
                                Bạn cần hoàn thành quiz để mở nút “Tiếp tục”.
                            </Typography>
                        )}
                    </Box>
                );

            case "ASSIGNMENT":
                return (
                    <Box>
                        <LessonAssignments lessonId={selectedLesson.id} />

                        {mode === "LEARN" && (
                            <Box sx={{ mt: 2 }}>
                                {checkingAssignment ? (
                                    <Typography sx={{ color: "text.secondary" }}>
                                        Đang kiểm tra trạng thái nộp bài...
                                    </Typography>
                                ) : assignmentDone ? (
                                    <Typography sx={{ mt: 1, color: "success.main", fontWeight: 800 }}>
                                        Đã nộp assignment. Bạn có thể bấm “Tiếp tục”.
                                    </Typography>
                                ) : (
                                    <>
                                        <Typography sx={{ color: "text.secondary", mb: 1 }}>
                                            Bạn phải nộp assignment thì mới được hoàn tất bài học.
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            sx={{ fontWeight: 800, borderRadius: 3 }}
                                            onClick={async () => {
                                                const ok = await refreshAssignmentDone();
                                                if (!ok) {
                                                    setDialogMsg("Bạn chưa nộp bài. Hãy nộp assignment trước khi hoàn tất bài học.");
                                                    setOpenDialog(true);
                                                }
                                            }}
                                        >
                                            Tôi đã nộp rồi, kiểm tra lại
                                        </Button>
                                    </>
                                )}
                            </Box>
                        )}
                    </Box>
                );

            case "CONFIRM": {
                // ✅ completed truth: server only
                const isCompleted = completedLessons.includes(selectedLesson.id) || !!selectedLesson.completed;

                if (isCompleted) {
                    return (
                        <Typography sx={{ mb: 2, color: "success.main", fontWeight: 700 }}>
                            Bài học đã hoàn thành. Bạn có thể “Xem lại” bài học này.
                        </Typography>
                    );
                }

                return (
                    <Typography sx={{ mb: 2, color: "text.secondary" }}>
                        Bạn đã đi hết các bước. Bấm <b>Xác nhận hoàn thành bài học</b> để lưu trạng thái lên hệ thống.
                    </Typography>
                );
            }

            default:
                return null;
        }
    };

    const renderBottomControls = () => {
        if (!selectedLesson || !currentStep) return null;

        const isConfirm = currentStep.type === "CONFIRM";

        return (
            <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Button
                        variant="outlined"
                        disabled={!canGoPrev}
                        onClick={handlePrevStep}
                        sx={{ fontWeight: 700, borderRadius: 3, px: 3 }}
                    >
                        Xem lại phần trước
                    </Button>

                    {!isConfirm ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNextStep}
                            disabled={!canGoNext}
                            sx={{ fontWeight: 700, borderRadius: 3, px: 4 }}
                        >
                            Tiếp tục
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleConfirmCompleteLesson}
                            disabled={completeLoading || mode === "REVIEW"}
                            sx={{ fontWeight: 700, borderRadius: 3, px: 4 }}
                        >
                            {mode === "REVIEW" ? "Chế độ xem lại" : completeLoading ? "Đang xử lý..." : "Xác nhận hoàn thành bài học"}
                        </Button>
                    )}
                </Stack>
            </Box>
        );
    };

    if (loading || !course) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 26,
                    fontWeight: 700,
                }}
            >
                Đang tải...
            </div>
        );
    }

    const total = Array.isArray(lessons) ? lessons.length : 0;
    const completed = Array.isArray(completedLessons) ? completedLessons.length : 0;

    const showLessonProgressBar = !!selectedLesson && totalSteps > 0;

    return (
        <div
            style={{
                minHeight: "75vh",
                background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                padding: "0 0 24px 0",
            }}
        >
            <Box sx={{ width: "97%", maxWidth: 950, mx: "auto", pt: 5, pb: 5 }}>
                {/* Card lessons */}
                <Paper
                    elevation={4}
                    sx={{
                        mb: 4,
                        borderRadius: 5,
                        background: "#fff",
                        boxShadow: "0 8px 32px #1677ff20",
                        p: 3,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <img
                            src={course.thumbnail}
                            alt=""
                            style={{
                                width: 68,
                                height: 44,
                                borderRadius: 8,
                                marginRight: 14,
                                objectFit: "cover",
                                boxShadow: "0 2px 9px #1677ff18",
                            }}
                        />
                        <Typography fontWeight={800} fontSize={22} color="#1566c2">
                            {course.name}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography color="primary" fontWeight="bold" fontSize={16}>
                            {completed} / {total} bài học đã hoàn thành
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={total === 0 ? 0 : (completed / total) * 100}
                        sx={{ mb: 2, height: 11, borderRadius: 7, background: "#e0ecff" }}
                    />

                    <Typography variant="h6" sx={{ color: "#1677ff", fontWeight: 700, fontSize: 17, mb: 1 }}>
                        Danh sách bài học
                    </Typography>

                    <List>
                        {(Array.isArray(lessons) ? lessons : []).map((lesson) => {
                            const status = lessonStatusMap.get(lesson.id)?.status || "NOT_STARTED";
                            const isLocked = !!lesson.locked;

                            const isCompleted = status === "COMPLETED";
                            const isInProgress = status === "IN_PROGRESS";

                            const btnText = isLocked ? "Đã khóa" : isCompleted ? "Xem lại" : isInProgress ? "Học tiếp" : "Học bài";

                            return (
                                <ListItem
                                    key={lesson.id}
                                    sx={{
                                        bgcolor: isCompleted ? "#e7ffe5" : "#fafdff",
                                        transition: "background 0.15s",
                                        mb: 0.5,
                                        borderLeft: isCompleted ? "4px solid #2ab748" : "4px solid #fff",
                                        borderRadius: 2,
                                        opacity: isLocked ? 0.6 : 1,
                                        cursor: isLocked ? "not-allowed" : "pointer",
                                    }}
                                    button={!isLocked}
                                    onClick={() => !isLocked && handleSelectLesson(lesson.id)}
                                >
                                    <ListItemText
                                        primary={<span style={{ fontWeight: 700, color: "#23262a" }}>{lesson.name}</span>}
                                        secondary={
                                            <span style={{ color: "#8291ae", fontSize: 14 }}>
                                                {lesson.description ? lesson.description.slice(0, 64) + "..." : ""}
                                            </span>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Button
                                            variant={isCompleted ? "outlined" : "contained"}
                                            color={isCompleted ? "success" : isLocked ? "inherit" : "primary"}
                                            sx={{
                                                minWidth: 120,
                                                fontWeight: 700,
                                                borderRadius: 3,
                                                boxShadow: "0 2px 8px #1677ff09",
                                            }}
                                            disabled={isLocked}
                                            onClick={() => !isLocked && handleSelectLesson(lesson.id)}
                                        >
                                            {btnText}
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            );
                        })}
                    </List>
                </Paper>

                {/* Card nội dung bài học */}
                <Paper
                    elevation={4}
                    sx={{
                        borderRadius: 5,
                        background: "#fff",
                        boxShadow: "0 8px 32px #1677ff15",
                        p: 4,
                        minHeight: 200,
                    }}
                >
                    {!selectedLesson || hideLessonPanel ? (
                        <Typography sx={{ color: "#8da5be", fontWeight: 600, fontSize: 22, textAlign: "center", mt: 5 }}>
                            {hideLessonPanel ? "Bạn đã hoàn thành bài. Hãy chọn bài tiếp theo để học!" : "Chọn một bài học để bắt đầu học!"}
                        </Typography>
                    ) : (
                        <>
                            {/* Header */}
                            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}>
                                <Typography variant="h5" fontWeight={800} color="#1566c2">
                                    {selectedLesson.name}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: mode === "REVIEW" ? "success.main" : "text.secondary",
                                        fontWeight: 800,
                                    }}
                                >
                                    {mode === "REVIEW" ? "Chế độ: Xem lại" : "Chế độ: Học"}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* Progress riêng lesson */}
                            {showLessonProgressBar && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        Tiến độ bài học: {mode === "REVIEW" ? 100 : lessonPercent}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={mode === "REVIEW" ? 100 : lessonPercent}
                                        sx={{ height: 8, borderRadius: 4, background: "#eef3ff" }}
                                    />
                                </Box>
                            )}

                            {/* Step title */}
                            {currentStep && (
                                <Typography sx={{ fontWeight: 900, fontSize: 18, color: "#1677ff", mt: 1, mb: 1 }}>
                                    {stepTitle(currentStep.type)}
                                </Typography>
                            )}

                            {resourceError && (
                                <Typography color="error" sx={{ mb: 2 }}>
                                    {resourceError}
                                </Typography>
                            )}

                            {/* Body */}
                            {renderSectionBody()}

                            {/* Controls */}
                            {renderBottomControls()}

                            {/* Hint assignment optional */}
                            {currentStep?.type === "QUIZ" && (
                                <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.secondary" }}>
                                    {assignmentRequired
                                        ? "Bài này có assignment: sau khi hoàn thành quiz, bạn sẽ làm assignment rồi mới xác nhận hoàn tất."
                                        : "Bài này không có assignment: hoàn thành quiz là đủ để xác nhận hoàn tất."}
                                </Typography>
                            )}
                        </>
                    )}
                </Paper>
            </Box>

            {/* Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle sx={{ fontWeight: 700 }}>Thông báo</DialogTitle>
                <DialogContent>
                    <Typography>{dialogMsg}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default LearningPage;
