import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";

const ActivityContainer = () => {
  // In real app, fetch activities from API
  const activities = [
    { id: 1, action: "Announce Tomorrow's Meeting", completed: true },
    { id: 2, action: "Send Warning to Student", completed: true },
    { id: 3, action: "Make Schedule Adjustment", completed: false },
    { id: 4, action: "Make Teacher Change", completed: false },
    { id: 5, action: "Approve Student Results", completed: true },
  ];

  const handleDismiss = (id) => {
    console.log(`Dismiss activity ${id}`);
    // In real app: API call to remove
  };

  return (
    <div className="!p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 !mb-4 flex items-center gap-2">
        <FaRegCheckCircle /> Recent Activities
      </h2>
      <ul className="space-y-3">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-center justify-between !p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <FaRegCheckCircle className={`w-5 h-5 ${activity.completed ? 'text-green-500' : 'text-gray-400'}`} />
              <p className="text-gray-800">{activity.action}</p>
            </div>
            <button onClick={() => handleDismiss(activity.id)} aria-label="Dismiss" className="text-red-500 hover:text-red-700">
              <FaRegTimesCircle className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityContainer;