import React, { useState } from "react";
import {
  Box, Card, Typography, TextField, Grid, Button, Divider, Chip,
  IconButton, Alert, CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../services/api";

const CreateForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", course: "", instructor: "", description: "", questions: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Add question using correct backend field names
  const addQuestion = (type) => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        { _tempId: Date.now(), questionText: "", questionType: type.toUpperCase(), options: [] },
      ],
    });
  };

  const removeQuestion = (idx) => {
    const updated = [...form.questions];
    updated.splice(idx, 1);
    setForm({ ...form, questions: updated });
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...form.questions];
    updated[idx][field] = value;
    setForm({ ...form, questions: updated });
  };

  // ✅ Submit to backend API
  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim() || !form.course.trim() || !form.instructor.trim()) {
      setError("Please fill in Title, Course and Instructor fields.");
      return;
    }
    if (form.questions.length === 0) {
      setError("Please add at least one question.");
      return;
    }
    for (let i = 0; i < form.questions.length; i++) {
      if (!form.questions[i].questionText.trim()) {
        setError(`Question ${i + 1} cannot be empty.`);
        return;
      }
      if (form.questions[i].questionType === "MCQ") {
        const opts = form.questions[i].options.filter(o => o.trim());
        if (opts.length < 2) {
          setError(`Question ${i + 1} (MCQ) needs at least 2 options.`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        course: form.course.trim(),
        instructor: form.instructor.trim(),
        description: form.description.trim(),
        questions: form.questions.map((q, i) => ({
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          options: q.questionType === "MCQ" ? q.options.filter(o => o.trim()) : [],
          orderIndex: i,
        })),
      };
      const result = await adminAPI.createForm(payload);
      if (result.success) {
        navigate("/admin");
      } else {
        setError(result.message || "Failed to create form.");
      }
    } catch (err) {
      setError("Cannot connect to backend. Make sure it is running on port 8081.");
    } finally {
      setLoading(false);
    }
  };

  const chipStyle = (type) => ({
    cursor: "pointer",
    fontWeight: 600,
    bgcolor: "#1f4d45",
    color: "#f7f1e3",
    "&:hover": { bgcolor: "#16302b" },
  });

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
      <Card sx={{ p: 4, width: "100%", maxWidth: 900, borderRadius: 4, boxShadow: 3, bgcolor: "#fffaf0" }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: "#16302b" }}>
          Create Feedback Form
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Form Title *" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Course Name *" value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Instructor Name *" value={form.instructor}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#16302b" }}>Questions</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip label="+ Rating" onClick={() => addQuestion("RATING")} sx={chipStyle()} />
            <Chip label="+ MCQ" onClick={() => addQuestion("MCQ")} sx={chipStyle()} />
            <Chip label="+ Text" onClick={() => addQuestion("TEXT")} sx={chipStyle()} />
          </Box>
        </Box>

        <Box sx={{ border: "2px dashed #d9ccb2", p: 3, borderRadius: 2, bgcolor: "#fffdf7" }}>
          {form.questions.length === 0 ? (
            <Typography color="text.secondary" textAlign="center">
              No questions added yet. Click a button above to add.
            </Typography>
          ) : (
            form.questions.map((q, index) => (
              <Box key={q._tempId || index} sx={{ mb: 3, p: 2, border: "1px solid #e6dac3", borderRadius: 2, bgcolor: "#fff" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Chip
                    label={q.questionType}
                    size="small"
                    sx={{ bgcolor: q.questionType === "RATING" ? "#d9a441" : q.questionType === "MCQ" ? "#1f4d45" : "#3d6f66", color: "#fff" }}
                  />
                  <IconButton size="small" onClick={() => removeQuestion(index)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <TextField
                  fullWidth
                  label={`Question ${index + 1} *`}
                  value={q.questionText}
                  onChange={(e) => updateQuestion(index, "questionText", e.target.value)}
                  sx={{ mb: q.questionType === "MCQ" ? 2 : 0 }}
                />

                {/* MCQ Options */}
                {q.questionType === "MCQ" && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Options (min 2):</Typography>
                    {(q.options.length === 0 ? ["", ""] : q.options).map((opt, oi) => (
                      <Box key={oi} sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <TextField
                          fullWidth size="small"
                          label={`Option ${oi + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const opts = [...(q.options.length === 0 ? ["", ""] : q.options)];
                            opts[oi] = e.target.value;
                            updateQuestion(index, "options", opts);
                          }}
                        />
                        {oi >= 2 && (
                          <IconButton size="small" onClick={() => {
                            const opts = [...q.options];
                            opts.splice(oi, 1);
                            updateQuestion(index, "options", opts);
                          }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                    <Button size="small" sx={{ mt: 1, color: "#1f4d45" }}
                      onClick={() => updateQuestion(index, "options", [...(q.options.length < 2 ? ["", ""] : q.options), ""])}>
                      + Add Option
                    </Button>
                  </Box>
                )}
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ mt: 4, textAlign: "right", display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => navigate("/admin")} sx={{ borderColor: "#1f4d45", color: "#1f4d45" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ background: "#1f4d45", "&:hover": { background: "#16302b" } }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Create Form"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default CreateForm;
