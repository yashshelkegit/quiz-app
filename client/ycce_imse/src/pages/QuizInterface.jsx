import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineWarning, AiOutlineClockCircle } from 'react-icons/ai';

const QuizInterface = () => {
  const { id } = useParams();
  const [quizMetadata, setQuizMetadata] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    email: '',
    rollNumber: '',
    branch: '',
    semester: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchQuizMetadata();
  }, [id]);

  useEffect(() => {
    let timer;
    if (timeLeft && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleQuizSubmit();
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuizMetadata = async () => {
    try {
      const response = await axios.get(`/quiz/${id}`);
      if (response.data.success) {
        setQuizMetadata(response.data.quiz);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`/quiz/${id}`, {
        data: { studentInfo }
      });

      if (response.data.success) {
        setQuiz(response.data.quiz);
        setTimeLeft(response.data.quiz.duration * 60); // Convert minutes to seconds
        setIsRegistered(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  const handleQuizSubmit = async (e) => {
  e.preventDefault();
    console.log("object")
  // Retrieve student data from localStorage
  const studentData = JSON.parse(localStorage.getItem('studentData'));

  // Collect selected answers
  const answers = quiz.questions.map(question => {
    const selectedOption = document.querySelector(`input[name="question_${question.id}"]:checked`);
    return {
      queId: question.id,
      selectedAnswer: selectedOption ? selectedOption.value : null
    };
  });

  try {
    const response = await axios.post('http://localhost:3000/submit', {
      quizId: id,
      studentInfo: {
        name: studentData.name,
        email: studentData.email,
        rollNumber: studentData.rollNo,
        branch: studentData.branch,
        semester: studentData.section
      },
      answers: answers,
      startTime: new Date(Date.now() - (timeLeft * 1000)), // Calculate start time
      endTime: new Date() // Current time
    });

    if (response.data.success) {
      // Show result modal or navigate to results page
      alert(`Quiz submitted! Your score: ${response.data.totalScore}/${response.data.maxScore}`);
      // Optionally navigate to results page
      // history.push(`/quiz-result/${id}`);
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to submit quiz');
  }
};

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AiOutlineWarning className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{quizMetadata.title}</h1>
          <div className="mb-6">
            <p>Subject: {quizMetadata.subject}</p>
            <p>Branch: {quizMetadata.branch}</p>
            <p>Duration: {quizMetadata.duration} minutes</p>
          </div>

          <form onSubmit={handleStudentRegistration} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name*</label>
              <input
                type="text"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email*</label>
              <input
                type="email"
                value={studentInfo.email}
                onChange={(e) => setStudentInfo({...studentInfo, email: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Roll Number*</label>
              <input
                type="text"
                value={studentInfo.rollNumber}
                onChange={(e) => setStudentInfo({...studentInfo, rollNumber: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Branch*</label>
              <select
                value={studentInfo.branch}
                onChange={(e) => setStudentInfo({...studentInfo, branch: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Branch</option>
                <option value="CSE">Computer Science</option>
                <option value="ECE">Electronics</option>
                <option value="ME">Mechanical</option>
                <option value="CE">Civil</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Semester*</label>
              <select
                value={studentInfo.semester}
                onChange={(e) => setStudentInfo({...studentInfo, semester: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Start Quiz
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="flex items-center gap-2 text-blue-600">
            <AiOutlineClockCircle />
            <span>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        </div>

        <form onSubmit={handleQuizSubmit}>
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="mb-6 p-4 border rounded">
              <p className="font-medium mb-3">
                {index + 1}. {question.text}
              </p>
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value={option}
                      className="form-radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Submit Quiz
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizInterface;