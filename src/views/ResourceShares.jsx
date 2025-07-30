import { FaFileAlt, FaCheckCircle } from "react-icons/fa"; // Importing icons

const ResourceShared = () => {
    return (
        <div className="resource-container p-6 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-blue-600 !mb-4">Shared Resources</h2>
            <ul className="list-none space-y-3">
                <li className="flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl">
                    <div className="flex items-center gap-3">
                        <FaFileAlt className="text-yellow-500 w-6 h-6" />
                        <p className="text-lg text-gray-800">Announce Tomorrow's Meeting</p>
                    </div>
                    <FaCheckCircle className="text-green-500 w-6 h-6 cursor-pointer" />
                </li>
                <li className="flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl">
                    <div className="flex items-center gap-3">
                        <FaFileAlt className="text-yellow-500 w-6 h-6" />
                        <p className="text-lg text-gray-800">Send Warning to Student</p>
                    </div>
                    <FaCheckCircle className="text-green-500 w-6 h-6 cursor-pointer" />
                </li>
                <li className="flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl">
                    <div className="flex items-center gap-3">
                        <FaFileAlt className="text-yellow-500 w-6 h-6" />
                        <p className="text-lg text-gray-800">Make Schedule Adjustment</p>
                    </div>
                    <FaCheckCircle className="text-green-500 w-6 h-6 cursor-pointer" />
                </li>
                <li className="flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl">
                    <div className="flex items-center gap-3">
                        <FaFileAlt className="text-yellow-500 w-6 h-6" />
                        <p className="text-lg text-gray-800">Make Teacher Change</p>
                    </div>
                    <FaCheckCircle className="text-green-500 w-6 h-6 cursor-pointer" />
                </li>
                <li className="flex items-center justify-between !p-4 bg-white rounded-md shadow hover:scale-105 transition-transform duration-300 hover:shadow-xl">
                    <div className="flex items-center gap-3">
                        <FaFileAlt className="text-yellow-500 w-6 h-6" />
                        <p className="text-lg text-gray-800">Approve Student Results</p>
                    </div>
                    <FaCheckCircle className="text-green-500 w-6 h-6 cursor-pointer" />
                </li>
            </ul>
        </div>
    );
};

export default ResourceShared;
