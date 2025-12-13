import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import User from "../models/UserSchema.js";

/**
 * @desc    Get all doctors with search and filters
 * @route   GET /api/doctors
 * @access  Public
 */
export const getAllDoctors = async (req, res) => {
    try {
        const {
            specialization,
            city,
            search,
            minRating,
            page = 1,
            limit = 10
        } = req.query;

        // Build query
        const query = { isApproved: "approved" };

        if (specialization) {
            query.specialization = specialization;
        }

        if (city) {
            query['hospital.city'] = new RegExp(city, 'i');
        }

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { specialization: new RegExp(search, 'i') },
                { 'hospital.name': new RegExp(search, 'i') }
            ];
        }

        if (minRating) {
            query.averageRating = { $gte: parseFloat(minRating) };
        }

        // Execute query with pagination
        const doctors = await Doctor.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ averageRating: -1, totalPatients: -1 });

        const count = await Doctor.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: doctors
        });
    } catch (error) {
        console.error('Error in getAllDoctors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
            error: error.message
        });
    }
};

/**
 * @desc    Get single doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
export const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .select('-password')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'name photo'
                }
            });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error('Error in getDoctorById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctor details',
            error: error.message
        });
    }
};

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/:id
 * @access  Private (Doctor/Admin)
 */
export const updateDoctor = async (req, res) => {
    try {
        // Verify doctor is updating their own profile or is admin
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this profile'
            });
        }

        // Prevent updating sensitive fields
        const restrictedFields = ['password', 'email', 'isApproved', 'averageRating', 'totalPatients', 'reviews', 'appointments'];
        restrictedFields.forEach(field => delete req.body[field]);

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: doctor
        });
    } catch (error) {
        console.error('Error in updateDoctor:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

/**
 * @desc    Update doctor schedule/availability
 * @route   PUT /api/doctors/:id/schedule
 * @access  Private (Doctor only)
 */
export const updateSchedule = async (req, res) => {
    try {
        const { timeSlots, unavailableDates } = req.body;

        // Verify doctor is updating their own schedule
        if (req.user.id !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this schedule'
            });
        }

        const updateData = {};
        if (timeSlots) updateData.timeSlots = timeSlots;
        if (unavailableDates) updateData.unavailableDates = unavailableDates;

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Schedule updated successfully',
            data: doctor
        });
    } catch (error) {
        console.error('Error in updateSchedule:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating schedule',
            error: error.message
        });
    }
};

/**
 * @desc    Approve or reject doctor
 * @route   PUT /api/doctors/:id/approve
 * @access  Private (Admin only)
 */
export const approveDoctor = async (req, res) => {
    try {
        const { isApproved } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(isApproved)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid approval status. Must be "approved" or "rejected"'
            });
        }

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { isApproved },
            { new: true }
        ).select('-password');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // TODO: Send email notification to doctor

        res.status(200).json({
            success: true,
            message: `Doctor ${isApproved} successfully`,
            data: doctor
        });
    } catch (error) {
        console.error('Error in approveDoctor:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating doctor approval status',
            error: error.message
        });
    }
};

/**
 * @desc    Get doctor's appointments
 * @route   GET /api/doctors/:id/appointments
 * @access  Private (Doctor only)
 */
export const getDoctorAppointments = async (req, res) => {
    try {
        // Verify doctor is accessing their own appointments
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these appointments'
            });
        }

        const { status, startDate, endDate } = req.query;

        const query = { doctor: req.params.id };

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.appointmentDate = {};
            if (startDate) query.appointmentDate.$gte = new Date(startDate);
            if (endDate) query.appointmentDate.$lte = new Date(endDate);
        }

        const appointments = await Booking.find(query)
            .populate('user', 'name email phone photo')
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Error in getDoctorAppointments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};

/**
 * @desc    Admin overview for doctor approvals & stats
 * @route   GET /api/doctors/admin/overview
 * @access  Private (Admin only)
 */
export const getAdminOverview = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 5;
        const status = req.query.status || "pending";
        const filter = status === "all" ? {} : { isApproved: status };

        const doctors = await Doctor.find(filter)
            .select("name specialization hospital isApproved createdAt")
            .sort({ createdAt: -1 })
            .limit(limit);

        const [totalPatients, totalDoctors, pendingApprovals] = await Promise.all([
            User.countDocuments(),
            Doctor.countDocuments(),
            Doctor.countDocuments({ isApproved: "pending" }),
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayBookings = await Booking.countDocuments({
            appointmentDate: { $gte: today, $lt: tomorrow },
        });

        res.status(200).json({
            success: true,
            data: doctors,
            meta: {
                totalPatients,
                totalDoctors,
                pendingApprovals,
                todayBookings,
            },
        });
    } catch (error) {
        console.error("Error in getAdminOverview:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching admin overview",
            error: error.message,
        });
    }
};

/**
 * @desc    Get doctor statistics
 * @route   GET /api/doctors/:id/stats
 * @access  Private (Doctor only)
 */
export const getDoctorStats = async (req, res) => {
    try {
        // Verify doctor is accessing their own stats
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these statistics'
            });
        }

        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Get appointment statistics
        const totalAppointments = await Booking.countDocuments({ doctor: req.params.id });
        const pendingAppointments = await Booking.countDocuments({
            doctor: req.params.id,
            status: 'pending'
        });
        const completedAppointments = await Booking.countDocuments({
            doctor: req.params.id,
            status: 'completed'
        });
        const cancelledAppointments = await Booking.countDocuments({
            doctor: req.params.id,
            status: 'cancelled'
        });

        // Get today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointments = await Booking.countDocuments({
            doctor: req.params.id,
            appointmentDate: {
                $gte: today,
                $lt: tomorrow
            },
            status: { $in: ['pending', 'approved'] }
        });

        res.status(200).json({
            success: true,
            data: {
                totalAppointments,
                pendingAppointments,
                completedAppointments,
                cancelledAppointments,
                todayAppointments,
                totalPatients: doctor.totalPatients,
                averageRating: doctor.averageRating,
                totalReviews: doctor.reviews.length
            }
        });
    } catch (error) {
        console.error('Error in getDoctorStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};
