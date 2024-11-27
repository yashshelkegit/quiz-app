import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { AiOutlineCheckCircle, AiOutlineWarning } from "react-icons/ai";
import axios from 'axios';
import { Link } from "react-router-dom";

const QuizUploadForm = () => {
	const [formData, setFormData] = useState({
		title: "",
		subject: "",
		branch: "",
		academicYear: "",
		duration: "",
		startTime: "",
		endTime: "",
	});

	const [jsonFile, setJsonFile] = useState(null);
	const [jsonPreview, setJsonPreview] = useState(null);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const validateJsonStructure = (json) => {
		const required = ["questions"];
		for (const field of required) {
			if (
				!json[field] ||
				!Array.isArray(json[field]) ||
				json[field].length === 0
			) {
				return false;
			}
		}
		return true;
	};

	const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/json') {
        setError('Please upload a JSON file');
        setJsonFile(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          if (validateJsonStructure(json)) {
            setJsonFile(file);
            setError('');
          } else {
            setError('Invalid quiz structure. Please check the JSON format.');
            setJsonFile(null);
          }
        } catch (err) {
          setError('Invalid JSON file');
          setJsonFile(null);
        }
      };
      reader.readAsText(file);
    }
  };

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const requiredFields = ['title', 'subject', 'branch', 'academicYear', 'duration', 'startTime', 'endTime'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!jsonFile) {
      setError('Please upload a JSON file');
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      formDataToSend.append('quizFile', jsonFile);

      const response = await axios.post('http://localhost:3000/admin/quiz/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess(true);
        // Show the shareable link
        alert(`Quiz created! Shareable link: ${response.data.quiz.shareableLink}`);
        // Reset form
        setFormData({
          title: '',
          subject: '',
          branch: '',
          academicYear: '',
          duration: '',
          startTime: '',
          endTime: '',
        });
        setJsonFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    }
  };

	const currentYear = new Date().getFullYear();
	const academicYears = Array.from(
		{ length: 5 },
		(_, i) => `${currentYear + i}-${currentYear + i + 1}`
	);

	return (
		<div className="min-h-screen grid items-center">
			<div className="mx-auto p-5 w-full max-w-3xl bg-white rounded-lg shadow-lg">
				<Link to={"/admin-dashboard"} className="block  text-blue-600 my-5 underline">Go to Admin Panel</Link>
			<h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<div className="grid w-full md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium mb-1" htmlFor="title">
							Quiz Title*
						</label>
						<input
							type="text"
							id="title"
							name="title"
							value={formData.title}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter quiz title"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1" htmlFor="subject">
							Subject*
						</label>
						<input
							type="text"
							id="subject"
							name="subject"
							value={formData.subject}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter subject"
						/>
					</div>

					

					<div>
						<label className="block text-sm font-medium mb-1" htmlFor="branch">
							Branch*
						</label>
						<select
							id="branch"
							name="branch"
							value={formData.branch}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select Branch</option>
							<option value="CSE">Computer Science</option>
							<option value="ECE">Electronics</option>
							<option value="ME">Mechanical</option>
							<option value="CE">Civil</option>
						</select>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-1"
							htmlFor="academicYear"
						>
							Academic Year*
						</label>
						<select
							id="academicYear"
							name="academicYear"
							value={formData.academicYear}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select Year</option>
							{academicYears.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Time Settings */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label
							className="block text-sm font-medium mb-1"
							htmlFor="duration"
						>
							Duration (minutes)*
						</label>
						<input
							type="number"
							id="duration"
							name="duration"
							value={formData.duration}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							min="1"
							placeholder="Quiz duration"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-1"
							htmlFor="startTime"
						>
							Start Time*
						</label>
						<input
							type="datetime-local"
							id="startTime"
							name="startTime"
							value={formData.startTime}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1" htmlFor="endTime">
							End Time*
						</label>
						<input
							type="datetime-local"
							id="endTime"
							name="endTime"
							value={formData.endTime}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				{/* File Upload */}
				<div className="mt-6">
					<label className="block text-sm font-medium mb-2">
						Upload Quiz JSON*
					</label>
					<div className="border-2 border-dashed rounded-lg p-6 text-center">
						<input
							type="file"
							accept=".json"
							onChange={handleFileChange}
							className="hidden"
							id="json-upload"
						/>
						<label
							htmlFor="json-upload"
							className="cursor-pointer flex flex-col items-center"
						>
							<FiUpload className="h-12 w-12 text-gray-400" />
							<span className="mt-2 text-sm text-gray-500">
								Click to upload quiz JSON file
							</span>
						</label>
						{jsonFile && (
							<div className="mt-2 text-sm text-green-600 flex items-center justify-center gap-1">
								<AiOutlineCheckCircle className="inline" />
								File uploaded: {jsonFile.name}
							</div>
						)}
					</div>
				</div>

				{/* Error/Success Messages */}
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2">
						<AiOutlineWarning className="h-5 w-5" />
						<p>{error}</p>
					</div>
				)}

				{success && (
					<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center gap-2">
						<AiOutlineCheckCircle className="h-5 w-5" />
						<p>Quiz created successfully!</p>
					</div>
				)}

				{/* Submit Button */}
				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Create Quiz
				</button>
			</form>
		</div>
		</div>
	);
};

export default QuizUploadForm;
