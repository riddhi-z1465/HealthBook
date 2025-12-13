import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">HealthBook</h3>
                <p className="text-xs text-gray-400">Medical Center</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Professional medical care for your whole family</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition">Doctors</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Services</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/doctors" className="hover:text-white transition">Consultation</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition">Diagnostics</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition">Laboratory</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition">Surgery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📞 8 (800) 333-100</li>
              <li>📧 info@healthbook.com</li>
              <li>📍 Medical Center Address</li>
              <li>🕒 Mon-Fri: 8:00-20:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 HealthBook Medical Center. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
