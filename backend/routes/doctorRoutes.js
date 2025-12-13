import express from 'express';
import {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    updateSchedule,
    approveDoctor,
    getDoctorAppointments,
    getDoctorStats,
    getAdminOverview,
} from '../controllers/doctorController.js';
import { protect, restrictTo, checkDoctorApproval } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Routes
 */
// Get all doctors with search and filters
router.get('/', getAllDoctors);

/**
 * Admin Overview Route (must be before :id)
 */
router.get('/admin/overview', protect, restrictTo('admin'), getAdminOverview);

// Get single doctor profile
router.get('/:id', getDoctorById);

/**
 * Protected Routes - Doctor Only
 */
// Update doctor profile
router.put('/:id', protect, restrictTo('doctor', 'admin'), updateDoctor);

// Update doctor schedule/availability
router.put('/:id/schedule', protect, restrictTo('doctor'), checkDoctorApproval, updateSchedule);

// Get doctor's appointments
router.get('/:id/appointments', protect, restrictTo('doctor', 'admin'), getDoctorAppointments);

// Get doctor statistics
router.get('/:id/stats', protect, restrictTo('doctor', 'admin'), getDoctorStats);

/**
 * Admin Only Routes
 */
// Approve or reject doctor
router.put('/:id/approve', protect, restrictTo('admin'), approveDoctor);

export default router;
