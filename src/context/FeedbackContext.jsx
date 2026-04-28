// context/FeedbackContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { adminAPI, studentAPI } from "../services/api";

const FeedbackContext = createContext();

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback must be used within a FeedbackProvider");
  return context;
};

export const FeedbackProvider = ({ children }) => {
  const [forms, setForms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [submittedFormIds, setSubmittedFormIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("currentUser")); } catch { return null; }
  })();

  const loadForms = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === "admin") {
        const data = await adminAPI.getAllForms();
        setForms(Array.isArray(data) ? data : []);
      } else {
        const [activeForms, submitted] = await Promise.all([
          studentAPI.getActiveForms(),
          studentAPI.getSubmittedFormIds(),
        ]);
        setForms(Array.isArray(activeForms) ? activeForms : []);
        setSubmittedFormIds(Array.isArray(submitted) ? submitted : []);
      }
    } catch (err) {
      console.error("Failed to load forms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await adminAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  }, []);

  const createForm = async (newForm) => {
    const result = await adminAPI.createForm(newForm);
    if (result.success) await loadForms();
    return result;
  };

  const toggleFormStatus = async (id) => {
    const result = await adminAPI.toggleFormStatus(id);
    if (result.success) await loadForms();
    return result;
  };

  const deleteForm = async (id) => {
    const result = await adminAPI.deleteForm(id);
    if (result.success) await loadForms();
    return result;
  };

  const submitFeedback = async (payload) => {
    const result = await studentAPI.submitFeedback(payload);
    if (result.success) {
      setSubmittedFormIds((prev) => [...prev, payload.formId]);
    }
    return result;
  };

  return (
    <FeedbackContext.Provider value={{
      forms, analytics, submittedFormIds, loading,
      loadForms, loadAnalytics, createForm, toggleFormStatus, deleteForm, submitFeedback,
    }}>
      {children}
    </FeedbackContext.Provider>
  );
};
