import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Rating,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Add,
  Assignment,
  CheckCircle,
  CloudDownload,
  Close,
  Delete,
  Edit,
  Feedback,
  MoreVert,
  NewReleases,
  NotificationsActive,
  People,
  Quiz,
  Star,
  TextFields,
  ToggleOn,
  TrendingDown,
  TrendingUp,
  Visibility,
} from "@mui/icons-material";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminAPI } from "../services/api";

const COLORS = ["#1f4d45", "#d9a441", "#3d6f66", "#c07b38", "#7ca89d"];

const normalizeId = (value) => (value === undefined || value === null ? "" : String(value));

const getFormIdentifier = (form) =>
  form?.id ?? form?.formId ?? form?.form_id ?? form?.feedbackFormId ?? "";

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getQuestionTypeFromQuestions = (questions, questionId) => {
  const question = questions?.find((item) => normalizeId(item.id) === normalizeId(questionId));
  return (question?.questionType || question?.type || "").toUpperCase();
};

const getQuestionTypeFromForm = (form, questionId) =>
  getQuestionTypeFromQuestions(form?.questions, questionId);

const extractRatingFromSubmission = (submission, form) => {
  const directRating = parseNumber(
    submission.overallRating ??
      submission.avgRating ??
      submission.averageRating ??
      submission.rating ??
      submission.ratingValue ??
      submission.rating_score
  );
  if (directRating > 0) return directRating;

  const submissionQuestions =
    submission.form?.questions ||
    submission.feedbackForm?.questions ||
    submission.feedback_form?.questions ||
    [];

  const answers = submission.answers || submission.responseAnswers || submission.feedbackAnswers || [];
  const ratingAnswers = answers
    .map((answer) => {
      const questionType = (
        answer.questionType ||
        answer.type ||
        getQuestionTypeFromForm(form, answer.questionId) ||
        getQuestionTypeFromQuestions(submissionQuestions, answer.questionId)
      ).toUpperCase();
      if (questionType !== "RATING") return 0;
      return parseNumber(
        answer.rating ?? answer.answerValue ?? answer.answerText ?? answer.value ?? answer.ratingValue
      );
    })
    .filter((value) => value > 0);

  if (ratingAnswers.length === 0) return 0;
  return ratingAnswers.reduce((sum, value) => sum + value, 0) / ratingAnswers.length;
};

