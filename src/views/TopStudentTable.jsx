import student from "../assets/student.jpg";
import { Link } from "react-router-dom";

const TopStudentTable = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="!p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Top Performers</h1>
        <p className="text-gray-600">No top performers found for this criteria.</p>
      </div>
    );
  }

  return (
    <div className="!p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 !mb-6">Top Performers (Average &gl; 90)</h1>
      <div className="space-y-4">
        {data.map((student, index) => (
          <Link to={`/student/${student.id}`} key={student.id || index} className="block">
            <div className="flex items-center justify-between !p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <img src={student.photo || student} alt={`${student.name}'s photo`} className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover" />
                <div>
                  <p className="text-lg font-semibold text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-500">Grade: {student.grade}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-md font-medium text-green-600">Average: {student.average}%</p>
                <p className="text-md text-yellow-600">Rank: #{student.rank}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopStudentTable;