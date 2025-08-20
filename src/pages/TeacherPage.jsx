import { useState } from "react";
import { Link } from "react-router-dom";
import SideBar from "../components/SideBar";
import TextButton from "../views/TextButton";
import { FaRegCheckCircle, FaRegTimesCircle, FaChalkboardTeacher, FaUsers, FaDollarSign, FaClock } from "react-icons/fa";

const TeacherPage = () => {
  // Sample Data for Teachers (in a real app, fetch from API)
  const [teachers] = useState([
    { id: 1, name: "John Doe", subject: "Math", hours: 20, salary: 5000, yearsOfService: 5, grade: "Grade 10" },
    { id: 2, name: "Jane Smith", subject: "Science", hours: 18, salary: 4800, yearsOfService: 3, grade: "Grade 9" },
    { id: 3, name: "Sam Green", subject: "English", hours: 22, salary: 5200, yearsOfService: 7, grade: "Grade 11" },
    { id: 4, name: "Lisa Brown", subject: "History", hours: 15, salary: 4500, yearsOfService: 2, grade: "Grade 12" },
  ]);

  // Sample Data for Recent Activities
  const [activities] = useState([
    { id: 1, action: "Added new teacher: Jane Smith", completed: true },
    { id: 2, action: "Assigned Math to John Doe", completed: true },
    { id: 3, action: "Created a new class for Grade 10", completed: false },
    { id: 4, action: "Updated salary for Sam Green", completed: false },
    { id: 5, action: "Reviewed performance reports", completed: true },
  ]);

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Overview Stats
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.yearsOfService > 0).length;
  const averageSalary = (teachers.reduce((acc, teacher) => acc + teacher.salary, 0) / totalTeachers).toFixed(2);
  const totalHours = teachers.reduce((acc, teacher) => acc + teacher.hours, 0);

  // Open Modal
  const openModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  // Handle Activity Dismiss
  const handleDismissActivity = (id) => {
    console.log(`Dismissing activity ${id}`);
    // In real app: update state or API call
  };

  // Handle Teacher Delete in Modal
  const handleDeleteTeacher = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTeacher?.name}?`)) {
      console.log(`Deleting teacher ${selectedTeacher?.id}`);
      closeModal();
      // In real app: API call and update teachers state
      alert("Teacher deleted (simulated)");
    }
  };

  return (
    <>
      <SideBar />
      <div className="teacher-dashboard ml-64 !p-6 flex flex-col lg:flex-row justify-between gap-8 min-h-screen bg-gray-100">
        {/* Main Content Area */}
        <div className="flex-1 lg:basis-3/4">
          {/* Overview Stats */}
          <section aria-labelledby="overview-heading">
            <h1 id="overview-heading" className="text-3xl font-bold !mb-6 text-gray-800">Teacher Management Dashboard</h1>
            <div className="overview grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 !mb-8">
              <div className="overview-card !p-6 bg-white shadow-md rounded-lg flex items-center gap-4 border-l-4 border-blue-500">
                <FaUsers className="text-4xl text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Teachers</h3>
                  <p className="text-3xl font-bold text-gray-900">{totalTeachers}</p>
                </div>
              </div>
              <div className="overview-card !p-6 bg-white shadow-md rounded-lg flex items-center gap-4 border-l-4 border-green-500">
                <FaChalkboardTeacher className="text-4xl text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Active Teachers</h3>
                  <p className="text-3xl font-bold text-gray-900">{activeTeachers}</p>
                </div>
              </div>
              <div className="overview-card !p-6 bg-white shadow-md rounded-lg flex items-center gap-4 border-l-4 border-yellow-500">
                <FaDollarSign className="text-4xl text-yellow-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Avg Salary</h3>
                  <p className="text-3xl font-bold text-gray-900">${averageSalary}</p>
                </div>
              </div>
              <div className="overview-card !p-6 bg-white shadow-md rounded-lg flex items-center gap-4 border-l-4 border-purple-500">
                <FaClock className="text-4xl text-purple-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Hours</h3>
                  <p className="text-3xl font-bold text-gray-900">{totalHours}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Teacher List */}
          <section aria-labelledby="teachers-heading" className="!mb-8">
            <h2 id="teachers-heading" className="text-2xl font-semibold !mb-4 text-gray-800">Manage Teachers</h2>
            <div className="teacher-list grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="teacher-card !p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer flex justify-between items-center"
                  onClick={() => openModal(teacher)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${teacher.name}`}
                >
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{teacher.name}</h3>
                    <p className="text-sm text-gray-500">Teaches: {teacher.grade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 font-medium">Subject: {teacher.subject}</p>
                    <p className="text-gray-600">Salary: ${teacher.salary}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Optional: Add Teacher Button */}
            <div className="!mt-6">
              <Link to="/add-teacher">
                <TextButton name="Add New Teacher" />
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar: Recent Activities */}
        <aside className="lg:basis-1/4">
          <div className="activity-container !p-6 bg-white rounded-lg shadow-md sticky top-6">
            <h2 className="text-2xl font-semibold !mb-4 text-blue-600 flex items-center gap-2">
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

      {/* Modal for Teacher Details */}
      {isModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center !p-4" role="dialog" aria-modal="true">
          <div className="bg-white !p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <h2 className="text-2xl font-bold !mb-4 text-gray-800">Teacher Details</h2>
            <dl className="grid grid-cols-1 gap-4 !mb-6">
              <div className="border-b !pb-2">
                <dt className="font-medium text-gray-700">Name:</dt>
                <dd className="text-gray-900">{selectedTeacher.name}</dd>
              </div>
              <div className="border-b !pb-2">
                <dt className="font-medium text-gray-700">Subject:</dt>
                <dd className="text-gray-900">{selectedTeacher.subject}</dd>
              </div>
              <div className="border-b !pb-2">
                <dt className="font-medium text-gray-700">Salary:</dt>
                <dd className="text-gray-900">${selectedTeacher.salary}</dd>
              </div>
              <div className="border-b !pb-2">
                <dt className="font-medium text-gray-700">Years of Service:</dt>
                <dd className="text-gray-900">{selectedTeacher.yearsOfService} years</dd>
              </div>
              <div className="border-b !pb-2">
                <dt className="font-medium text-gray-700">Grade:</dt>
                <dd className="text-gray-900">{selectedTeacher.grade}</dd>
              </div>
              <div className="border-b !pb-2">
                <dt className="font-medium text-gray-700">Weekly Hours:</dt>
                <dd className="text-gray-900">{selectedTeacher.hours} hours</dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-3 !mb-4">
              <Link to={`/edit-teacher/${selectedTeacher.id}`}>
                <TextButton name="Edit Teacher" />
              </Link>
              <button
                onClick={handleDeleteTeacher}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                aria-label={`Delete ${selectedTeacher.name}`}
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

export default TeacherPage;