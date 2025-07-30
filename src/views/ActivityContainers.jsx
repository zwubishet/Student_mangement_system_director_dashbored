import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa"; // Adding some icons for activities

const ActivityContainer = () => {
    return (
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
    );
};

export default ActivityContainer;
