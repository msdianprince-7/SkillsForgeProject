import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { token, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">SkillForge</h1>

      <div className="flex items-center gap-4">
        {token && (
          <>
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Dashboard
            </Link>

            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;