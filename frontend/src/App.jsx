import PropTypes from "prop-types";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

// Import pages (we'll create these)
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorSchedule from "./pages/DoctorSchedule";
import DoctorProfile from "./pages/DoctorProfile";
import AdminDashboard from "./pages/AdminDashboard";
import Doctors from "./pages/Doctors";
import DoctorDetails from "./pages/DoctorDetails";
import Contact from "./pages/Contact";
import Layout from "./components/Layout";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Layout>{user ? <Navigate to={`/${user.role}-dashboard`} /> : <Login />}</Layout>} />
      <Route path="/register" element={<Layout>{user ? <Navigate to={`/${user.role}-dashboard`} /> : <Register />}</Layout>} />
      <Route path="/doctors" element={<Layout><Doctors /></Layout>} />
      <Route path="/doctors/:id" element={<Layout><DoctorDetails /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />

      {/* Protected Routes */}
      <Route
        path="/patient-dashboard"
        element={<Layout><ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute></Layout>}
      />
      <Route
        path="/doctor-dashboard"
        element={<Layout><ProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></ProtectedRoute></Layout>}
      />
      <Route
        path="/doctor/schedule"
        element={<Layout><ProtectedRoute allowedRoles={["doctor"]}><DoctorSchedule /></ProtectedRoute></Layout>}
      />
      <Route
        path="/doctor/profile"
        element={<Layout><ProtectedRoute allowedRoles={["doctor"]}><DoctorProfile /></ProtectedRoute></Layout>}
      />
      <Route
        path="/admin-dashboard"
        element={<Layout><ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute></Layout>}
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
