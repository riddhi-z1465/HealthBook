import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PropTypes from "prop-types";

const Layout = ({ children }) => {
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsPageLoading(false);
    }, 5000); // 5-second HealthBook loading animation

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white/95 backdrop-blur transition-opacity duration-500 ${
          isPageLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
          <p className="typing-text">HealthBook</p>
          <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">Loading your experience…</p>
        </div>
      </div>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
