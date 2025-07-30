import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import TextButton from "../views/TextButton";

const Header = () => {
  return (
    <div className="side-bar-main-container flex flex-row justify-between items-center bg-blue-500 !p-2">
      <div className="side-bar-header flex flex-row items-center gap-3">
        <img src={logo} alt="School Logo" className="w-12 h-12" />
        <p className="text-2xl font-bold text-gray-800">Dream School</p>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-navigations flex flex-row gap-6 items-center bg-transparent md:flex">
        <Link to="/dashboard">
          <TextButton name={"Home"} />
        </Link>
        <Link to="/student">
          <TextButton name={"Students"} />
        </Link>
        <Link to="/teacher">
          <TextButton name={"Teachers"} />
        </Link>
        <TextButton name={"Analysis"} />
      </div>

      {/* Settings & Logout */}
      <div className="setting-logout flex flex-row gap-4 items-center">
        <TextButton name={"Settings"} />
        <TextButton name={"LogOut"} />
      </div>
    </div>
  );
};

export default Header;
