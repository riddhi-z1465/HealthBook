import express from 'express';
import {
    checkAvailability,
    createBooking,
    getMyBookings,
    getBookingById,
    updateBooking,
    cancelBooking,
    approveBooking,
    completeAppointment
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Routes
 */
// Check slot availability
router.get('/check-availability', checkAvailability);

/**
 * Protected Routes - Patient
 */
// Create new booking
router.post('/', protect, restrictTo('patient'), createBooking);

/**
 * Protected Routes - All authenticated users
 */
// Get my bookings (patient/doctor/admin)
router.get('/', protect, getMyBookings);

// Get single booking
router.get('/:id', protect, getBookingById);

// Update/reschedule booking
router.put('/:id', protect, updateBooking);

// Cancel booking
router.delete('/:id', protect, cancelBooking);

/**
 * Protected Routes - Doctor Only
 */
// Approve booking
router.put('/:id/approve', protect, restrictTo('doctor'), approveBooking);

// Complete appointment and add visit notes
router.put('/:id/complete', protect, restrictTo('doctor'), completeAppointment);

export default router;
