// src/pages/StudentForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentForm = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch subjects
        const subjectsResponse = await axios.get('http://localhost:3000/response/subjects');
        const fetchedSubjects = Array.isArray(subjectsResponse.data) ? subjectsResponse.data : [];
        setSubjects(fetchedSubjects);

      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);
  // Define the initial state
  const initialState = {
    name: '',
    email: '',
    regNo: '',
    rollNo: '',
    section: '',
    academicYear: '',
    branch: '',
    subject: ''
  };

  // Use localStorage data as initial state if available
  const [formData, setFormData] = useState(initialState);
  const [subjects, setSubjects] = useState([]); // Available subjects

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('studentData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Save data to localStorage
    localStorage.setItem('studentData', JSON.stringify(formData));
    // Navigate to the quizzes page
    navigate('/quizzes');
  };

  return (
    <div className="min-h-screen md:p-5 flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Student Information</h2>

        {/* Name Input */}
        <div className='grid md:grid-cols-2 items-center'>
          <label className="block mb-2 font-semibold">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        />

        {/* Email Input */}
        <label className="block mb-2 font-semibold">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        />

        {/* Registration Number Input */}
        <label className="block mb-2 font-semibold">Registration No</label>
        <input
          type="text"
          name="regNo"
          value={formData.regNo}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        />

        {/* Roll Number Input */}
        <label className="block mb-2 font-semibold">Roll No</label>
        <input
          type="text"
          name="rollNo"
          value={formData.rollNo}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        />

        {/* Section Input (Dropdown) */}
        <label className="block mb-2 font-semibold">Section</label>
        <select
          name="section"
          value={formData.section}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        >
          <option value="">Select Section</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>

        {/* Academic Year Input (Dropdown) */}
        <label className="block mb-2 font-semibold">Academic Year</label>
        <select
          name="academicYear"
          value={formData.academicYear}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        >
          <option value="">Select Academic Year</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>

        {/* Branch Input (Dropdown) */}
        <label className="block mb-2 font-semibold">Branch</label>
        <select
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        >
          <option value="">Select Branch</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Electronics">Electronics</option>
          <option value="Mechanical">Mechanical</option>
        </select>

        {/* Subject Input */}
          <label htmlFor="subject-select" className="block mb-2 font-semibold">
             Subject
          </label>
          <select
            type="text"
            name="subject"
            // value={formData.subject}
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
            disabled={subjects.length === 0}
            required
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

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default StudentForm;
