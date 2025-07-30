import student from "../assets/student.jpg"

const TopStudentTable = ({ data }) => {
    return (
        <div className="top-student-table-container p-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-4">Top Performers</h1>
            {data.map((row, index) => (
                <div
                    key={index}
                    className="student-list-row flex flex-col rounded-lg bg-white shadow-xl mb-4 p-4 transition-transform transform hover:scale-105 hover:shadow-2xl"
                >
                    <div className="flex flex-row justify-between items-center mb-2">
                        <div className="flex flex-row items-center gap-3">
                            <img src={student} alt="" className="w-12 h-12 rounded-full border-2 border-blue-500" />
                            <p className="text-lg font-semibold text-gray-800 !p-2">{row.name}</p>
                        </div>
                        <p className="text-lg font-medium text-gray-600 !p-2">Grade-{row.grade}</p>
                    </div>
                    <div className="flex flex-col items-end !p-2">
                        <p className="text-md text-green-600">Average: {row.average}</p>
                        <p className="text-md text-yellow-600">Rank: {row.rank}</p>
                    </div>
                    <hr className="my-2 border-t-2 border-gray-300" />
                </div>
            ))}
        </div>
    );
};

export default TopStudentTable;