const getQuestionIcon = (type) => {
  const normalizedType = (type || "").toUpperCase();
  if (normalizedType === "RATING") return <Star sx={{ color: "#f5b342" }} />;
  if (normalizedType === "TEXT") return <TextFields sx={{ color: "#667eea" }} />;
  return <Quiz sx={{ color: "#764ba2" }} />;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState("forms");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [timeRange, setTimeRange] = useState("week");
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hideNotificationBadge, setHideNotificationBadge] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewForm, setViewForm] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(true);
  const [newSubmissionPopup, setNewSubmissionPopup] = useState({ open: false, data: null });
  const previousSubmissionKeys = useRef(new Set());

  const loadForms = useCallback(async () => {
    try {
      const data = await adminAPI.getAllForms();
      setForms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load forms:", error);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await adminAPI.getAnalytics();
      setAnalytics(data || {});
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadForms(), loadAnalytics()]);
      setLoading(false);
    };
    init();
  }, [loadForms, loadAnalytics]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadForms();
      loadAnalytics();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadForms, loadAnalytics]);

  const recentSubmissions = useMemo(() => {
    const rawSubmissions = analytics?.recentSubmissions || analytics?.recentFeedback || analytics?.submissions || [];

    return rawSubmissions
      .map((submission) => {
        const submittedAt =
          submission.submittedAt ||
          submission.submitted_at ||
          submission.createdAt ||
          submission.created_at ||
          submission.date ||
          null;
        const submittedAtDate = parseDateValue(submittedAt);
        const studentName =
          submission.studentName || submission.student_name || submission.name || submission.userName || "Student";
        const formId = normalizeId(
          submission.formId || submission.form_id || submission.feedbackFormId || submission.form?.id
        );
        const linkedForm = forms.find((form) => normalizeId(form.id) === formId);
        const rating = extractRatingFromSubmission(submission, linkedForm);
        const formTitle =
          submission.formTitle ||
          submission.form_title ||
          submission.title ||
          submission.form?.title ||
          linkedForm?.title ||
          "Feedback Form";
        const course =
          submission.course || submission.courseName || submission.form?.course || linkedForm?.course || "";
        const key = normalizeId(
          submission.id ||
          submission.submissionId ||
          submission.feedbackId ||
          `${formId}-${studentName}-${submittedAt || "na"}`
        );

        return {
          id: normalizeId(submission.id || submission.submissionId || submission.feedbackId || key),
          key,
          formId,
          formTitle,
          course,
          studentName,
          rating,
          submittedAt,
          submittedAtDate,
          time: submittedAtDate ? submittedAtDate.toLocaleTimeString() : "Recently",
        };
      })
      .sort((a, b) => (b.submittedAtDate?.getTime() || 0) - (a.submittedAtDate?.getTime() || 0));
  }, [analytics, forms]);

  useEffect(() => {
    const currentKeys = new Set(recentSubmissions.map((submission) => submission.key));

    if (previousSubmissionKeys.current.size === 0) {
      previousSubmissionKeys.current = currentKeys;
      setNotifications(recentSubmissions.slice(0, 10).map((submission) => ({ ...submission, read: true })));
      setUnreadCount(0);
      return;
    }

    const newSubmissions = recentSubmissions.filter(
      (submission) => !previousSubmissionKeys.current.has(submission.key)
    );

    if (newSubmissions.length > 0) {
      setNotifications((prev) => {
        const existingKeys = new Set(prev.map((item) => item.key));
        const incoming = newSubmissions
          .filter((submission) => !existingKeys.has(submission.key))
          .map((submission) => ({ ...submission, read: false }));
        return [...incoming, ...prev].slice(0, 25);
      });
      setUnreadCount((prev) => prev + newSubmissions.length);
      setHideNotificationBadge(false);
      setSnackbar({
        open: true,
        message: `${newSubmissions.length} feedback${newSubmissions.length > 1 ? "s" : ""} received for "${newSubmissions[0].formTitle}"`,
        severity: "info",
      });
      setNewSubmissionPopup({
        open: true,
        data: {
          formTitle: newSubmissions[0].formTitle,
          studentName: newSubmissions[0].studentName,
          course: newSubmissions[0].course,
          rating: newSubmissions[0].rating,
          time: newSubmissions[0].time,
          count: newSubmissions.length,
        },
      });
    }

    previousSubmissionKeys.current = currentKeys;
  }, [recentSubmissions]);

  const rawFormStats = useMemo(
    () => analytics?.formStats || analytics?.form_stats || analytics?.stats || [],
    [analytics]
  );

  const formStats = useMemo(
    () => forms.map((form) => {
      const matchingStat = rawFormStats.find(
        (stat) => normalizeId(stat.formId || stat.form_id || stat.id) === normalizeId(form.id)
      ) || {};
      const relatedSubmissions = recentSubmissions.filter(
        (submission) => normalizeId(submission.formId) === normalizeId(form.id)
      );
      const derivedRatings = relatedSubmissions.map((submission) => parseNumber(submission.rating)).filter((value) => value > 0);
      const derivedAvgRating = derivedRatings.length > 0
        ? derivedRatings.reduce((sum, value) => sum + value, 0) / derivedRatings.length
        : 0;

      return {
        formId: normalizeId(form.id),
        instructor: form.instructor || matchingStat.instructor || "Unknown",
        responseCount: parseNumber(
          matchingStat.responseCount ?? matchingStat.responsesCount ?? matchingStat.totalResponses ?? matchingStat.submissionCount
        ) || relatedSubmissions.length,
        avgRating: parseNumber(
          matchingStat.avgRating ??
            matchingStat.averageRating ??
            matchingStat.overallRating ??
            matchingStat.avg_rating ??
            matchingStat.average_rating ??
            matchingStat.overall_rating
        ) || derivedAvgRating,
      };
    }),
    [forms, rawFormStats, recentSubmissions]
  );

  const totalForms = analytics?.totalForms ?? analytics?.formsCount ?? forms.length;
  const totalFeedbacks = analytics?.totalResponses ?? analytics?.responsesCount ?? analytics?.feedbackCount ?? recentSubmissions.length;
  const totalStudents = analytics?.totalStudents ?? analytics?.studentCount ?? 0;
  const activeForms = analytics?.activeForms ?? forms.filter((form) => form.status === "active").length;
  const ratingValuesFromFeedback = recentSubmissions
    .map((submission) => parseNumber(submission.rating))
    .filter((value) => value > 0);

  const weightedRatingFromFormStats = formStats.reduce(
    (acc, form) => {
      if (form.avgRating > 0 && form.responseCount > 0) {
        acc.total += form.avgRating * form.responseCount;
        acc.count += form.responseCount;
      }
      return acc;
    },
    { total: 0, count: 0 }
  );

  const averageFromFeedback = ratingValuesFromFeedback.length > 0
    ? ratingValuesFromFeedback.reduce((sum, value) => sum + value, 0) / ratingValuesFromFeedback.length
    : 0;

  const averageFromStats = weightedRatingFromFormStats.count > 0
    ? weightedRatingFromFormStats.total / weightedRatingFromFormStats.count
    : 0;

  const computedAverageRating = averageFromFeedback > 0 ? averageFromFeedback : averageFromStats;
  const hasRatingData = computedAverageRating > 0;
  const avgRating = computedAverageRating > 0 ? computedAverageRating.toFixed(1) : "0.0";
  const responseRate = totalForms > 0 ? ((totalFeedbacks / (totalForms * 10)) * 100).toFixed(1) : "0";
  const notificationBadgeCount = hideNotificationBadge ? 0 : unreadCount;

  const instructorMap = {};
  formStats.forEach((form) => {
    if (!instructorMap[form.instructor]) {
      instructorMap[form.instructor] = { sum: 0, count: 0, responses: 0 };
    }
    if (form.avgRating > 0) {
      instructorMap[form.instructor].sum += form.avgRating;
      instructorMap[form.instructor].count += 1;
    }
    instructorMap[form.instructor].responses += form.responseCount;
  });

  const maxInstructorResponses = Math.max(...Object.values(instructorMap).map((item) => item.responses), 1);
  const instructorData = Object.keys(instructorMap).map((name) => {
    const ratingValue = instructorMap[name].count > 0
      ? instructorMap[name].sum / instructorMap[name].count
      : 0;
    const responseScore = (instructorMap[name].responses / maxInstructorResponses) * 5;
    const score = hasRatingData ? ratingValue : responseScore;

    return {
      name: name.split(" ")[0],
      fullName: name,
      avg: ratingValue.toFixed(1),
      score: score.toFixed(1),
      responses: instructorMap[name].responses,
      metricLabel: hasRatingData ? "Average rating" : "Response activity",
    };
  });

  const topInstructor = instructorData.length > 0
    ? instructorData.reduce((max, item) => (parseFloat(item.score) > parseFloat(max.score) ? item : max), instructorData[0])
    : null;
  const lowInstructor = instructorData.length > 0
    ? instructorData.reduce((min, item) => (parseFloat(item.score) < parseFloat(min.score) ? item : min), instructorData[0])
    : null;

  const trendData = useMemo(() => {
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;
    const data = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const count = recentSubmissions.filter(
        (submission) => submission.submittedAtDate && submission.submittedAtDate.toDateString() === date.toDateString()
      ).length;
      data.push({ date: label, count });
    }
    return data;
  }, [recentSubmissions, timeRange]);

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: recentSubmissions.filter((submission) => Math.round(submission.rating || 0) === rating).length,
  }));

  const ratingChartData = ratingDistribution.some((item) => item.count > 0)
    ? ratingDistribution.filter((item) => item.count > 0)
    : formStats.filter((form) => form.responseCount > 0).map((form) => ({ rating: form.instructor, count: form.responseCount }));

  const maxCourseResponses = Math.max(...formStats.map((item) => item.responseCount || 0), 1);
  const courseData = forms.map((form) => {
    const stat = formStats.find((item) => normalizeId(item.formId) === normalizeId(form.id)) || {};
    const responseCount = stat.responseCount || 0;
    const fallbackScore = maxCourseResponses > 0 ? (responseCount / maxCourseResponses) * 5 : 0;
    const displayAvg = stat.avgRating > 0 ? stat.avgRating : fallbackScore;
    return {
      name: form.course,
      code: (form.course || "").substring(0, 3).toUpperCase(),
      total: responseCount,
      avg: displayAvg,
      rawAvg: stat.avgRating || 0,
      instructor: form.instructor,
      status: form.status,
      metricLabel: stat.avgRating > 0 ? "Average rating" : "Response activity",
    };
  });

  const handleMenuOpen = (event, form) => {
    setAnchorEl(event.currentTarget);
    setSelectedForm(form);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedForm(null);
  };

  const handleDeleteForm = async (formId) => {
    try {
      if (!formId) {
        throw new Error("Form id not found");
      }
      const result = await adminAPI.deleteForm(formId);
      if (result.success) {
        await Promise.all([loadForms(), loadAnalytics()]);
        setSnackbar({ open: true, message: "Form deleted.", severity: "success" });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error.message === "NETWORK_ERROR"
            ? "Cannot connect to backend. Make sure the server is running."
            : (error.message || "Failed to delete form."),
        severity: "error",
      });
    }
    handleMenuClose();
  };

  const handleToggleStatus = async (formId) => {
    try {
      const result = await adminAPI.toggleFormStatus(formId);
      if (result.success) {
        await Promise.all([loadForms(), loadAnalytics()]);
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to toggle status.", severity: "error" });
    }
    handleMenuClose();
  };

  const handleViewForm = (form) => {
    setViewForm(form);
    setViewDialogOpen(true);
  };

  const handleEditForm = (form) => {
    if (!form) return;

    const editableFormData = {
      ...form,
      questions: (form.questions || []).map((question, index) => ({
        id: question.id || `${form.id || "form"}-q-${index}`,
        type: (question.questionType || question.type || "text").toLowerCase(),
        text: question.questionText || question.text || "",
        options: Array.isArray(question.options)
          ? question.options
          : ["Option 1", "Option 2"],
      })),
    };

    navigate("/create-feedback", {
      state: {
        editing: true,
        formData: editableFormData,
      },
    });
    handleMenuClose();
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewForm(null);
  };

  const handleNotificationClick = () => {
    setNotificationDrawerOpen(true);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    setHideNotificationBadge(true);
  };

  const handleDownloadReport = () => {
    const reportData = { generatedAt: new Date().toISOString(), analytics, forms };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `feedback-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F6F1E8" }}>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300 }}>
        <Navbar hideHomeButton={true} />
      </Box>
      <Box sx={{ height: "64px" }} />

      <Paper sx={{ position: "fixed", top: "64px", left: 0, right: 0, zIndex: 1200, p: 3, background: "linear-gradient(135deg, #20473f 0%, #2f6a5d 100%)", color: "#d3d0c9", borderRadius: 0, boxShadow: "0 12px 30px rgba(31,77,69,0.18)" }}>
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>Admin Dashboard</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>Manage feedback forms and analyze student responses</Typography>
            </Box>
            <Badge badgeContent={notificationBadgeCount} showZero={false} max={99} sx={{ "& .MuiBadge-badge": { backgroundColor: "#2e7d32", color: "#ffffff", minWidth: 20, height: 20, borderRadius: "50%", fontWeight: 700, fontSize: "0.75rem", boxShadow: "0 0 0 2px rgba(32, 71, 63, 0.95)" } }}>
              <IconButton sx={{ color: "#f7f1e3" }} onClick={handleNotificationClick}><NotificationsActive /></IconButton>
            </Badge>
          </Box>
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            {["forms", "analytics"].map((tab) => (
              <Button key={tab} variant={activeTab === tab ? "contained" : "text"} onClick={() => setActiveTab(tab)} sx={{ color: activeTab === tab ? "white" : "rgba(255,255,255,0.8)", bgcolor: activeTab === tab ? "rgba(247,241,227,0.18)" : "transparent", borderRadius: 2, textTransform: "capitalize" }}>
                {tab === "forms" ? "Forms" : "Analytics"}
              </Button>
            ))}
            <Button variant="text" onClick={() => navigate("/create-feedback")} sx={{ color: "rgba(255,255,255,0.85)" }}>Create Form</Button>
          </Box>
        </Container>
      </Paper>

      <Box sx={{ height: "160px" }} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: "Total Forms", value: totalForms, sub: `${activeForms} active`, icon: <Assignment />, color: "#1f4d45" },
            { label: "Total Feedbacks", value: totalFeedbacks, sub: `Response rate: ${responseRate}%`, icon: <Feedback />, color: "#d9a441" },
            { label: "Average Rating", value: avgRating, sub: <Rating value={parseFloat(avgRating)} precision={0.5} readOnly size="small" />, icon: <Star />, color: "#3d6f66" },
            { label: "Total Students", value: totalStudents, sub: "Registered in system", icon: <People />, color: "#6d8f68" },
          ].map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <Card sx={{ p: 3, bgcolor: "#fffaf0", border: "1px solid #eadfc9", boxShadow: "0 10px 24px rgba(61,74,53,0.08)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">{card.label}</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#16302b" }}>{card.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: card.color }}>{card.icon}</Avatar>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>{card.sub}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {activeTab === "forms" && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#62a2af" }}>Feedback Forms</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/create-feedback")} sx={{ background: "#0A1A2F", color: "white" }}>Create Form</Button>
                <Button variant="outlined" startIcon={<CloudDownload />} onClick={handleDownloadReport} sx={{ borderColor: "#0d0303", color: "#000000" }}>Download Report</Button>
              </Box>
            </Box>

            {forms.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, bgcolor: "#8aa1d6" }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>No Feedback Forms Yet</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/create-feedback")} sx={{ background: "#0A1A2F", color: "white", mt: 2 }}>Create Form</Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {forms.map((form) => {
                  const stat = formStats.find((item) => normalizeId(item.formId) === normalizeId(form.id)) || {};
                  const isActive = form.status === "active";
                  return (
                    <Grid item xs={12} md={6} lg={4} key={form.id}>
                      <Card sx={{ p: 3, borderRadius: 3, bgcolor: "#296f9d", border: isActive ? "2px solid #1f4d45" : "2px solid #d9a441", transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }}>{form.title}</Typography>
                            <Chip label={isActive ? "active" : "inactive"} color={isActive ? "success" : "warning"} size="small" sx={{ mt: 1 }} />
                          </Box>
                          <IconButton onClick={(event) => handleMenuOpen(event, form)}><MoreVert /></IconButton>
                        </Box>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>{form.description}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" sx={{ mb: 0.5, color: "#0B1E33" }}>{form.course}</Typography>
                        <Typography variant="body2" sx={{ mb: 0.5, color: "#0B1E33" }}>{form.instructor}</Typography>
                        <Typography variant="body2" sx={{ color: "#0B1E33" }}>{form.createdAt ? new Date(form.createdAt).toLocaleDateString() : ""}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box>
                            <Typography variant="h6" sx={{ color: stat.responseCount > 0 ? "#000" : "#9e9e9e" }}>{stat.responseCount || 0}</Typography>
                            <Typography variant="caption" sx={{ color: "#080b10" }}>{stat.responseCount > 0 ? "Responses Received" : "No Responses Yet"}</Typography>
                          </Box>
                          <Tooltip title="View"><IconButton size="small" onClick={() => handleViewForm(form)}><Visibility fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === "analytics" && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, background: "linear-gradient(135deg, #1f4d45 0%, #3d6f66 100%)", color: "#fffaf0" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}><TrendingUp /></Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Top Performer</Typography>
                      <Typography variant="h6">{topInstructor?.fullName || "N/A"}</Typography>
                      <Rating value={parseFloat(hasRatingData ? topInstructor?.avg : topInstructor?.score) || 0} readOnly size="small" sx={{ color: "#fffaf0" }} />
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>{topInstructor?.metricLabel || "Average rating"}</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, background: "linear-gradient(135deg, #d9a441 0%, #b8772d 100%)", color: "#fffaf0" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}><TrendingDown /></Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Needs Improvement</Typography>
                      <Typography variant="h6">{lowInstructor?.fullName || "N/A"}</Typography>
                      <Rating value={parseFloat(hasRatingData ? lowInstructor?.avg : lowInstructor?.score) || 0} readOnly size="small" sx={{ color: "#fffaf0" }} />
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>{lowInstructor?.metricLabel || "Average rating"}</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 3, bgcolor: "#fffaf0", border: "1px solid #eadfc9" }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }} gutterBottom>Instructor Performance</Typography>
                  <Box sx={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={instructorData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 5]} />
                        <RechartsTooltip formatter={(value) => [value, hasRatingData ? "Average rating" : "Response activity"]} />
                        <Bar dataKey="score" fill="#1f4d45" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 3, bgcolor: "#fffaf0", border: "1px solid #eadfc9" }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }} gutterBottom>{hasRatingData ? "Rating Distribution" : "Feedback Distribution"}</Typography>
                  <Box sx={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={ratingChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="count" label={({ rating, percent }) => `${rating} (${(percent * 100).toFixed(0)}%)`}>
                          {ratingChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [value, hasRatingData ? "Ratings" : "Responses"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ p: 3, bgcolor: "#fffaf0", border: "1px solid #eadfc9" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }}>Response Trend</Typography>
                      <Typography variant="body2" color="text.secondary">Daily feedback submissions</Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {["week", "month", "quarter"].map((range) => (
                        <Button key={range} size="small" variant={timeRange === range ? "contained" : "outlined"} onClick={() => setTimeRange(range)} sx={{ color: timeRange === range ? "#fffaf0" : "#16302b", borderColor: "#1f4d45", bgcolor: timeRange === range ? "#1f4d45" : "transparent" }}>
                          {range}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                      <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="count" stroke="#1f4d45" fill="#1f4d45" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ p: 3, bgcolor: "#fffaf0", border: "1px solid #eadfc9" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }}>Course Performance</Typography>
                    <Button variant="outlined" startIcon={<CloudDownload />} onClick={handleDownloadReport} sx={{ borderColor: "#1f4d45", color: "#1f4d45" }}>Export</Button>
                  </Box>
                  <Box sx={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f5f5f5" }}>
                          {["Course", "Instructor", "Responses", hasRatingData ? "Avg Rating" : "Activity Score", "Performance", "Status"].map((header) => (
                            <th key={header} style={{ padding: "12px", textAlign: header === "Course" || header === "Instructor" ? "left" : "right", color: "#0B1E33" }}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {courseData.map((course, index) => (
                          <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "12px" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Avatar sx={{ bgcolor: "#667eea", width: 32, height: 32 }}>{(course.code || "?").charAt(0)}</Avatar>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: "#0B1E33" }}>{course.name}</Typography>
                              </Box>
                            </td>
                            <td style={{ padding: "12px", color: "#0B1E33" }}>{course.instructor}</td>
                            <td style={{ padding: "12px", textAlign: "right", color: "#0B1E33" }}>{course.total}</td>
                            <td style={{ padding: "12px", textAlign: "right" }}>
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                                <Typography sx={{ color: "#0B1E33" }}>{(course.avg || 0).toFixed(1)}</Typography>
                                <Star sx={{ fontSize: 16, color: "#f5b342" }} />
                              </Box>
                            </td>
                            <td style={{ padding: "12px", textAlign: "right" }}>
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                                <LinearProgress variant="determinate" value={((course.avg || 0) / 5) * 100} sx={{ width: 80, height: 6, borderRadius: 3 }} />
                                <Typography variant="caption" sx={{ color: "#0B1E33" }}>{(((course.avg || 0) / 5) * 100).toFixed(0)}%</Typography>
                              </Box>
                            </td>
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <Chip label={course.status === "active" ? "Active" : "Inactive"} size="small" color={course.status === "active" ? "success" : "warning"} icon={course.status === "active" ? <CheckCircle sx={{ fontSize: 14 }} /> : undefined} sx={{ height: 24 }} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>

      <Drawer anchor="right" open={notificationDrawerOpen} onClose={() => setNotificationDrawerOpen(false)} PaperProps={{ sx: { width: 360, p: 2, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#0B1E33" }}>Notifications</Typography>
          <IconButton onClick={() => setNotificationDrawerOpen(false)}><Close /></IconButton>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="text.secondary">No notifications yet.</Typography>
            <Typography variant="caption" color="text.secondary">They will appear here when students submit feedback.</Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItemButton key={notification.key} sx={{ borderRadius: 2, mb: 1, bgcolor: notification.read ? "transparent" : "#e8f5e9" }}>
                <ListItemAvatar><Avatar sx={{ bgcolor: notification.read ? "#ccc" : "#1f4d45" }}><NewReleases /></Avatar></ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="subtitle2" sx={{ color: "#0B1E33" }}>{notification.formTitle}</Typography>}
                  secondary={<><Typography variant="caption" display="block">By: {notification.studentName}</Typography><Typography variant="caption" display="block">Rating: {notification.rating ? `${notification.rating.toFixed ? notification.rating.toFixed(1) : notification.rating}` : "N/A"}</Typography><Typography variant="caption" color="text.secondary">{notification.time}</Typography></>}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Drawer>

      <Fab sx={{ position: "fixed", bottom: 32, right: 32, background: "#3e689e", zIndex: 1300, "&:hover": { background: "#1A2F45" } }} onClick={() => navigate("/create-feedback")}>
        <Add sx={{ color: "white" }} />
      </Fab>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { borderRadius: 3 } }}>
        <MenuItem onClick={() => { handleViewForm(selectedForm); handleMenuClose(); }}><Visibility fontSize="small" sx={{ mr: 1 }} /> View</MenuItem>
        <MenuItem onClick={() => handleEditForm(selectedForm)}><Edit fontSize="small" sx={{ mr: 1 }} /> Edit</MenuItem>
        <MenuItem onClick={() => handleToggleStatus(getFormIdentifier(selectedForm))}><ToggleOn fontSize="small" sx={{ mr: 1 }} /> Toggle Status</MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteForm(getFormIdentifier(selectedForm))} sx={{ color: "error.main" }}><Delete fontSize="small" sx={{ mr: 1 }} /> Delete</MenuItem>
      </Menu>

      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        {viewForm && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: "#4d8bd3" }}>{viewForm.title}</Typography>
                <Chip label={viewForm.status} color={viewForm.status === "active" ? "success" : "warning"} size="small" />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>{viewForm.description}</Typography>
              <Typography variant="body2" gutterBottom>Course: <strong style={{ color: "#0B1E33" }}>{viewForm.course}</strong></Typography>
              <Typography variant="body2" gutterBottom>Instructor: <strong style={{ color: "#0B1E33" }}>{viewForm.instructor}</strong></Typography>
              <Typography variant="body2" gutterBottom>Created: <strong style={{ color: "#0B1E33" }}>{viewForm.createdAt ? new Date(viewForm.createdAt).toLocaleDateString() : "—"}</strong></Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: "#0B1E33" }}>Questions ({viewForm.questions?.length || 0})</Typography>
              <List>
                {viewForm.questions?.map((question, index) => (
                  <ListItem key={question.id || index} sx={{ px: 0 }}>
                    <ListItemIcon>{getQuestionIcon(question.questionType)}</ListItemIcon>
                    <ListItemText primary={<Typography variant="body1" sx={{ color: "#0B1E33" }}>{index + 1}. {question.questionText}</Typography>} secondary={`Type: ${question.questionType}`} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions><Button onClick={handleCloseViewDialog} variant="outlined">Close</Button></DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={newSubmissionPopup.open} onClose={() => setNewSubmissionPopup({ open: false, data: null })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } }}>
        <Box sx={{ background: "linear-gradient(135deg, #1f4d45 0%, #2f6a5d 100%)", p: 3, textAlign: "center" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#f7f1e3" }}>{newSubmissionPopup.data?.count || 1} feedback{(newSubmissionPopup.data?.count || 1) > 1 ? "s" : ""} received</Typography>
          <Typography variant="body2" sx={{ color: "rgba(247, 241, 227, 0.88)", mt: 0.5 }}>Latest update from {newSubmissionPopup.data?.formTitle}</Typography>
        </Box>
        <DialogContent sx={{ p: 3, bgcolor: "#fffaf0" }}>
          {newSubmissionPopup.data && (
            <Box>
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>{newSubmissionPopup.data.count} feedback{newSubmissionPopup.data.count > 1 ? "s have" : " has"} just been received.</Alert>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: "#1f4d45" }}><People sx={{ color: "#f7f1e3" }} /></Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#0B1E33" }}>{newSubmissionPopup.data.studentName || "A Student"}</Typography>
                  <Typography variant="caption" color="text.secondary">submitted at {newSubmissionPopup.data.time}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" sx={{ mb: 1, color: "#0B1E33" }}><strong>Form:</strong> {newSubmissionPopup.data.formTitle}</Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#0B1E33" }}><strong>Course:</strong> {newSubmissionPopup.data.course}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#fffaf0", px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { setNewSubmissionPopup({ open: false, data: null }); setActiveTab("analytics"); }} variant="outlined" sx={{ borderColor: "#1f4d45", color: "#1f4d45", borderRadius: 2 }}>View Analytics</Button>
          <Button onClick={() => setNewSubmissionPopup({ open: false, data: null })} variant="contained" sx={{ background: "#1f4d45", color: "white", borderRadius: 2, "&:hover": { background: "#16302b" } }}>Dismiss</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;

