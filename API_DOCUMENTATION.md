# HealthBook API Documentation

## Base URL
```
http://localhost:8000/api
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient", // or "doctor"
  "phone": "+1234567890",
  "gender": "male",
  "specialization": "Cardiologist" // Required only for doctors
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

---

## 👨‍⚕️ Doctor Endpoints

### Get All Doctors (Public)
```http
GET /doctors?specialization=Cardiologist&city=New York&search=john&minRating=4&page=1&limit=10
```

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `city` (optional): Filter by city
- `search` (optional): Search by name, specialization, or hospital
- `minRating` (optional): Minimum rating filter
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 25,
  "totalPages": 3,
  "currentPage": 1,
  "data": [
    {
      "_id": "doctor_id",
      "name": "Dr. Sarah Smith",
      "specialization": "Cardiologist",
      "hospital": {
        "name": "City Hospital",
        "city": "New York"
      },
      "averageRating": 4.5,
      "totalPatients": 150,
      "ticketPrice": 100
    }
  ]
}
```

### Get Single Doctor (Public)
```http
GET /doctors/:id
```

### Update Doctor Profile (Doctor/Admin)
```http
PUT /doctors/:id
Authorization: Bearer {token}
```

**Body:**
```json
{
  "bio": "Experienced cardiologist...",
  "ticketPrice": 150,
  "hospital": {
    "name": "New Hospital",
    "city": "Boston"
  }
}
```

### Update Doctor Schedule (Doctor Only)
```http
PUT /doctors/:id/schedule
Authorization: Bearer {token}
```

**Body:**
```json
{
  "timeSlots": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDuration": 30
    }
  ],
  "unavailableDates": ["2024-12-25", "2024-12-26"]
}
```

### Approve Doctor (Admin Only)
```http
PUT /doctors/:id/approve
Authorization: Bearer {token}
```

**Body:**
```json
{
  "isApproved": "approved" // or "rejected"
}
```

### Get Doctor Appointments (Doctor/Admin)
```http
GET /doctors/:id/appointments?status=pending&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

### Get Doctor Statistics (Doctor/Admin)
```http
GET /doctors/:id/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAppointments": 150,
    "pendingAppointments": 10,
    "completedAppointments": 120,
    "cancelledAppointments": 20,
    "todayAppointments": 5,
    "totalPatients": 100,
    "averageRating": 4.5,
    "totalReviews": 50
  }
}
```

---

## 📅 Booking Endpoints

### Check Slot Availability (Public)
```http
GET /bookings/check-availability?doctorId=doctor_id&date=2024-12-15
```

**Response:**
```json
{
  "success": true,
  "date": "2024-12-15",
  "doctorId": "doctor_id",
  "slots": [
    {
      "time": "09:00",
      "available": true
    },
    {
      "time": "09:30",
      "available": false
    }
  ]
}
```

### Create Booking (Patient Only)
```http
POST /bookings
Authorization: Bearer {token}
```

**Body:**
```json
{
  "doctor": "doctor_id",
  "appointmentDate": "2024-12-15",
  "appointmentTime": "09:00",
  "ticketPrice": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "booking_id",
    "doctor": {
      "name": "Dr. Sarah Smith",
      "specialization": "Cardiologist"
    },
    "appointmentDate": "2024-12-15",
    "appointmentTime": "09:00",
    "status": "pending"
  }
}
```

### Get My Bookings (All Authenticated Users)
```http
GET /bookings?status=pending&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "booking_id",
      "doctor": {
        "name": "Dr. Sarah Smith",
        "specialization": "Cardiologist"
      },
      "appointmentDate": "2024-12-15",
      "appointmentTime": "09:00",
      "status": "pending"
    }
  ]
}
```

### Get Single Booking
```http
GET /bookings/:id
Authorization: Bearer {token}
```

### Update/Reschedule Booking (Patient/Admin)
```http
PUT /bookings/:id
Authorization: Bearer {token}
```

**Body:**
```json
{
  "appointmentDate": "2024-12-16",
  "appointmentTime": "10:00"
}
```

### Cancel Booking (Patient/Doctor/Admin)
```http
DELETE /bookings/:id
Authorization: Bearer {token}
```

**Body:**
```json
{
  "reason": "Personal emergency"
}
```

### Approve Booking (Doctor Only)
```http
PUT /bookings/:id/approve
Authorization: Bearer {token}
```

### Complete Appointment (Doctor Only)
```http
PUT /bookings/:id/complete
Authorization: Bearer {token}
```

**Body:**
```json
{
  "visitNotes": {
    "symptoms": "Chest pain, shortness of breath",
    "diagnosis": "Mild angina",
    "prescription": [
      {
        "medicine": "Aspirin",
        "dosage": "75mg",
        "frequency": "Once daily",
        "duration": "30 days"
      }
    ],
    "labTests": ["ECG", "Blood Test"],
    "followUpDate": "2025-01-15",
    "doctorNotes": "Patient advised to reduce stress and exercise regularly"
  }
}
```

---

## ⭐ Review Endpoints

### Create Review (Patient Only)
```http
POST /reviews
Authorization: Bearer {token}
```

**Body:**
```json
{
  "doctor": "doctor_id",
  "rating": 5,
  "reviewText": "Excellent doctor! Very professional and caring."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "_id": "review_id",
    "doctor": "doctor_id",
    "user": {
      "name": "John Doe"
    },
    "rating": 5,
    "reviewText": "Excellent doctor!",
    "createdAt": "2024-12-12T10:00:00.000Z"
  }
}
```

### Get Doctor Reviews (Public)
```http
GET /reviews/doctor/:doctorId
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "averageRating": 4.5,
  "data": [
    {
      "_id": "review_id",
      "user": {
        "name": "John Doe",
        "photo": "url"
      },
      "rating": 5,
      "reviewText": "Excellent doctor!",
      "createdAt": "2024-12-12T10:00:00.000Z"
    }
  ]
}
```

### Get Single Review (Public)
```http
GET /reviews/:id
```

### Update Review (Patient Only - Own Review)
```http
PUT /reviews/:id
Authorization: Bearer {token}
```

**Body:**
```json
{
  "rating": 4,
  "reviewText": "Updated review text"
}
```

### Delete Review (Patient - Own Review, Admin - Any Review)
```http
DELETE /reviews/:id
Authorization: Bearer {token}
```

### Get My Reviews (Patient Only)
```http
GET /reviews/my/reviews
Authorization: Bearer {token}
```

---

## 🔒 Authorization Headers

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## 🧪 Testing with cURL

### Register a Patient
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get All Doctors
```bash
curl http://localhost:8000/api/doctors
```

### Check Availability
```bash
curl "http://localhost:8000/api/bookings/check-availability?doctorId=DOCTOR_ID&date=2024-12-15"
```

### Create Booking
```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "doctor": "DOCTOR_ID",
    "appointmentDate": "2024-12-15",
    "appointmentTime": "09:00",
    "ticketPrice": 100
  }'
```

---

## 📝 Notes

1. **Conflict Detection**: The booking system automatically prevents double-booking of time slots
2. **Doctor Approval**: New doctors must be approved by admin before they can accept appointments
3. **Review Restrictions**: Only patients who have completed appointments can leave reviews
4. **Rating Calculation**: Doctor ratings are automatically recalculated when reviews are added/updated/deleted
5. **Slot Generation**: Available slots are generated based on doctor's schedule and existing bookings

---

## 🚀 Next Steps

- Email/SMS notifications
- Payment integration
- File upload for medical documents
- Real-time updates with WebSockets
- Analytics dashboard
- Export reports (PDF/Excel)
