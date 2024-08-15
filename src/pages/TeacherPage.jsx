import { useState } from "react";
import SideBar from "../components/SideBar";
import TextButton from "../views/TextButton";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";

const TeacherPage = () => {
  // Sample Data for Teachers
  const [teachers] = useState([
    { id: 1, name: "John Doe", subject: "Math", hours: 20, salary: 5000, yearsOfService: 5, grade: "Grade 10" },
    { id: 2, name: "Jane Smith", subject: "Science", hours: 18, salary: 4800, yearsOfService: 3, grade: "Grade 9" },
    { id: 3, name: "Sam Green", subject: "English", hours: 22, salary: 5200, yearsOfService: 7, grade: "Grade 11" },
    { id: 4, name: "Lisa Brown", subject: "History", hours: 15, salary: 4500, yearsOfService: 2, grade: "Grade 12" },
  ]);

  // Sample Data for Activities
  const [activities] = useState([
    { id: 1, action: "Added new teacher: Jane Smith" },
    { id: 2, action: "Assigned Math to John Doe" },
    { id: 3, action: "Created a new class for Grade 10" },
  ]);

  // Stats for Overview
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.yearsOfService > 0).length;

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Overview Stats for Teachers
  const averageSalary = (teachers.reduce((acc, teacher) => acc + teacher.salary, 0) / totalTeachers).toFixed(2);

  // Open Modal with Teacher Details
  const openModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  return (
    <>
      <SideBar />
      <div className="teacher-dashboard !p-6 flex flex-row justify-between gap-6">

        <div className="basis-3/4">
          {/* First Section: Overview Stats */}
          <div>
            <h1 className="text-3xl font-bold mb-6">Teacher Management Dashboard</h1>
            <div className="overview grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="overview-card p-6 bg-white shadow-lg rounded-md">
                <h3 className="text-xl font-semibold">Total Teachers</h3>
                <p className="text-3xl">{totalTeachers}</p>
              </div>
              <div className="overview-card p-6 bg-white shadow-lg rounded-md">
                <h3 className="text-xl font-semibold">Active Teachers</h3>
                <p className="text-3xl">{activeTeachers}</p>
              </div>
              <div className="overview-card p-6 bg-white shadow-lg rounded-md">
                <h3 className="text-xl font-semibold">Average Salary</h3>
                <p className="text-3xl">${averageSalary}</p>
              </div>
            </div>
          </div>

          {/* Second Section: Teacher List with Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Teachers</h2>
            <div className="teacher-list grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-4">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="teacher-card flex flex-row justify-between !p-4 bg-white shadow-lg rounded-md hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => openModal(teacher)} // Open the modal with teacher data
                >
                  <h3 className="text-xl font-semibold">{teacher.name}</h3>
                  <div className="flex flex-row gap-12">
                    <p className="text-gray-600">Subject: {teacher.subject}</p>
                    <p className="text-gray-600">Salary: ${teacher.salary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Third Section: Recent Activities */}
        <div className="basis-1/4">
          <div className="main-activity-container !ml-4 !p-4 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-blue-600 !mb-4">Recent Activities</h2>
            <ul className="list-none space-y-3">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="li flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <FaRegCheckCircle className="text-green-500 w-5 h-5" />
                    <p className="text-lg text-gray-800">{activity.action}</p>
                  </div>
                  <FaRegTimesCircle className="text-red-500 w-6 h-6 cursor-pointer" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal for Teacher Details */}
      {isModalOpen && selectedTeacher && (
        <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center">
          <div className="modal-content bg-white p-6 rounded-md shadow-lg max-w-lg w-full">
            <h2 className="text-3xl font-semibold mb-4">Teacher Details</h2>
            <div className="details-grid grid grid-cols-1 gap-6">
              <div className="detail-item">
                <strong>Name: </strong> {selectedTeacher.name}
              </div>
              <div className="detail-item">
                <strong>Subject: </strong> {selectedTeacher.subject}
              </div>
              <div className="detail-item">
                <strong>Salary: </strong> ${selectedTeacher.salary}
              </div>
              <div className="detail-item">
                <strong>Years of Service: </strong> {selectedTeacher.yearsOfService}
              </div>
              <div className="detail-item">
                <strong>Grade: </strong> {selectedTeacher.grade}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="buttons flex gap-4 mt-6">
              <TextButton name={"Edit"} />
              <button
                className="text-red-500"
                onClick={() => console.log(`Delete teacher ${selectedTeacher.id}`)}
              >
                Delete
              </button>
            </div>

            {/* Close Button */}
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md"
              onClick={closeModal} // Close the modal
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
