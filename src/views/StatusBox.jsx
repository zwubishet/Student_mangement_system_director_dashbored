import { useState } from "react";

const StatusBox = ({ name, number, icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex items-center justify-between !p-6 bg-white rounded-lg shadow-md transition-all duration-300 ${isHovered ? 'shadow-xl scale-105' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="figure"
      aria-label={`${name}: ${number}`}
    >
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
        <p className="text-3xl font-bold text-gray-900">{number}</p>
      </div>
      <img src={icon} alt="" className="w-12 h-12 transition-transform duration-300 hover:rotate-12" aria-hidden="true" />
    </div>
  );
};

export default StatusBox;