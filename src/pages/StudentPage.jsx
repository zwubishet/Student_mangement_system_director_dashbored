import { useState } from "react";
import { Link } from "react-router-dom";
import SideBar from "../components/SideBar";
import TextButton from "../views/TextButton";
import { FaRegCheckCircle, FaRegTimesCircle, FaUserGraduate, FaUsers, FaExchangeAlt, FaChartLine } from "react-icons/fa";

const StudentPage = () => {
  // Sample Data for Students (in a real app, fetch from API)
  const [students] = useState([
    { id: 1, name: "John Doe", grade: "A", average: 90, rank: 1 },
    { id: 2, name: "Jane Smith", grade: "B", average: 85, rank: 2 },
    { id: 3, name: "Sam Green", grade: "A", average: 92, rank: 3 },
    { id: 4, name: "Lisa Brown", grade: "C", average: 78, rank: 4 },
  ]);

  // Sample Data for Recent Activities (dynamic or from logs)
  const [activities] = useState([
    { id: 1, action: "Announce Tomorrow's Meeting", completed: true },
    { id: 2, action: "Send Warning to Student", completed: true },
    { id: 3, action: "Make Schedule Adjustment", completed: false },
    { id: 4, action: "Make Teacher Change", completed: false },
    { id: 5, action: "Approve Student Results", completed: true },
  ]);

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Overview Stats
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.grade !== "C").length;
  const transferredStudents = students.filter((s) => s.grade === "C").length;
  const averageGrade = (students.reduce((acc, student) => acc + student.average, 0) / totalStudents).toFixed(2);

  // Open Modal
  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  // Handle Activity Dismiss (simulate removal)
  const handleDismissActivity = (id) => {
    console.log(`Dismissing activity ${id}`);
    // In real app: update state or API call to remove
  };

  // Handle Student Delete in Modal
  const handleDeleteStudent = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedStudent?.name}?`)) {
      console.log(`Deleting student ${selectedStudent?.id}`);
      closeModal();
      // In real app: API call and update students state
      alert("Student deleted (simulated)");
    }
  };

  return (
    <>
      <SideBar />
      <div className="student-dashboard ml-64 !p-6 flex flex-col lg:flex-row justify-between gap-8 min-h-screen bg-gray-100">
        {/* Main Content Area */}
        <div className="flex-1 lg:basis-3/4">
          {/* Overview Stats */}
          <section aria-labelledby="overview-heading">
            <h1 id="overview-heading" className="text-3xl font-bold !mb-6 text-gray-800">Director's Dashboard</h1>
            <div className="overview grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 !mb-8">
              <div className="overview-card !p-6 bg-white shadow-md rounded-lg flex items-center gap-4 border-l-4 border-blue-500">
                <FaUsers className="text-4xl text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
                  <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
                </div>
              </div>
              <div className="overview-card !p-6 bg-white shadow-md rounded-lg flex items-center gap-4 border-l-4 border-green-500">
                <FaUserGraduate className="text-4xl text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Active Students</h3>
                  <p className="text-3xl font-bold text-gray-900">{activeStudents}</p>
                </div>
              </div>
              <div className="overview-card !p-6 bg-white shadow-md rounded-lg flex items-center gap-4 border-l-4 border-yellow-500">
                <FaExchangeAlt className="text-4xl text-yellow-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Transferred</h3>
                  <p className="text-3xl font-bold text-gray-900">{transferredStudents}</p>
                </div>
              </div>
              <div className="overview-card !p-6 bg-white shadow-md rounded-lg flex items-center gap-4 border-l-4 border-purple-500">
                <FaChartLine className="text-4xl text-purple-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Avg Score</h3>
                  <p className="text-3xl font-bold text-gray-900">{averageGrade}%</p>
                </div>
              </div>
            </div>
          </section>

          {/* Student List */}
          <section aria-labelledby="students-heading" className="mb-8">
            <h2 id="students-heading" className="text-2xl font-semibold !mb-4 text-gray-800">Manage Students</h2>
            <div className="student-list grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="student-card !p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer flex justify-between items-center"
                  onClick={() => openModal(student)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${student.name}`}
                >
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-500">Rank #{student.rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 font-medium">Grade: {student.grade}</p>
                    <p className="text-gray-600">Average: {student.average}%</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Optional: Add Student Button */}
            <div className="mt-6">
              <Link to="/add-student">
                <TextButton name="Add New Student" />
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar: Recent Activities */}
        <aside className="lg:basis-1/4">
          <div className="activity-container !p-6 bg-white rounded-lg shadow-md sticky top-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600 flex items-center gap-2">
              <FaRegCheckCircle className="text-blue-600" /> Recent Activities
            </h2>
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-center justify-between !p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <FaRegCheckCircle className={`w-5 h-5 ${activity.completed ? 'text-green-500' : 'text-gray-400'}`} />
                    <p className="text-gray-800">{activity.action}</p>
                  </div>
                  <button
                    onClick={() => handleDismissActivity(activity.id)}
                    aria-label="Dismiss activity"
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FaRegTimesCircle className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Modal for Student Details */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Student Details</h2>
            <dl className="grid grid-cols-1 gap-4 mb-6">
              <div className="border-b pb-2">
                <dt className="font-medium text-gray-700">Name:</dt>
                <dd className="text-gray-900">{selectedStudent.name}</dd>
              </div>
              <div className="border-b pb-2">
                <dt className="font-medium text-gray-700">Grade:</dt>
                <dd className="text-gray-900">{selectedStudent.grade}</dd>
              </div>
              <div className="border-b pb-2">
                <dt className="font-medium text-gray-700">Average Score:</dt>
                <dd className="text-gray-900">{selectedStudent.average}%</dd>
              </div>
              <div className="border-b pb-2">
                <dt className="font-medium text-gray-700">Rank:</dt>
                <dd className="text-gray-900">#{selectedStudent.rank}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-3 mb-4">
              <Link to={`/edit-student/${selectedStudent.id}`}>
                <TextButton name="Edit Student" />
              </Link>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                aria-label={`Delete ${selectedStudent.name}`}
              >
                Delete
              </button>
            </div>

            <button
              onClick={closeModal}
              className="w-full px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentPage;