# HealthBook - Hospital Appointment Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing hospital appointments, doctor schedules, and patient medical records.

## 🚀 Features

### Patient Features
- ✅ Register and login with JWT authentication
- ✅ Search doctors by specialty, location, availability
- 📅 Book appointments with available time slots
- 🔄 Cancel or reschedule bookings
- 📋 View medical history and past records
- 🔔 Receive appointment confirmations

### Doctor Features
- ✅ Register as a doctor (requires admin approval)
- ✅ Manage profile and availability schedules
- 📅 View and manage appointment requests
- ✅ Approve/decline appointments
- 📝 Add visit notes and prescriptions
- 👥 Track total patients treated

### Admin Features
- 👨‍⚕️ Approve/reject doctor registrations
- 👥 Manage all users (patients and doctors)
- 📊 View system analytics
- 📅 Monitor daily bookings
- 🏥 Manage specializations

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **React Router DOM** - Routing
- **Context API** - State management
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **React Toastify** - Notifications
- **Vite** - Build tool

## 📁 Project Structure

```
healthbook/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   └── authController.js     # Authentication logic
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & RBAC
│   ├── models/
│   │   ├── UserSchema.js         # Patient/Admin model
│   │   ├── DoctorSchema.js       # Doctor model
│   │   ├── BookingSchema.js      # Appointment model
│   │   └── ReviewSchema.js       # Review model
│   ├── routes/
│   │   └── authRoutes.js         # Auth routes
│   ├── utils/
│   │   └── jwtUtils.js           # JWT helpers
│   ├── .env                      # Environment variables
│   ├── index.js                  # Server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── PatientDashboard.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── Doctors.jsx
    │   │   ├── DoctorDetails.jsx
    │   │   └── Contact.jsx
    │   ├── App.jsx               # Main app with routing
    │   ├── main.jsx              # React entry point
    │   └── index.css             # Global styles
    ├── index.html
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
cd Youtube-Tutorials-MERN-Medicare-Booking-Website
```

#### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/healthbook
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
# Optional overrides (defaults shown)
ADMIN_EMAIL=admin@healthbook.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=HealthBook Admin
```

Start backend server:
```bash
npm start
```

Backend will run on `http://localhost:8000`

#### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

Start frontend dev server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Default Admin Login

A bootstrap routine now ensures an administrator account exists whenever the backend starts.

| Field    | Default value        | How to change                     |
|----------|----------------------|-----------------------------------|
| Email    | `admin@healthbook.com` | Set `ADMIN_EMAIL` in `.env`        |
| Password | `Admin@123`            | Set `ADMIN_PASSWORD` in `.env`     |
| Name     | `HealthBook Admin`     | Set `ADMIN_NAME` in `.env`         |

> **Important:** Update these environment variables for production deployments. The credentials are intended for local development only.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (patient/doctor)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Coming Soon
- Doctor management endpoints
- Booking endpoints
- Admin endpoints
- Review endpoints

## 🔐 Authentication Flow

1. User registers with role (patient/doctor)
2. Doctor accounts are set to "pending" approval
3. User logs in and receives JWT token
4. Token is stored in localStorage
5. Token is sent with each API request in Authorization header
6. Protected routes verify token and check user role

## 👥 User Roles

### Patient
- Can book appointments
- View medical history
- Manage profile

### Doctor
- Requires admin approval
- Manage schedule and availability
- Approve/decline appointments
- Add visit notes

### Admin
- Approve doctors
- Manage all users
- View analytics
- System administration

## 🎨 UI/UX Features

- Responsive design (mobile-first)
- Modern gradient backgrounds
- Smooth transitions and animations
- Toast notifications for user feedback
- Loading states for async operations
- Protected routes with role-based access
- Clean and intuitive dashboards

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control (RBAC)
- Input validation
- CORS configuration
- Secure HTTP headers

## 📊 Database Schema

### User (Patient/Admin)
- Personal info (name, email, phone, gender)
- Medical info (blood type, allergies, medications)
- Medical history
- Address
- Appointments reference

### Doctor
- Personal info
- Specialization
- Qualifications & experiences
- Hospital information
- Time slots & availability
- Reviews & ratings
- Approval status

### Booking
- Doctor & patient reference
- Appointment date & time
- Status (pending/approved/cancelled/completed)
- Payment info
- Visit notes & prescriptions
- Cancellation tracking

### Review
- Doctor & patient reference
- Rating (0-5)
- Review text
- Timestamp

## 🚧 Development Status

### ✅ Completed
- Backend server setup
- MongoDB schemas
- JWT authentication
- User registration & login
- Protected routes
- Frontend routing
- Auth context
- Basic dashboards
- Responsive UI

### 🔄 In Progress
- Doctor listing & search
- Appointment booking system
- Admin approval workflow
- Profile management

### 📋 Planned
- Email notifications
- SMS reminders
- Payment integration
- Video consultation
- Analytics dashboard
- PDF report generation
- File upload for medical documents

## 🤝 Contributing

This is a tutorial project. Feel free to fork and customize for your needs.

## 📄 License

MIT License

## 👨‍💻 Author

Built with ❤️ using the MERN stack

---

**Note**: This is a development version. For production deployment, ensure to:
- Use environment variables for all secrets
- Enable HTTPS
- Set up proper MongoDB Atlas security
- Implement rate limiting
- Add comprehensive error handling
- Set up logging and monitoring
- Configure production build settings
