import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    default: ""
  },
  ticketPrice: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    default: "doctor"
  },

  // Doctor-specific fields
  specialization: {
    type: String,
    required: true
  },

  qualifications: [{
    degree: { type: String, required: true },
    university: { type: String, required: true },
    year: { type: Number }
  }],

  experiences: [{
    position: { type: String, required: true },
    hospital: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false }
  }],

  bio: {
    type: String,
    maxLength: 200
  },

  about: {
    type: String,
    maxLength: 1000
  },

  // Hospital/Clinic Information
  hospital: {
    name: String,
    address: String,
    city: String,
    state: String
  },

  // Time Slots Structure
  timeSlots: [{
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    startTime: { type: String, required: true }, // Format: "09:00"
    endTime: { type: String, required: true },   // Format: "17:00"
    slotDuration: { type: Number, default: 30 }  // Duration in minutes
  }],

  // Unavailable dates (holidays, leaves, etc.)
  unavailableDates: [{
    date: { type: Date, required: true },
    reason: String
  }],

  // Reviews and Ratings
  reviews: [{
    type: mongoose.Types.ObjectId,
    ref: "Review"
  }],

  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  totalRating: {
    type: Number,
    default: 0,
  },

  // Approval Status
  isApproved: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  // Appointments
  appointments: [{
    type: mongoose.Types.ObjectId,
    ref: "Booking"
  }],

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Total patients treated
  totalPatients: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
DoctorSchema.index({ email: 1 });
DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ isApproved: 1 });
DoctorSchema.index({ averageRating: -1 });

export default mongoose.model("Doctor", DoctorSchema);
