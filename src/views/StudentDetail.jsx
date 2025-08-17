import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import TextButton from "../views/TextButton";

const StudentDetails = () => {
  const { id } = useParams(); // Get student ID from URL
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample Static Data for students (in a real app, this would be fetched from an API)
  const sampleStudents = [
    { id: 1, name: "John Doe", grade: "A", average: 90, rank: 1 },
    { id: 2, name: "Jane Smith", grade: "B", average: 85, rank: 2 },
    { id: 3, name: "Sam Green", grade: "A", average: 92, rank: 3 },
    { id: 4, name: "Lisa Brown", grade: "C", average: 78, rank: 4 },
  ];

  useEffect(() => {
    try {
      const studentId = parseInt(id, 10);
      if (isNaN(studentId)) {
        throw new Error("Invalid student ID");
      }
      const studentData = sampleStudents.find((s) => s.id === studentId);
      if (!studentData) {
        throw new Error("Student not found");
      }
      setStudent(studentData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete student ${student?.name}?`)) {
      console.log(`Deleting student ${student?.id}`);
      // In a real app, implement API call here and redirect after success
      // For demo: alert and simulate redirect
      alert("Student deleted (simulated)");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading student details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-3xl font-semibold mb-6 text-red-600">Error</h2>
        <p className="text-red-500">{error}</p>
        <Link to="/" className="text-blue-500 underline mt-4 inline-block">
          Back to Student List
        </Link>
      </div>
    );
  }

  return (
    <div className="student-details max-w-2xl mx-auto !p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Student Details</h2>
      
      <dl className="details-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="detail-item bg-gray-50 p-4 rounded-md">
          <dt className="font-medium text-gray-700">Name:</dt>
          <dd className="mt-1 text-gray-900">{student.name}</dd>
        </div>
        <div className="detail-item bg-gray-50 p-4 rounded-md">
          <dt className="font-medium text-gray-700">Grade:</dt>
          <dd className="mt-1 text-gray-900">{student.grade}</dd>
        </div>
        <div className="detail-item bg-gray-50 p-4 rounded-md">
          <dt className="font-medium text-gray-700">Average Score:</dt>
          <dd className="mt-1 text-gray-900">{student.average}%</dd>
        </div>
        <div className="detail-item bg-gray-50 p-4 rounded-md">
          <dt className="font-medium text-gray-700">Rank:</dt>
          <dd className="mt-1 text-gray-900">#{student.rank}</dd>
        </div>
      </dl>

      {/* Action Buttons */}
      <div className="buttons flex flex-wrap gap-4 mt-8 border-t pt-6">
        <Link to={`/edit-student/${student.id}`}>
          <TextButton name="Edit Student" />
        </Link>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors duration-200"
          aria-label={`Delete student ${student.name}`}
        >
          Delete Student
        </button>
        <Link to="/" className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400 transition-colors duration-200">
          Back to List
        </Link>
      </div>
    </div>
  );
};

export default StudentDetails;