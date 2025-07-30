import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import TextButton from "../views/TextButton";

const StudentDetails = () => {
  const { id } = useParams();  // Get student ID from URL
  const [student, setStudent] = useState(null);

  // Sample Static Data for students
  const sampleStudents = [
    { id: 1, name: "John Doe", grade: "A", average: 90, rank: 1 },
    { id: 2, name: "Jane Smith", grade: "B", average: 85, rank: 2 },
    { id: 3, name: "Sam Green", grade: "A", average: 92, rank: 3 },
    { id: 4, name: "Lisa Brown", grade: "C", average: 78, rank: 4 },
  ];

  useEffect(() => {
    const studentData = sampleStudents.find((s) => s.id === parseInt(id));
    setStudent(studentData);
  }, [id]);

  if (!student) return <div>Loading...</div>;

  return (
    <div className="student-details p-6">
      <h2 className="text-3xl font-semibold mb-6">Student Details</h2>
      <div className="details-grid grid grid-cols-1 gap-6">
        <div className="detail-item">
          <strong>Name: </strong> {student.name}
        </div>
        <div className="detail-item">
          <strong>Grade: </strong> {student.grade}
        </div>
        <div className="detail-item">
          <strong>Average: </strong> {student.average}
        </div>
        <div className="detail-item">
          <strong>Rank: </strong> {student.rank}
        </div>
      </div>

      {/* Edit and Delete Buttons */}
      <div className="buttons flex gap-4 mt-6">
        <Link to={`/edit-student/${student.id}`}>
          <TextButton name={"Edit"} />
        </Link>
        <button className="text-red-500" onClick={() => console.log(`Delete student ${student.id}`)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default StudentDetails;
