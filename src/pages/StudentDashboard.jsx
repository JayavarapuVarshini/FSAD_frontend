import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Rating,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  LinearProgress,
  Chip,
  Avatar,
  Container,
  IconButton,
  Tooltip,
  Divider,
  Fade,
  Grow,
  Zoom,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import { styled, keyframes } from '@mui/material/styles';
import {
  Feedback as FeedbackIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Quiz as QuizIcon,
  RadioButtonChecked as McqIcon,
  TextFields as TextIcon,
  Task as TaskIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { studentAPI } from "../services/api";

// Animations
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

// Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f6f1e8 0%, #efe5d1 100%)',
  position: 'relative',
}));

// Fixed Student Dashboard Header - Updated spacing
const DashboardHeader = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: '64px',
  left: 0,
  right: 0,
  zIndex: theme.zIndex.drawer + 1,
  background: 'linear-gradient(135deg, #20473f 0%, #2f6a5d 100%)',
  borderRadius: 0,
  padding: theme.spacing(3, 0),
  boxShadow: '0 10px 30px rgba(26, 56, 49, 0.16)',
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  paddingTop: '200px',
  paddingBottom: theme.spacing(4),
}));

// Stat Card with proper alignment
const StatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: '#fffaf0',
  height: '100%',
  boxShadow: '0 10px 25px rgba(39, 54, 43, 0.08)',
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#0B1E33',
  lineHeight: 1.2,
  marginBottom: theme.spacing(0.5),
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: '#64748B',
  fontWeight: 500,
  marginBottom: theme.spacing(1),
}));

const StatIcon = styled(Box)(({ theme }) => ({
  color: '#0B1E33',
  fontSize: '1.5rem',
  marginTop: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    fontSize: '1.8rem',
  },
}));

const FormCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  backgroundColor: '#fffaf0',
  boxShadow: '0 10px 28px rgba(37, 46, 35, 0.09)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const NavyButton = styled(Button)(({ theme }) => ({
  background: '#1f4d45',
  color: 'white',
  padding: '10px 24px',
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: '#16302b',
  },
  '&:disabled': {
    background: '#2E7D32',
    color: '#FFFFFF',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    padding: theme.spacing(2),
    background: '#fffaf0',
    maxWidth: '600px',
  },
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: '12px',
  backgroundColor: '#fffdf7',
  border: '1px solid #e6dac3',
}));

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [submittedFormIds, setSubmittedFormIds] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from backend API
  const loadData = async () => {
    try {
      const [formsData, submittedData] = await Promise.all([
        studentAPI.getActiveForms(),
        studentAPI.getSubmittedFormIds(),
      ]);
      setForms(Array.isArray(formsData) ? formsData : []);
      setSubmittedFormIds(Array.isArray(submittedData) ? submittedData : []);
    } catch (err) {
      console.error("Failed to load student data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Stats
  const totalForms = forms.length;
  const submittedForms = submittedFormIds.length;
  
  const avgRating = 0; // Rating stats are shown in admin dashboard

  const progress = totalForms ? Math.round((submittedForms / totalForms) * 100) : 0;

  const getFormCompletionStatus = (formId) => submittedFormIds.includes(formId);

  const handleOpen = (form) => {
    setSelectedForm(form);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setOpen(true);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleNext = () => {
    const currentQuestion = selectedForm.questions[currentQuestionIndex];
    
    if (!answers[currentQuestion.id]) {
      setSnackbar({
        open: true,
        message: 'Please answer this question before proceeding',
      });
      return;
    }

    if (currentQuestionIndex < selectedForm.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const unansweredQuestions = selectedForm.questions.filter(
      q => !answers[q.id]
    );

    if (unansweredQuestions.length > 0) {
      setSnackbar({
        open: true,
        message: 'Please answer all questions before submitting',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Check if already submitted
      if (submittedFormIds.includes(selectedForm.id)) {
        setSnackbar({ open: true, message: 'You already submitted this form.' });
        setSubmitting(false);
        setOpen(false);
        return;
      }

      // Build answers array — send ratingValue for RATING questions
      const answersArray = selectedForm.questions.map(q => {
        const qType = (q.questionType || q.type || '').toUpperCase();
        const rawAnswer = answers[q.id];
        if (qType === 'RATING') {
          const ratingNum = parseFloat(rawAnswer) || 0;
          return {
            questionId: q.id,
            answerText: String(ratingNum),
            ratingValue: ratingNum,
          };
        }
        return {
          questionId: q.id,
          answerText: String(rawAnswer || ''),
          ratingValue: null,
        };
      });

      // overallRating = average of all RATING answers
      const ratingAnswers = answersArray.filter(a => a.ratingValue !== null && a.ratingValue > 0);
      const overallRating = ratingAnswers.length > 0
        ? ratingAnswers.reduce((sum, a) => sum + a.ratingValue, 0) / ratingAnswers.length
        : null;

      const payload = {
        formId: selectedForm.id,
        overallRating: overallRating,
        answers: answersArray,
      };

      await studentAPI.submitFeedback(payload);

      setSubmittedFormIds(prev => [...prev, selectedForm.id]);

      setSnackbar({
        open: true,
        message: '✨ Feedback submitted successfully! Thank you for your input.',
      });
      setOpen(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to submit feedback. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Render question based on type
  const renderQuestion = (question) => {
    const type = (question.questionType || question.type || '').toLowerCase();
    switch(type) {
      case 'rating':
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Rating
              value={answers[question.id] || 0}
              onChange={(e, val) => handleAnswerChange(question.id, val)}
              size="large"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#21446b',
                },
              }}
            />
          </Box>
        );
      
      case 'mcq':
        return (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            >
              {question.options?.map((option, idx) => (
                <FormControlLabel
                  key={idx}
                  value={option}
                  control={<Radio sx={{ color: '#2a5484' }} />}
                  label={option}
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: 2,
                    border: '1px solid #E2E8F0',
                    width: '90%',
                    marginLeft: 0,
                    '&:hover': {
                      backgroundColor: '#F8FAFC',
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      
      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer here..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
              },
            }}
          />
        );
      
      default:
        return (
          <TextField
            fullWidth
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer here..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
              },
            }}
          />
        );
    }
  };

  const getQuestionIcon = (type) => {
    const t = (type || '').toLowerCase();
    switch(t) {
      case 'rating': return <StarIcon sx={{ color: '#0B1E33' }} />;
      case 'mcq': return <McqIcon sx={{ color: '#0B1E33' }} />;
      case 'text': return <TextIcon sx={{ color: '#0B1E33' }} />;
      default: return <QuizIcon sx={{ color: '#0B1E33' }} />;
    }
  };

  return (
    <PageContainer>
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300 }}>
        <Navbar />
      </Box>

      <Box sx={{ height: '64px' }} />

      {/* Fixed Student Dashboard Header */}
      <DashboardHeader elevation={0}>
        <Container maxWidth="xl">
          <Box sx={{ px: 1 }}>
            <Typography variant="h4" fontWeight="700" sx={{ color: '#f7f1e3', mb: 1 }}>
              Student Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(247, 241, 227, 0.88)' }}>
              Share your feedback and help improve the learning experience
            </Typography>
          </Box>
        </Container>
      </DashboardHeader>

      {/* Content with increased spacing */}
      <ContentWrapper maxWidth="xl">
        {/* Stats Cards - Properly Aligned */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={10} sm={4} md={3}>
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <StatCard>
                <StatValue>{totalForms}</StatValue>
                <StatLabel sx={{ color: '#1f4d45' }}>Available Forms</StatLabel>
                <StatIcon>
                  <TaskIcon sx={{ color: '#1f4d45' }} />
                </StatIcon>
              </StatCard>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <StatCard>
                <StatValue>{submittedForms}</StatValue>
                <StatLabel sx={{ color: '#8b5a2b' }}>Submitted Solutions</StatLabel>
                <StatIcon>
                  <AssignmentIcon sx={{ color: '#8b5a2b' }} />
                </StatIcon>
              </StatCard>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <StatCard>
                <StatValue>{avgRating}</StatValue>
                <StatLabel sx={{ color: '#b8872d' }}>Average Rating</StatLabel>
                <StatIcon>
                  <StarIcon sx={{ color: '#b8872d' }} />
                </StatIcon>
              </StatCard>
            </Zoom>
          </Grid>

          <Grid item xs={2} sm={6} md={3}>
            <Zoom in={true} style={{ transitionDelay: '400ms' }}>
              <StatCard>
                <StatValue>{progress}%</StatValue>
                <StatLabel sx={{ color: '#3d6f66' }}>Progress</StatLabel>
                <StatIcon>
                  <TrendingUpIcon sx={{ color: '#3d6f66' }} />
                </StatIcon>
              </StatCard>
            </Zoom>
          </Grid>
        </Grid>

        {/* Forms Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="600" sx={{ color: '#000000', mb: 3 }}>
            Available Feedback Forms
          </Typography>

          {forms.length === 0 ? (
            <Fade in={true}>
              <Paper
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 16px',
                    bgcolor: '#0B1E33',
                  }}
                >
                  <FeedbackIcon sx={{ fontSize: 40, color: '#FFFFFF' }} />
                </Avatar>
                <Typography variant="h5" fontWeight="600" sx={{ color: '#0B1E33', mb: 1 }}>
                  No Forms Available
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B' }}>
                  Check back later for new feedback opportunities
                </Typography>
              </Paper>
            </Fade>
          ) : (
            <Grid container spacing={3}>
              {forms.map((form, index) => {
                const isCompleted = getFormCompletionStatus(form.id);
                return (
                  <Grid item xs={12} md={6} lg={4} key={form.id}>
                    <Grow in={true} timeout={500 + index * 100}>
                      <FormCard>
                        <CardContent sx={{ p: 3, flex: 1 }}>
                          {/* Status Badge */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Chip
                              label={isCompleted ? "Completed" : "Pending"}
                              size="small"
                              icon={isCompleted ? <CheckCircleIcon /> : <ScheduleIcon />}
                              sx={{
                                backgroundColor: isCompleted ? '#E8F5E9' : '#FFF3E0',
                                color: isCompleted ? '#2E7D32' : '#E65100',
                                fontWeight: 500,
                              }}
                            />
                          </Box>

                          {/* Title */}
                          <Typography variant="h6" fontWeight="600" sx={{ color: '#0B1E33', mb: 1 }}>
                            {form.title}
                          </Typography>

                          {/* Course & Instructor */}
                          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<SchoolIcon sx={{ color: '#0B1E33' }} />}
                              label={form.course}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: '#E2E8F0', color: '#0B1E33', mb: 1 }}
                            />
                            <Chip
                              icon={<PersonIcon sx={{ color: '#0B1E33' }} />}
                              label={form.instructor}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: '#E2E8F0', color: '#0B1E33', mb: 1 }}
                            />
                          </Stack>

                          {/* Description */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#000000',
                              mb: 2,
                            }}
                          >
                            {form.description}
                          </Typography>

                          {/* Question Types Preview */}
                          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            {form.questions?.map((q, idx) => (
                              <Tooltip key={idx} title={q.questionType || q.type}>
                                <Chip
                                  icon={getQuestionIcon(q.questionType || q.type)}
                                  size="small"
                                  sx={{
                                    backgroundColor: '#edf4ee',
                                    color: '#16302b',
                                  }}
                                />
                              </Tooltip>
                            ))}
                          </Box>

                          {/* Questions Count */}
                          <Typography variant="caption" sx={{ color: '#04060a', display: 'block', mb: 2 }}>
                            {form.questions?.length || 0} questions
                          </Typography>

                          {/* Action Button */}
                          <NavyButton
                            fullWidth
                            onClick={() => handleOpen(form)}
                            disabled={isCompleted}
                            startIcon={isCompleted ? <CheckCircleIcon /> : <FeedbackIcon />}
                          >
                            {isCompleted ? 'Submitted' : 'Give Feedback'}
                          </NavyButton>
                        </CardContent>
                      </FormCard>
                    </Grow>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </ContentWrapper>

      {/* Feedback Dialog */}
      <StyledDialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedForm && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="600" sx={{ color: '#0B1E33' }}>
                  {selectedForm.title}
                </Typography>
                <IconButton onClick={() => setOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748B', mt: 1 }}>
                Question {currentQuestionIndex + 1} of {selectedForm.questions?.length}
              </Typography>
            </DialogTitle>

            <DialogContent>
              <Divider sx={{ my: 2 }} />

              {/* Current Question */}
              {selectedForm.questions && selectedForm.questions.length > 0 && (
                <QuestionCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getQuestionIcon(selectedForm.questions[currentQuestionIndex].questionType || selectedForm.questions[currentQuestionIndex].type)}
                    <Typography variant="subtitle1" fontWeight="500" sx={{ color: '#0B1E33' }}>
                      {selectedForm.questions[currentQuestionIndex].questionText || selectedForm.questions[currentQuestionIndex].text}
                    </Typography>
                  </Box>
                  
                  {renderQuestion(selectedForm.questions[currentQuestionIndex])}
                </QuestionCard>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  sx={{
                    color: '#0B1E33',
                    borderRadius: '8px',
                    px: 3,
                  }}
                >
                  Previous
                </Button>
                
                {currentQuestionIndex < selectedForm.questions?.length - 1 ? (
                  <NavyButton onClick={handleNext}>
                    Next
                  </NavyButton>
                ) : (
                  <NavyButton
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting ? null : <SendIcon />}
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </NavyButton>
                )}
              </Box>
            </DialogContent>
          </>
        )}

        {submitting && (
          <LinearProgress
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: '#E2E8F0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#0B1E33',
              },
            }}
          />
        )}
      </StyledDialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backgroundColor: '#0B1E33',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default StudentDashboard;
