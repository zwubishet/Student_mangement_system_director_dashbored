import { useState } from "react";

const StatusBox = ({ name, number, icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`status-box-container flex flex-row items-center justify-center rounded-lg gap-6  !pt-2 !pb-2 !pl-4 !pr-4 shadow-lg transition-transform duration-300 ease-in-out ${isHovered ? 'transform-gpu scale-105' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="section-one flex flex-col items-center text-center">
        <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
        <h3 className="text-3xl font-bold text-gray-900">{number}</h3>
      </div>
      <div className="section-two flex justify-center items-center">
        <img
          src={icon}
          alt=""
          className="w-10 h-10 transition-transform duration-300 ease-in-out transform hover:rotate-45"
        />
      </div>
    </div>
  );
};

export default StatusBox;
