import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Avatar,
  Fade,
  InputAdornment,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { styled, keyframes } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  RadioButtonChecked as McqIcon,
  TextFields as TextIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Title as TitleIcon,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import { adminAPI } from "../services/api";

const getFormIdentifier = (form) =>
  form?.id ?? form?.formId ?? form?.form_id ?? form?.feedbackFormId ?? "";

// Animations
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(40, 187, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

// Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f7f1e3 0%, #efe4ce 100%)',
  position: 'relative',
}));

// Fixed Create Feedback Header
const CreateHeader = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: '64px',
  left: 0,
  right: 0,
  zIndex: theme.zIndex.drawer + 1,
  background: 'rgba(31, 77, 69, 0.96)',
  backdropFilter: 'blur(10px)',
  borderRadius: 0,
  padding: theme.spacing(2, 4),
  boxShadow: '0 8px 24px rgba(31, 77, 69, 0.18)',
  borderBottom: '1px solid rgba(247, 241, 227, 0.14)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  paddingTop: '128px',
  paddingBottom: theme.spacing(4),
  maxWidth: '900px !important',
  minHeight: 'calc(100vh - 128px)',
}));

const FormCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '24px',
  backgroundColor: '#fffaf0',
  boxShadow: '0 20px 40px rgba(58, 48, 28, 0.12)',
  border: '1px solid #e8dcc2',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    backgroundColor: '#fffdf7',
    transition: 'all 0.3s ease',
  border: '1px solid #e5d8bf',
    '&:hover': {
      borderColor: '#1f4d45',
      boxShadow: '0 4px 12px rgba(31, 77, 69, 0.12)',
      backgroundColor: '#fffaf0',
    },
    '&.Mui-focused': {
      borderColor: '#1f4d45',
      boxShadow: '0 4px 16px rgba(31, 77, 69, 0.16)',
      backgroundColor: '#fffaf0',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiInputLabel-root': {
    color: '#7f7564',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#1f4d45',
    },
  },
  '& .MuiInputBase-input': {
    color: '#22332d',
    '&::placeholder': {
      color: '#9b8d77',
      opacity: 1,
      fontWeight: 400,
    },
  },
}));

// Fixed QuestionTypeButton - no default highlighting
const QuestionTypeButton = styled(Button)(({ theme, selected }) => ({
  borderRadius: '40px',
  padding: '12px 24px',
  border: '2px solid',
  borderColor: selected ? '#1f4d45' : '#cabfa8',
  backgroundColor: selected ? '#e5efe8' : '#fffdf7',
  color: selected ? '#1f4d45' : '#7f7564',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  width: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#1f4d45',
    backgroundColor: '#edf4ee',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(31, 77, 69, 0.12)',
    color: '#16302b',
  },
}));

const QuestionInputCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: '20px',
  backgroundColor: '#fffdf7',
  border: '1px solid #e5d8bf',
  boxShadow: '0 10px 30px rgba(84, 71, 43, 0.09)',
}));

const OptionsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f3e8',
  borderRadius: '16px',
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  border: '1px solid #e4d6be',
}));

const OptionItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(1),
  borderRadius: '12px',
  backgroundColor: '#fffdf7',
  border: '1px solid #e4d6be',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#1f4d45',
    boxShadow: '0 4px 12px rgba(31, 77, 69, 0.08)',
  },
}));

const AddOptionButton = styled(Button)(({ theme }) => ({
  color: '#1f4d45',
  fontWeight: 600,
  fontSize: '0.95rem',
  textTransform: 'none',
  padding: theme.spacing(1, 2),
  borderRadius: '30px',
  border: '1px dashed #1f4d45',
  backgroundColor: '#fffdf7',
  marginTop: theme.spacing(2),
  '&:hover': {
    backgroundColor: '#edf4ee',
    border: '1px solid #1f4d45',
    color: '#16302b',
  },
}));

const AddQuestionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1f4d45 0%, #d9a441 100%)',
  color: 'white',
  padding: '12px 32px',
  borderRadius: '40px',
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 10px 25px rgba(31, 77, 69, 0.22)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #16302b 0%, #b8872d 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 35px rgba(31, 77, 69, 0.28)',
  },
}));

const CreateButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1f4d45 0%, #d9a441 100%)',
  color: 'white',
  padding: '16px 48px',
  borderRadius: '40px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 10px 25px rgba(31, 77, 69, 0.22)',
  animation: `${glowAnimation} 2s infinite`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #16302b 0%, #b8872d 100%)',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(31, 77, 69, 0.26)',
  },
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '16px',
  backgroundColor: '#fffdf7',
  border: '1px solid #e4d6be',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: '0 12px 30px rgba(31, 77, 69, 0.12)',
    borderColor: '#1f4d45',
  },
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  backgroundColor: '#fffaf0',
  borderRadius: '16px',
  border: '1px dashed #cfa85a',
  marginTop: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#1f4d45',
    backgroundColor: '#fffdf7',
  },
  '& .MuiSvgIcon-root': {
    color: '#1f4d45',
    fontSize: '2rem',
    marginBottom: theme.spacing(1),
    opacity: 0.8,
  },
  '& h6': {
    color: '#16302b',
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  '& .MuiTypography-body2': {
    color: '#7f7564',
    fontSize: '0.85rem',
  },
}));

const CreateFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    instructor: '',
    description: '',
    questions: [],
  });
  
  // Set initial selected type to null (nothing selected)
  const [currentQuestion, setCurrentQuestion] = useState({
    type: null, // Changed from 'rating' to null
    text: '',
    options: ['Option 1', 'Option 2'],
  });
  
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const editingFormId = getFormIdentifier(location.state?.formData);

  useEffect(() => {
    if (location.state?.editing && location.state?.formData) {
      const formData = location.state.formData;
      setFormData({
        title: formData.title || '',
        course: formData.course || '',
        instructor: formData.instructor || '',
        description: formData.description || '',
        questions: formData.questions || [],
      });
      setIsEditing(true);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.type) {
      setSnackbar({
        open: true,
        message: 'Please select a question type',
        severity: 'warning',
      });
      return;
    }
    
    if (!currentQuestion.text.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a question text',
        severity: 'warning',
      });
      return;
    }

    const newQuestion = {
      id: Date.now(),
      type: currentQuestion.type,
      text: currentQuestion.text,
      options: currentQuestion.type === 'mcq' ? [...currentQuestion.options] : [],
    };

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });

    // Reset to no selection
    setCurrentQuestion({
      type: null,
      text: '',
      options: ['Option 1', 'Option 2'],
    });
    setShowQuestionInput(false);

    setSnackbar({
      open: true,
      message: 'Question added successfully',
      severity: 'success',
    });
  };

  const handleRemoveQuestion = (questionId) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId),
    });
  };

  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, `Option ${currentQuestion.options.length + 1}`],
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleRemoveOption = (index) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Form title is required';
    if (!formData.course.trim()) newErrors.course = 'Course name is required';
    if (!formData.instructor.trim()) newErrors.instructor = 'Instructor name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (formData.questions.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add at least one question',
        severity: 'warning',
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: formData.title.trim(),
        course: formData.course.trim(),
        instructor: formData.instructor.trim(),
        description: formData.description.trim(),
        questions: formData.questions.map((question, index) => ({
          questionText: (question.questionText || question.text || '').trim(),
          questionType: (question.questionType || question.type || 'TEXT').toUpperCase(),
          options: (question.questionType || question.type || '').toLowerCase() === 'mcq'
            ? (question.options || []).map((option) => option.trim()).filter(Boolean)
            : [],
          orderIndex: index,
        })),
      };

      let result;
      if (isEditing && editingFormId) {
        result = await adminAPI.updateForm(editingFormId, payload);
      } else {
        result = await adminAPI.createForm(payload);
      }

      if (result?.success === false) {
        throw new Error(result.message || (isEditing ? 'Failed to update form' : 'Failed to create form'));
      }

      setSnackbar({
        open: true,
        message: isEditing ? 'Form updated successfully! Redirecting...' : 'Form created successfully! Redirecting...',
        severity: 'success',
      });

      setTimeout(() => {
        navigate("/admin");
      }, 1200);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message === 'NETWORK_ERROR'
          ? 'Cannot connect to backend. Make sure the server is running.'
          : (error.message || (isEditing ? 'Failed to update form' : 'Failed to create form')),
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch(type) {
      case 'rating': return <StarIcon sx={{ color: '#f59e0b' }} />;
      case 'mcq': return <McqIcon sx={{ color: '#1f4d45' }} />;
      case 'text': return <TextIcon sx={{ color: '#10b981' }} />;
      default: return null;
    }
  };

  return (
    <PageContainer>
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300 }}>
        <Navbar />
      </Box>

      <Box sx={{ height: '64px' }} />

      {/* Fixed Create Feedback Header */}
      <CreateHeader elevation={0}>
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate("/admin")}
            sx={{ 
              color: '#f7f1e3',
              backgroundColor: '#16302b',
              width: 40,
              height: 40,
              '&:hover': {
                backgroundColor: '#0f211d',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#f7f1e3' }}>
            Create Feedback Form
          </Typography>
        </Container>
      </CreateHeader>

      {/* Content with proper spacing for fixed headers */}
      <ContentWrapper maxWidth="lg">
        {/* Main Form */}
        <FormCard>
          {/* Form Fields */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#16302b', mb: 1 }}>
                Form Title *
              </Typography>
              <StyledTextField
                fullWidth
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Mid-Semester Course Evaluation"
                error={!!errors.title}
                helperText={errors.title}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#16302b', mb: 1 }}>
                Course Name *
              </Typography>
              <StyledTextField
                fullWidth
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science 101"
                error={!!errors.course}
                helperText={errors.course}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#16302b', mb: 1 }}>
                Instructor Name *
              </Typography>
              <StyledTextField
                fullWidth
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Smith"
                error={!!errors.instructor}
                helperText={errors.instructor}
                variant="outlined"
              />
            </Grid>
          </Grid>

          {/* Description Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#16302b', mb: 1 }}>
              Description
            </Typography>
            <StyledTextField
              fullWidth
              multiline
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of this feedback form"
              variant="outlined"
            />
          </Box>

          <Divider sx={{ my: 4, borderColor: '#e2d5bd' }} />

          {/* Questions Section */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#16302b', mb: 3 }}>
              Questions
            </Typography>

            {/* Question Type Buttons - No default selection */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={4}>
                <QuestionTypeButton
                  fullWidth
                  selected={currentQuestion.type === 'rating'}
                  onClick={() => {
                    setCurrentQuestion({ 
                      ...currentQuestion, 
                      type: 'rating', 
                      options: ['Option 1', 'Option 2'] 
                    });
                    setShowQuestionInput(true);
                  }}
                  startIcon={<StarIcon />}
                >
                  Rating
                </QuestionTypeButton>
              </Grid>
              <Grid item xs={4}>
                <QuestionTypeButton
                  fullWidth
                  selected={currentQuestion.type === 'mcq'}
                  onClick={() => {
                    setCurrentQuestion({ 
                      ...currentQuestion, 
                      type: 'mcq', 
                      options: ['Option 1', 'Option 2'] 
                    });
                    setShowQuestionInput(true);
                  }}
                  startIcon={<McqIcon />}
                >
                  Multiple Choice
                </QuestionTypeButton>
              </Grid>
              <Grid item xs={4}>
                <QuestionTypeButton
                  fullWidth
                  selected={currentQuestion.type === 'text'}
                  onClick={() => {
                    setCurrentQuestion({ 
                      ...currentQuestion, 
                      type: 'text', 
                      options: [] 
                    });
                    setShowQuestionInput(true);
                  }}
                  startIcon={<TextIcon />}
                >
                  Text
                </QuestionTypeButton>
              </Grid>
            </Grid>

            {/* Question Input Area - Only shown when a type is selected */}
            {showQuestionInput && currentQuestion.type && (
              <Fade in={true}>
                <QuestionInputCard>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#16302b', mb: 1 }}>
                        Question Text
                      </Typography>
                      <StyledTextField
                        fullWidth
                        value={currentQuestion.text}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                        placeholder="Enter your question here..."
                        variant="outlined"
                      />
                    </Grid>

                    {currentQuestion.type === 'mcq' && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#16302b', mb: 2 }}>
                          Options
                        </Typography>
                        <OptionsContainer>
                          {currentQuestion.options.map((option, index) => (
                            <OptionItem key={index}>
                              <Box 
                                sx={{ 
                                  width: 20, 
                                  height: 20, 
                                  borderRadius: '50%', 
                                  border: '2px solid #1f4d45',
                                  flexShrink: 0,
                                }} 
                              />
                              <StyledTextField
                                fullWidth
                                size="small"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fffaf0' } }}
                              />
                              <IconButton 
                                onClick={() => handleRemoveOption(index)}
                                disabled={currentQuestion.options.length <= 2}
                                sx={{ 
                                  color: '#ef4444',
                                  backgroundColor: '#450a0a',
                                  width: 36,
                                  height: 36,
                                  '&:hover': {
                                    backgroundColor: '#7f1d1d',
                                  },
                                  '&:disabled': {
                                    backgroundColor: '#ece3d1',
                                    color: '#64748b',
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </OptionItem>
                          ))}
                          <AddOptionButton
                            startIcon={<AddIcon />}
                            onClick={handleAddOption}
                            fullWidth
                          >
                            ADD OPTION
                          </AddOptionButton>
                        </OptionsContainer>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          onClick={() => {
                            setShowQuestionInput(false);
                            setCurrentQuestion({
                              type: null,
                              text: '',
                              options: ['Option 1', 'Option 2'],
                            });
                          }}
                          sx={{ 
                            color: '#7f7564',
                            px: 4,
                            py: 1.5,
                            borderRadius: '30px',
                            border: '1px solid #d8ccb6',
                            '&:hover': {
                              backgroundColor: '#f2ebdc',
                            },
                          }}
                        >
                          Cancel
                        </Button>
                        <AddQuestionButton
                          onClick={handleAddQuestion}
                          startIcon={<AddIcon />}
                        >
                          Add Question
                        </AddQuestionButton>
                      </Box>
                    </Grid>
                  </Grid>
                </QuestionInputCard>
              </Fade>
            )}

            {/* Questions List */}
            {formData.questions.length === 0 ? (
              <EmptyStateBox>
                <QuizIcon />
                <Typography variant="h6" gutterBottom>
                  No questions added yet
                </Typography>
                <Typography variant="body2">
                  Click the buttons above to start adding questions
                </Typography>
              </EmptyStateBox>
            ) : (
              <Box sx={{ mt: 4 }}>
                {formData.questions.map((question, index) => (
                  <Fade in={true} key={question.id}>
                    <QuestionCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                width: 28, 
                                height: 28, 
                                bgcolor: '#1f4d45',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <Chip
                              icon={getQuestionTypeIcon(question.type)}
                              label={question.type.toUpperCase()}
                              size="small"
                              sx={{
                                backgroundColor: 
                                  question.type === 'rating' ? '#422006' : 
                                  question.type === 'mcq' ? '#1e3a5f' : '#064e3b',
                                color: 
                                  question.type === 'rating' ? '#f59e0b' : 
                                  question.type === 'mcq' ? '#1f4d45' : '#4f7d58',
                                fontWeight: 600,
                                border: '1px solid',
                                borderColor: 
                                  question.type === 'rating' ? '#b45309' : 
                                  question.type === 'mcq' ? '#2563eb' : '#059669',
                              }}
                            />
                          </Box>
                          <IconButton 
                            onClick={() => handleRemoveQuestion(question.id)}
                            size="small"
                            sx={{ 
                              color: '#ef4444',
                              backgroundColor: '#450a0a',
                              '&:hover': {
                                backgroundColor: '#7f1d1d',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body1" sx={{ ml: 2, fontWeight: 500, color: '#16302b' }}>
                          {question.text}
                        </Typography>
                        
                        {question.type === 'mcq' && question.options && (
                          <Box sx={{ ml: 2, mt: 2 }}>
                            {question.options.map((opt, i) => (
                              <Typography 
                                key={i} 
                                variant="body2" 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1, 
                                  color: '#7f7564',
                                  mb: 0.5,
                                }}
                              >
                                <Box 
                                  component="span" 
                                  sx={{ 
                                    width: 16, 
                                    height: 16, 
                                    borderRadius: '50%', 
                                    border: '2px solid #1f4d45',
                                    mr: 1,
                                  }} 
                                />
                                {opt}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </QuestionCard>
                  </Fade>
                ))}
              </Box>
            )}
          </Box>

          {/* Create Form Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CreateButton
              onClick={handleSubmit}
              size="large"
              disabled={saving}
            >
              {saving ? 'Saving...' : isEditing ? 'Update Form' : 'Create Form'}
            </CreateButton>
          </Box>
        </FormCard>
      </ContentWrapper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2, 
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            backgroundColor: snackbar.severity === 'success' ? '#059669' : '#b45309',
            color: '#fffaf0',
            '& .MuiAlert-icon': {
              color: '#fffaf0',
            },
            fontWeight: 500,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default CreateFeedback;
