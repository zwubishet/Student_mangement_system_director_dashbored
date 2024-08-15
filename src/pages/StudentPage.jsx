import { useState } from "react";
import SideBar from "../components/SideBar";
import TextButton from "../views/TextButton";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";

const StudentPage = () => {
  // Sample Data for Students
  const [students] = useState([
    { id: 1, name: "John Doe", grade: "A", average: 90, rank: 1 },
    { id: 2, name: "Jane Smith", grade: "B", average: 85, rank: 2 },
    { id: 3, name: "Sam Green", grade: "A", average: 92, rank: 3 },
    { id: 4, name: "Lisa Brown", grade: "C", average: 78, rank: 4 },
  ]);

  // Sample Data for Activities
  const [activities] = useState([
    { id: 1, action: "Added new student: Jane Smith" },
    { id: 2, action: "Updated grade for John Doe" },
    { id: 3, action: "Deleted student: Lisa Brown" },
  ]);

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Overview Stats for Students
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.grade !== "C").length;
  const transferredStudents = students.filter((s) => s.grade === "C").length;
  const averageGrade = (students.reduce((acc, student) => acc + student.average, 0) / totalStudents).toFixed(2);

  // Open Modal with Student Details
  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <>
      <SideBar />
      <div className="student-dashboard !p-6 flex flex-row justify-between gap-6">

        <div className=" basis-3/4">
            {/* First Section: Overview Stats */}
        <div>
            <h1 className="text-3xl font-bold !mb-6">Director's Dashboard</h1>
         <div className="overview grid grid-cols-1 lg:grid-cols-2 gap-6 !mb-6">
          <div className="overview-card !p-6 bg-white shadow-lg rounded-md">
            <h3 className="text-xl font-semibold">Total Students</h3>
            <p className="text-3xl">{totalStudents}</p>
          </div>
          <div className="overview-card !p-6 bg-white shadow-lg rounded-md">
            <h3 className="text-xl font-semibold">Active Students</h3>
            <p className="text-3xl">{activeStudents}</p>
          </div>
          <div className="overview-card !p-6 bg-white shadow-lg rounded-md">
            <h3 className="text-xl font-semibold">Transferred Students</h3>
            <p className="text-3xl">{transferredStudents}</p>
          </div>
          <div className="overview-card !p-6 bg-white shadow-lg rounded-md">
            <h3 className="text-xl font-semibold">Average Grade</h3>
            <p className="text-3xl">{averageGrade}</p>
          </div>
        </div>
        </div>


        {/* Second Section: Student List with Grade Group and Clickable Cards */}
        
      <div>
        <h2 className="text-2xl font-semibold !mb-4">Manage Students</h2>
          <div className="student-list grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="student-card flex flex-row justify-between !p-4 bg-white shadow-lg rounded-md hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => openModal(student)} // Open the modal with student data
            >
              <h3 className="text-xl font-semibold">{student.name}</h3>
             <div className="flex flex-row gap-12">
                 <p className="text-gray-600">Grade: {student.grade}</p>
              <p className="text-gray-600">Average: {student.average}</p>
             </div>
            </div>
          ))}
        </div>
      </div>
</div>

        {/* Third Section: Recent Activities */}
        
        <div className=" basis-1/4">
            <div className="main-activity-container !ml-4 !p-4 bg-gray-50 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-blue-600 !mb-4">Recent Activities</h2>
                        <ul className="list-none space-y-3">
                            <li className="li flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl">
                                <div className="flex items-center gap-3">
                                    <FaRegCheckCircle className="text-green-500 w-5 h-5" />
                                    <p className="text-lg text-gray-800">Announce Tomorrow's Meeting</p>
                                </div>
                                <FaRegTimesCircle className="text-red-500 w-6 h-6 cursor-pointer" />
                            </li>
                            <li className="li flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl">
                                <div className="flex items-center gap-3">
                                    <FaRegCheckCircle className="text-green-500 w-5 h-5" />
                                    <p className="text-lg text-gray-800">Send Warning to Student</p>
                                </div>
                                <FaRegTimesCircle className="text-red-500 w-6 h-6 cursor-pointer" />
                            </li>
                            <li className="li flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl">
                                <div className="flex items-center gap-3">
                                    <FaRegCheckCircle className="text-green-500 w-5 h-5" />
                                    <p className="text-lg text-gray-800">Make Schedule Adjustment</p>
                                </div>
                                <FaRegTimesCircle className="text-red-500 w-6 h-6 cursor-pointer" />
                            </li>
                            <li className="li flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl">
                                <div className="flex items-center gap-3">
                                    <FaRegCheckCircle className="text-green-500 w-5 h-5" />
                                    <p className="text-lg text-gray-800">Make Teacher Change</p>
                                </div>
                                <FaRegTimesCircle className="text-red-500 w-6 h-6 cursor-pointer" />
                            </li>
                            <li className="li flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl">
                                <div className="flex items-center gap-3">
                                    <FaRegCheckCircle className="text-green-500 w-5 h-5" />
                                    <p className="text-lg text-gray-800">Approve Student Results</p>
                                </div>
                                <FaRegTimesCircle className="text-red-500 w-6 h-6 cursor-pointer" />
                            </li>
                        </ul>
                    </div>
        </div>
      </div>

      {/* Modal for Student Details */}
      {isModalOpen && selectedStudent && (
        <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center">
          <div className="modal-content bg-white p-6 rounded-md shadow-lg max-w-lg w-full">
            <h2 className="text-3xl font-semibold mb-4">Student Details</h2>
            <div className="details-grid grid grid-cols-1 gap-6">
              <div className="detail-item">
                <strong>Name: </strong> {selectedStudent.name}
              </div>
              <div className="detail-item">
                <strong>Grade: </strong> {selectedStudent.grade}
              </div>
              <div className="detail-item">
                <strong>Average: </strong> {selectedStudent.average}
              </div>
              <div className="detail-item">
                <strong>Rank: </strong> {selectedStudent.rank}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="buttons flex gap-4 mt-6">
              <TextButton name={"Edit"} />
              <button
                className="text-red-500"
                onClick={() => console.log(`Delete student ${selectedStudent.id}`)}
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

export default StudentPage;
