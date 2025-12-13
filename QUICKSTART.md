# 🚀 HealthBook Quick Start Guide

## Current Status: ✅ RUNNING

### Servers Running:
- **Backend API**: http://localhost:8000 ✅
- **Frontend App**: http://localhost:5173 ✅
- **MongoDB**: Connected to `healthbook` database ✅

---

## 🎯 Test the Application

### 1. Open the Application
Open your browser and navigate to: **http://localhost:5173**

You should see the HealthBook homepage with:
- Welcome message
- Login/Register buttons
- Feature cards
- Stats section

### 2. Register a New Patient
1. Click "Register" button
2. Fill in the form:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Role: Patient
3. Click "Create Account"
4. You'll be redirected to the Patient Dashboard

### 3. Register a New Doctor
1. Logout (if logged in)
2. Click "Register"
3. Fill in the form:
   - Name: Dr. Sarah Smith
   - Email: sarah@example.com
   - Password: password123
   - Role: Doctor
   - Specialization: Cardiologist
4. Click "Create Account"
5. You'll see a "Pending Approval" message on the Doctor Dashboard

### 4. Test Login
1. Logout
2. Click "Login"
3. Enter credentials:
   - Email: john@example.com
   - Password: password123
4. You'll be redirected to your dashboard based on role

---

## 📡 API Testing

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Register Patient
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "patient@test.com",
    "password": "password123",
    "role": "patient"
  }'
```

### Register Doctor
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test Doctor",
    "email": "doctor@test.com",
    "password": "password123",
    "role": "doctor",
    "specialization": "Cardiologist"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123"
  }'
```

### Get Current User (Protected Route)
```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🗄️ MongoDB Data

### View Users in MongoDB
```bash
mongosh healthbook
db.users.find().pretty()
```

### View Doctors in MongoDB
```bash
mongosh healthbook
db.doctors.find().pretty()
```

### Clear All Data (Reset)
```bash
mongosh healthbook
db.users.deleteMany({})
db.doctors.deleteMany({})
db.bookings.deleteMany({})
db.reviews.deleteMany({})
```

---

## 🎨 Features Implemented

### ✅ Backend
- [x] Express server with CORS
- [x] MongoDB connection
- [x] Enhanced User schema (patients/admin)
- [x] Enhanced Doctor schema
- [x] Enhanced Booking schema
- [x] Review schema
- [x] JWT authentication
- [x] Password hashing with bcrypt
- [x] Protected routes middleware
- [x] Role-based access control
- [x] Auth controller (register, login, getMe)

### ✅ Frontend
- [x] React Router setup
- [x] Auth Context (global state)
- [x] Protected routes
- [x] Home page
- [x] Login page
- [x] Register page (with role selection)
- [x] Patient Dashboard
- [x] Doctor Dashboard (with approval status)
- [x] Admin Dashboard
- [x] Responsive design with TailwindCSS
- [x] Toast notifications
- [x] Loading states

---

## 🔄 Next Steps

### Phase 1: Doctor Management
- [ ] Create doctor listing page
- [ ] Implement doctor search & filters
- [ ] Doctor profile page
- [ ] Doctor availability management

### Phase 2: Booking System
- [ ] Time slot generation
- [ ] Appointment booking flow
- [ ] Conflict detection
- [ ] Booking approval/decline
- [ ] Calendar view

### Phase 3: Admin Features
- [ ] Doctor approval workflow
- [ ] User management
- [ ] System analytics
- [ ] Daily bookings view

### Phase 4: Advanced Features
- [ ] Medical records management
- [ ] Visit notes & prescriptions
- [ ] Email notifications
- [ ] Payment integration
- [ ] Reviews & ratings

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
cd backend
npm install
npm start
```

### Frontend not loading?
```bash
cd frontend
npm install
npm run dev
```

### MongoDB connection error?
Make sure MongoDB is running:
```bash
# macOS
brew services start mongodb-community

# Or use MongoDB Atlas and update MONGO_URI in .env
```

### Port already in use?
Change the port in `backend/.env`:
```env
PORT=8001
```

---

## 📞 Support

For issues or questions:
1. Check the main README.md
2. Review the code comments
3. Check MongoDB connection
4. Verify all dependencies are installed

---

**Happy Coding! 🎉**
