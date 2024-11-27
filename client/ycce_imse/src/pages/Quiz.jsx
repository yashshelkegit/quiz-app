import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Quiz = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [violations, setViolations] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ points: 0, percentage: 0 });

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/quiz/${id}`);
        setQuiz(response.data);
        setTimeLeft(response.data.duration * 60);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setError(error.response?.data?.message || "Failed to fetch quiz");
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Fullscreen and violation tracking
  useEffect(() => {
    const handleFullScreenChange = () => {
      // If not in fullscreen and quiz is not submitted, force fullscreen
      if (!document.fullscreenElement && !isSubmitted) {
        setViolations(prev => prev + 1);
        requestFullscreen();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setViolations(prev => prev + 1);
        alert(`Warning: Tab change detected! Violations: ${violations + 1}`);
      }
    };

    // Prevent default fullscreen exit behaviors
    const preventEscapeFullscreen = (e) => {
      if (e.key === 'Escape' && !isSubmitted) {
        e.preventDefault();
        requestFullscreen();
      }
    };

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', preventEscapeFullscreen);

    // Cleanup listeners
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', preventEscapeFullscreen);
    };
  }, [violations, isSubmitted]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isSubmitted]);

  // Fullscreen request function with error handling
  const requestFullscreen = () => {
    const elem = document.documentElement;
    try {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // Internet Explorer/Edge
        elem.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      alert('Failed to enter fullscreen mode. Please try again.');
    }
  };

  // Start quiz handler
  const handleStartQuiz = () => {
    requestFullscreen();
  };

  // Answer selection handler
  const handleAnswerSelect = (questionId, selectedOption) => {
    if (!isSubmitted) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: selectedOption
      }));
    }
  };

  // Score calculation
  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach(question => {
      totalPoints += question.points;
      if (answers[question.id] === question.answer) {
        earnedPoints += question.points;
      }
    });

    return {
      points: earnedPoints,
      percentage: (earnedPoints / totalPoints) * 100
    };
  };

  // Submit quiz handler
  const handleSubmit = async () => {
    const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);

    const submissionData = {
      id: id, 
      quizId: quiz.quizId || null,
      studentData: {
        id: studentData.id || null,
        name: studentData.name,
        email: studentData.email,
        branch: studentData.branch,
        section: studentData.section,
        rollNo: studentData.rollNo,
        regNo: studentData.regNo,
        academicYear: studentData.academicYear,
      },
      quizMongoId: quiz._id || null,
      violations: violations,
      studentId: studentData.id || null,
      subject: studentData.subject || "",
      studentEmail: studentData.email,
      answers: quiz.questions.map(question => ({
        queId: question.id,
        selectedAnswer: answers[question.id] || null,
        isCorrect: answers[question.id] === question.answer
      })),
      totalScore: finalScore.points,
      startTime: new Date(Date.now() - (quiz.duration * 60 * 1000)),
      endTime: new Date()
    };

    try {
      const response = await axios.post('http://localhost:3000/response/submit', submissionData);
      console.log('Quiz submitted successfully', response.data);
      
      // Exit fullscreen mode before navigating
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // Internet Explorer/Edge
          document.msExitFullscreen();
        }
      }

      // Navigate to home page after successful submission
      navigate('/');
      alert("Response has been submitted successfully.");
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please contact support.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl font-semibold">Loading quiz...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl font-semibold text-red-500">{error}</div>
    </div>
  );

  if (!quiz?.active) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl font-semibold text-red-500">This quiz is no longer active.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {!isFullScreen ? (
        <div className="max-w-3xl mx-auto text-center bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
          <div className="mb-6">
            <p className="text-gray-600">Duration: {quiz.duration} minutes</p>
            <p className="text-gray-600">Total Questions: {quiz.questions.length}</p>
            <p className="text-gray-600">Total Points: {quiz.questions.reduce((sum, q) => sum + q.points, 0)}</p>
          </div>
          <button
            onClick={handleStartQuiz}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Quiz in Fullscreen
          </button>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <div className="flex gap-4">
              <div className="text-red-500">
                Violations: {violations}
              </div>
              <div className={`${timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>
                Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>
          </div>

          {isSubmitted ? (
            <div className="text-center p-6">
              <h3 className="text-2xl font-bold mb-4">Quiz Completed!</h3>
              {/* <p className="text-xl mb-2">Points: {score.points}</p>
              <p className="text-xl">Percentage: {score.percentage.toFixed(1)}%</p> */}
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {quiz.questions.map((question) => (
                  <div key={question.id} className="border-b pb-4">
                    <div className="flex justify-between mb-3">
                      <p className="font-medium">
                        {question.id}. {question.text}
                      </p>
                      <span className="text-sm text-gray-500">
                        Points: {question.points}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded cursor-pointer ${
                            answers[question.id] === option
                              ? 'bg-blue-100 border-blue-500'
                              : 'hover:bg-gray-100 border-gray-200'
                          } border`}
                          onClick={() => handleAnswerSelect(question.id, option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                >
                  Submit Quiz
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;