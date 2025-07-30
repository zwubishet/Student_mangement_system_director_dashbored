import React, { useRef } from "react";
import StatusBox from "../views/StatusBox";
import graduation from "../assets/graduation.png";
import SchoolDir from "../assets/SchoolDir.png";
import arrowDown from "../assets/arrow-down.png";
import { Link } from "react-router-dom";
import teacher from "../assets/teacher.png";
import calculation from "../assets/calculation.png";
import SchoolBudgetChart from "../views/LineChart.jsx";
import TopStudentTable from "../views/TopStudentTable.jsx";
import ActivityContainer from "../views/ActivityContainers.jsx";
import ResourceShared from "../views/ResourceShares.jsx";

const HomeSection = () => {
  const topPerformer = [
    {
      name: "Makbel",
      grade: "7",
      average: "99.2",
      rank: "1st",
    },
    {
      name: "meklit",
      grade: "6",
      average: "98.2",
      rank: "2nd",
    },
    {
      name: "mahlet",
      grade: "8",
      average: "98.1",
      rank: "1st",
    },
    {
      name: "Yonatan",
      grade: "7",
      average: "96.8",
      rank: "4th",
    },
  ];

  // Create a reference for the next section
  const nextSectionRef = useRef(null);

  // Scroll function to scroll to the next section
  const scrollToNextSection = () => {
    if (nextSectionRef.current) {
      nextSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
     <div className="welcome-section flex flex-row items-center gap-12 !m-2 !pl-12  !pr-12 !pb-6 !pt-2 bg-gray-50 rounded-xl shadow-xl">
    <div className="flex flex-col gap-4 max-w-lg">
        <h1 className="text-5xl font-bold text-blue-600 leading-tight animate__animated animate__fadeInUp">
            Welcome Back, Director!
        </h1>
        <h3 className="text-2xl text-gray-700 leading-relaxed animate__animated animate__fadeInUp animate__delay-1s">
            Welcome! As the director, you’re key to overseeing academics, managing resources, and ensuring smooth operations. This system provides easy access to tools and insights for effective decision-making.
        </h3>
    </div>
    <img
        src={SchoolDir}
        alt="School Director"
        className="w-96 h-98 rounded-4xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl animate__animated animate__fadeIn animate__delay-2s"
    />
</div>

      {/* Floating arrow button */}
      <div
        className="absolute bottom-5 right-2/4 cursor-pointer"
        onClick={scrollToNextSection}
      >
        <img src={arrowDown} alt="Arrow Down" className="w-12 h-12" />
      </div>
      <div>
        <select>
          <option value="2025" selected>2025</option>
          <option value="2024" >2024</option>
          <option value="2023" >2023</option>
          <option value="2022" >2022</option>
          <option value="2021" >2021</option>
        </select>
      </div>
      <div className="!p-2">
        <div className="home-section-header flex flex-row justify-around !m-6 flex-wrap">
          <Link to="/student">
            <StatusBox name={"Students"} number={"2400"} icon={graduation} />
          </Link>
          <Link to="/teacher">
            <StatusBox name={"Teachers"} number={"240"} icon={teacher} />
          </Link>
          <StatusBox name={"Students"} number={"23 mill"} icon={calculation} />
        </div>
        <div
          className="home-section-body w-full h-auto flex flex-row gap-6"
          ref={nextSectionRef} // Attach the ref to the section you want to scroll to
        >
          <div className="flex flex-col basis-4/6">
            <SchoolBudgetChart />
            <div className="flex flex-col gap-2">
              <TopStudentTable data={topPerformer} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <ActivityContainer className="basis-2/6" />
            <ResourceShared className="basis-64" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;
