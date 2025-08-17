import { FaFileAlt, FaCheckCircle } from "react-icons/fa";

const ResourceShared = () => {
  // In real app, fetch resources from API
  const resources = [
    { id: 1, name: "Meeting Announcement.pdf", approved: true },
    { id: 2, name: "Student Warning Template.docx", approved: true },
    { id: 3, name: "Schedule Adjustment.xlsx", approved: false },
    { id: 4, name: "Teacher Change Form.pdf", approved: false },
    { id: 5, name: "Student Results Report.pdf", approved: true },
  ];

  const handleApprove = (id) => {
    console.log(`Approve resource ${id}`);
    // In real app: API call
  };

  return (
    <div className="!p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 !mb-4 flex items-center gap-2">
        <FaFileAlt /> Shared Resources
      </h2>
      <ul className="space-y-3">
        {resources.map((resource) => (
          <li key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-yellow-500 w-5 h-5" />
              <p className="text-gray-800">{resource.name}</p>
            </div>
            <button onClick={() => handleApprove(resource.id)} aria-label="Approve" className={`${resource.approved ? 'text-green-500' : 'text-gray-400'} hover:text-green-700`}>
              <FaCheckCircle className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceShared;