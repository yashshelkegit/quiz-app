import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [subjects, setSubjects] = useState([]); // Available subjects
  const [selectedSubject, setSelectedSubject] = useState('');
  const [responses, setResponses] = useState([]);
  const [quizzes, setQuizzes] = useState([]); // New state for quizzes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available subjects and quizzes on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch subjects
        const subjectsResponse = await axios.get('http://localhost:3000/response/subjects');
        const fetchedSubjects = Array.isArray(subjectsResponse.data) ? subjectsResponse.data : [];
        setSubjects(fetchedSubjects);

        // Fetch quizzes
        const quizzesResponse = await axios.get('http://localhost:3000/quiz/quizzes');
        setQuizzes(quizzesResponse.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to fetch subjects or quizzes');
      }
    };

    fetchInitialData();
  }, []);

  // Fetch responses when subject is selected
  const handleSubjectChange = async (e) => {
    const subject = e.target.value;
    setSelectedSubject(subject);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:3000/response/responses?subject=${subject.toUpperCase()}`);
      setResponses(response.data);
    } catch (error) {
      console.error('Error fetching responses:', error);
      setError('Failed to fetch quiz responses');
    } finally {
      setLoading(false);
    }
  };

  const isQuizExpired = (quiz) => {
    const quizEndTime = new Date(quiz.createdAt);
    quizEndTime.setMinutes(quizEndTime.getMinutes() + quiz.duration);
    return quizEndTime < new Date();
  };

  const handlePrintTable = () => {
    const printWindow = window.open('', '', 'height=500, width=800');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Quiz Responses - ${selectedSubject}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            h1 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>Quiz Responses - ${selectedSubject}</h1>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Roll No</th>
                <th>Total Score</th>
                <th>Quiz End Time</th>
              </tr>
            </thead>
            <tbody>
              ${responses.map(response => `
                <tr>
                  <td>${response.studentData.name}</td>
                  <td>${response.studentData.email}</td>
                  <td>${response.studentData.branch}</td>
                  <td>${response.studentData.rollNo}</td>
                  <td>${response.totalScore}</td>
                  <td>${response.endTime}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const handleSendEmails = async () => {
    if (responses.length === 0) {
      setError('No responses to send emails for');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/response/send-results', {
        subject: selectedSubject,
        responses: responses
      });

      alert('Emails sent successfully to all students');
    } catch (error) {
      console.error('Error sending emails:', error);
      setError('Failed to send emails');
    } finally {
      setLoading(false);
    }
  };
    // Handler for deleting a quiz
  const handleDeleteQuiz = async (quizId) => {
    // Confirm deletion
    const confirmDelete = window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.');
    
    if (confirmDelete) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:3000/quiz/${quizId}`);
        
        // Remove the deleted quiz from the local state
        setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
        
        // Show success message
        alert('Quiz deleted successfully');
      } catch (error) {
        console.error('Error deleting quiz:', error);
        setError('Failed to delete quiz');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Link to={"/admin"} className='underline text-blue-500 block my-5'>Create Quiz</Link>
      <h1 className="text-2xl font-bold mb-6">Admin Quiz Dashboard</h1>
      
      {/* Error Handling */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}
      
      {/* Quiz List Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div 
              key={quiz.id} 
              className={`
                p-4 border rounded-lg shadow-sm relative
                ${isQuizExpired(quiz) 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-white border-gray-200'}
              `}
            >
              <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
              <p className="text-sm">Subject: {quiz.subject}</p>
              <p className="text-sm">Duration: {quiz.duration} minutes</p>
              <p className="text-sm">
                Status: {isQuizExpired(quiz) ? 'Expired' : 'Active'}
              </p>
              <button 
                onClick={() => handleDeleteQuiz(quiz.id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Subject Selection and Responses Section (existing code) */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-grow">
          <label htmlFor="subject-select" className="block mb-2 font-medium">
            Select Subject
          </label>
          <select
            id="subject-select"
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="w-full p-2 border rounded"
            disabled={subjects.length === 0}
          >
            <option value="">
              {subjects.length === 0 ? 'Loading subjects...' : 'Select a Subject'}
            </option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        {responses.length > 0 && (
          <div className="flex space-x-2 self-end">
            <button 
              onClick={handlePrintTable}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Print Table
            </button>
            <button 
              onClick={handleSendEmails}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Send Emails
            </button>
          </div>
        )}
      </div>

      {/* Responses Table (existing code) */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Student Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Branch</th>
                <th className="p-3 border">Roll No</th>
                <th className="p-3 border">Total Score</th>
                <th className="p-3 border">Quiz Endtime</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => {
                return (
                  <tr key={response._id} className="hover:bg-gray-50">
                    <td className="p-3 border">{response.studentData.name}</td>
                    <td className="p-3 border">{response.studentData.email}</td>
                    <td className="p-3 border">{response.studentData.branch}</td>
                    <td className="p-3 border">{response.studentData.rollNo}</td>
                    <td className="p-3 border text-center">{response.totalScore}</td>
                    <td className="p-3 border text-center">{new Date(response.endTime).toLocaleString()} </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* No Results Message */}
      {!loading && responses.length === 0 && selectedSubject && (
        <div className="text-center text-gray-500 mt-6">
          No quiz responses found for {selectedSubject}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;