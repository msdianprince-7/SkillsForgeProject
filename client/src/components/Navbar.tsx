import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={token ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-200">
              SF
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-300 to-accent-400 bg-clip-text text-transparent">
              SkillForge
            </span>
          </Link>

          {/* Desktop Nav */}
          {token && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/dashboard")
                    ? "bg-primary-500/15 text-primary-300"
                    : "text-surface-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/profile")
                    ? "bg-primary-500/15 text-primary-300"
                    : "text-surface-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Profile
              </Link>
            </div>
          )}

          {/* Right section */}
          <div className="hidden md:flex items-center gap-3">
            {token && user && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-surface-200">{user.name}</span>
                  {user.role === "admin" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  id="logout-btn"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          {token && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-surface-200 cursor-pointer"
              id="mobile-menu-btn"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Mobile menu */}
        {token && mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/5 mt-2 pt-3 space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                isActive("/dashboard") ? "bg-primary-500/15 text-primary-300" : "text-surface-200"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                isActive("/profile") ? "bg-primary-500/15 text-primary-300" : "text-surface-200"
              }`}
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-rose-400 cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;