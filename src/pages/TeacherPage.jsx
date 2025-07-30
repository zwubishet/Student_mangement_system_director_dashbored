import { useState } from "react";
import TextButton from "../views/TextButton";
import SideBar from "../components/SideBar";

const TeacherDashboard = () => {
  // Sample Data for Teachers
  const [teachers, setTeachers] = useState([
    { id: 1, name: "John Doe", subject: "Math", hours: 20, salary: 5000, yearsOfService: 5, grade: "Grade 10" },
    { id: 2, name: "Jane Smith", subject: "Science", hours: 18, salary: 4800, yearsOfService: 3, grade: "Grade 9" },
    { id: 3, name: "Sam Green", subject: "English", hours: 22, salary: 5200, yearsOfService: 7, grade: "Grade 11" },
    { id: 4, name: "Lisa Brown", subject: "History", hours: 15, salary: 4500, yearsOfService: 2, grade: "Grade 12" },
  ]);

  // For Activities Section (Sample Data)
  const [activities] = useState([
    { id: 1, action: "Added new teacher: Jane Smith" },
    { id: 2, action: "Assigned Math to John Doe" },
    { id: 3, action: "Created a new class for Grade 10" },
  ]);

  // Stats for Overview
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.yearsOfService > 0).length;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    subject: "",
    hours: "",
    salary: "",
    yearsOfService: "",
    grade: "",
  });

  // Open Modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setNewTeacher({
      name: "",
      subject: "",
      hours: "",
      salary: "",
      yearsOfService: "",
      grade: "",
    });
  };

  // Add Teacher
  const addTeacher = () => {
    setTeachers([...teachers, { ...newTeacher, id: teachers.length + 1 }]);
    closeModal();
  };

  return (
    <>
      <SideBar />
      <div className="teacher-dashboard p-6 ml-64">
        <div>
                    <h1 className="text-3xl font-bold mb-6">Teacher Management Dashboard</h1>

        {/* First Section: Teacher Overview */}
        <div className="overview grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="overview-card p-6 bg-white shadow-lg rounded-md">
            <h3 className="text-xl font-semibold">Total Teachers</h3>
            <p className="text-3xl">{totalTeachers}</p>
          </div>
          <div className="overview-card p-6 bg-white shadow-lg rounded-md">
            <h3 className="text-xl font-semibold">Active Teachers</h3>
            <p className="text-3xl">{activeTeachers}</p>
          </div>
        </div>
        </div>

       <div>
         {/* Second Section: Teacher List with Information */}
        <h2 className="text-2xl font-semibold mb-4">Manage Teachers</h2>
        <div className="teacher-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="teacher-card p-4 bg-white shadow-lg rounded-md hover:scale-105 transition-transform duration-300"
            >
              <h3 className="text-xl font-semibold">{teacher.name}</h3>
              <p className="text-gray-600">Subject: {teacher.subject}</p>
              <p className="text-gray-600">Hours: {teacher.hours}</p>
              <p className="text-gray-600">Salary: ${teacher.salary}</p>
              <p className="text-gray-600">Years of Service: {teacher.yearsOfService}</p>
              <p className="text-gray-600">Grade: {teacher.grade}</p>
            </div>
          ))}
        </div>
       </div>

        {/* Add Teacher Section */}
        <div className="add-teacher mt-8 mb-6">
          <TextButton name={"Add New Teacher"} onClick={openModal} />
        </div>

        {/* Third Section: Recent Activities */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">Recent Activities</h2>
        <div className="recent-activities bg-white p-6 shadow-lg rounded-md">
          <ul className="list-none">
            {activities.map((activity) => (
              <li key={activity.id} className="mb-2 text-gray-600">
                {activity.action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal for Adding New Teacher */}
      {isModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center">
          <div className="modal-content bg-white p-6 rounded-md shadow-lg max-w-lg w-full">
            <h2 className="text-3xl font-semibold mb-4">Add New Teacher</h2>
            <div className="form-grid grid grid-cols-1 gap-6">
              <input
                type="text"
                placeholder="Name"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              <input
                type="text"
                placeholder="Subject"
                value={newTeacher.subject}
                onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              <input
                type="number"
                placeholder="Hours"
                value={newTeacher.hours}
                onChange={(e) => setNewTeacher({ ...newTeacher, hours: e.target.value })}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              <input
                type="number"
                placeholder="Salary"
                value={newTeacher.salary}
                onChange={(e) => setNewTeacher({ ...newTeacher, salary: e.target.value })}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              <input
                type="number"
                placeholder="Years of Service"
                value={newTeacher.yearsOfService}
                onChange={(e) => setNewTeacher({ ...newTeacher, yearsOfService: e.target.value })}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              <input
                type="text"
                placeholder="Grade"
                value={newTeacher.grade}
                onChange={(e) => setNewTeacher({ ...newTeacher, grade: e.target.value })}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            <div className="buttons flex gap-4 mt-6">
              <TextButton name={"Save Teacher"} onClick={addTeacher} />
              <button
                className="text-gray-500"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherDashboard;
