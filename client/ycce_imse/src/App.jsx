// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuizUploadForm from './pages/QuizUploadForm';
// import QuizInterface from './pages/QuizInterface';
import StudentForm from './pages/StudentForm';
import QuizList from './pages/QuizList';
import ProtectedRoute from './components/ProtectedRoute';
import Quiz from './pages/Quiz';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentForm />} />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <QuizList />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/quiz/:id" element={<QuizInterface />} /> */}
        <Route path="/admin" element={<QuizUploadForm />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/quiz/:id" element={<Quiz/>} />
      </Routes>
    </Router>
  );
}

export default App;
