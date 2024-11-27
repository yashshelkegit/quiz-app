// src/pages/QuizList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/quiz/quizzes');
        setQuizzes(response.data);
      } catch (error) {
        setError("Failed to fetch quizzes");
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) return <div>Loading quizzes...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen border p-5 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Integrated Mid-Sem Examination</h2>
      <ul className="w-full border grid sm:grid-cols-3 grid-cols-1 items-center justify-center gap-5">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="bg-white p-4 rounded-lg shadow-lg">
            <Link to={`/quiz/${quiz.id}`} className="text-blue-600 hover:underline">
              {quiz.title}
            </Link>
            <div className="mt-2 text-sm text-gray-600">
              <p>Duration: {quiz.duration} minutes</p>
              <p>Subject: {quiz.subject? quiz.subject.toUpperCase(): "N/A"} </p>
              <Link to={`/quiz/${quiz.id}`} className="underline text-blue-500 hover:underline">
                Access Quiz
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
