import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-transparent py-4 hover:scale-105 transition-transform">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-full opacity-85 bg-gradient-to-r from-teal-500/80 to-teal-600/90 text-white px-6 py-3 shadow-lg/50 border border-white/20 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3 ">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#07bca3] shadow-inner shadow-black/20">
              <span className="text-white text-2xl font-bold">+</span>
            </div>
            <Link to="/" className="text-lg sm:text-xl font-bold tracking-wide">HealthBook</Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-white/90 transition-transform duration-900 ">
            <Link to="/" className="relative hover:text-white transition-all duration-300 hover:scale-105 after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full">Home</Link>
            <Link to="/doctors" className="relative hover:text-white transition-all duration-300 hover:scale-105 after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full">Doctors</Link>
            <Link to="/services" className="relative hover:text-white transition-all duration-300 hover:scale-105 after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full">Services</Link>
            <Link to="/contact" className="relative hover:text-white transition-all duration-300 hover:scale-105 after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full">More</Link>
          </nav>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {user?.role === "doctor" && (
                  <Link
                    to="/doctor/profile"
                    className="hidden sm:inline-flex px-5 py-2 border-2 border-white/70 text-white rounded-full font-medium hover:bg-white/10 transition"
                  >
                    Doctor Profile
                  </Link>
                )}
                <Link
                  to={`/${user?.role}-dashboard`}
                  className="hidden sm:inline-flex px-5 py-2 border-2 border-white text-white rounded-full font-medium hover:bg-white/10 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex px-5 py-2 border-2 border-white/60 text-white rounded-full font-medium hover:bg-white/10 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/contact"
                className="px-5 py-2 border-2 border-white text-white rounded-full font-medium hover:bg-white/10 transition"
              >
                Contact Us
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
