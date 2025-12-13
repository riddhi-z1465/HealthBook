import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketPrice: {
      type: Number,
      required: true
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String, // Format: "09:00"
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled", "completed"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "insurance", "online"],
      default: "cash"
    },
    paymentId: {
      type: String // For tracking online payments
    },
    // Visit Details (filled after appointment)
    visitNotes: {
      symptoms: String,
      diagnosis: String,
      prescription: [{
        medicine: String,
        dosage: String,
        duration: String,
        instructions: String
      }],
      labTests: [String],
      followUpDate: Date,
      doctorNotes: String
    },
    // Cancellation Info
    cancellationReason: String,
    cancelledBy: {
      type: String,
      enum: ["patient", "doctor", "admin"]
    },
    cancelledAt: Date,
    // Reminder sent
    reminderSent: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes for faster queries
bookingSchema.index({ doctor: 1, appointmentDate: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ appointmentDate: 1 });

// Prevent double booking
bookingSchema.index(
  { doctor: 1, appointmentDate: 1, appointmentTime: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["pending", "approved"] } } }
);

export default mongoose.model("Booking", bookingSchema);
