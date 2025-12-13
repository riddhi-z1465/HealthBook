import Booking from '../models/BookingSchema.js';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';

/**
 * Helper: Check if a time slot is available
 */
const isSlotAvailable = async (doctorId, date, time) => {
    const existingBooking = await Booking.findOne({
        doctor: doctorId,
        appointmentDate: date,
        appointmentTime: time,
        status: { $in: ['pending', 'approved'] }
    });

    return !existingBooking;
};

/**
 * Helper: Generate available time slots for a specific date
 */
const getAvailableSlots = async (doctorId, date) => {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        throw new Error('Doctor not found');
    }

    // Get day name from date
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    // Find schedule for this day
    const daySchedule = doctor.timeSlots.find(slot => slot.day === dayName);

    if (!daySchedule) {
        return []; // Doctor doesn't work on this day
    }

    // Check if date is in unavailable dates
    const isUnavailable = doctor.unavailableDates.some(
        unavailableDate => new Date(unavailableDate).toDateString() === new Date(date).toDateString()
    );

    if (isUnavailable) {
        return []; // Doctor is unavailable on this date
    }

    // Generate time slots
    const slots = [];
    const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
    const duration = daySchedule.slotDuration || 30;

    let currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTime) {
        const timeString = currentTime.toTimeString().substring(0, 5); // HH:mm format
        const available = await isSlotAvailable(doctorId, date, timeString);

        slots.push({
            time: timeString,
            available
        });

        currentTime.setMinutes(currentTime.getMinutes() + duration);
    }

    return slots;
};

/**
 * @desc    Check slot availability for a doctor on a specific date
 * @route   GET /api/bookings/check-availability
 * @access  Public
 */
export const checkAvailability = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Doctor ID and date are required'
            });
        }

        const slots = await getAvailableSlots(doctorId, date);

        res.status(200).json({
            success: true,
            date,
            doctorId,
            slots
        });
    } catch (error) {
        console.error('Error in checkAvailability:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking availability',
            error: error.message
        });
    }
};

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (Patient only)
 */
export const createBooking = async (req, res) => {
    try {
        const { doctor, appointmentDate, appointmentTime, ticketPrice } = req.body;

        // Validate required fields
        if (!doctor || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'Doctor, appointment date, and time are required'
            });
        }

        // Check if doctor exists and is approved
        const doctorDoc = await Doctor.findById(doctor);
        if (!doctorDoc) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        if (doctorDoc.isApproved !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'This doctor is not approved yet'
            });
        }

        // Check if slot is available
        const available = await isSlotAvailable(doctor, appointmentDate, appointmentTime);

        if (!available) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose another time.'
            });
        }

        // Check if appointment date is in the past
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
        if (appointmentDateTime < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book appointments in the past'
            });
        }

        // Create booking
        const booking = await Booking.create({
            doctor,
            user: req.user.id,
            appointmentDate,
            appointmentTime,
            ticketPrice: ticketPrice || doctorDoc.ticketPrice,
            status: 'pending'
        });

        // Update doctor and user references
        await Doctor.findByIdAndUpdate(doctor, {
            $push: { appointments: booking._id }
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: { appointments: booking._id }
        });

        // Populate booking data for response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('doctor', 'name specialization photo hospital ticketPrice')
            .populate('user', 'name email phone');

        // TODO: Send confirmation email/notification

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: populatedBooking
        });
    } catch (error) {
        console.error('Error in createBooking:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
};

/**
 * @desc    Get user's bookings (patient or doctor)
 * @route   GET /api/bookings
 * @access  Private
 */
export const getMyBookings = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'patient') {
            query = { user: req.user.id };
        } else if (req.user.role === 'doctor') {
            query = { doctor: req.user.id };
        } else if (req.user.role === 'admin') {
            query = {}; // Admin sees all bookings
        } else {
            return res.status(403).json({
                success: false,
                message: 'Invalid user role'
            });
        }

        const { status, startDate, endDate } = req.query;

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.appointmentDate = {};
            if (startDate) query.appointmentDate.$gte = new Date(startDate);
            if (endDate) query.appointmentDate.$lte = new Date(endDate);
        }

        const bookings = await Booking.find(query)
            .populate('doctor', 'name specialization photo hospital ticketPrice')
            .populate('user', 'name email phone photo')
            .sort({ appointmentDate: -1, appointmentTime: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Error in getMyBookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('doctor', 'name specialization photo hospital ticketPrice')
            .populate('user', 'name email phone photo');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization
        const isPatient = booking.user._id.toString() === req.user.id;
        const isDoctor = booking.doctor._id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isPatient && !isDoctor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error in getBookingById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
};

/**
 * @desc    Update/Reschedule booking
 * @route   PUT /api/bookings/:id
 * @access  Private
 */
export const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization (only patient can reschedule)
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking'
            });
        }

        // Cannot update completed or cancelled bookings
        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot update ${booking.status} booking`
            });
        }

        const { appointmentDate, appointmentTime } = req.body;

        // If rescheduling, check new slot availability
        if (appointmentDate || appointmentTime) {
            const newDate = appointmentDate || booking.appointmentDate;
            const newTime = appointmentTime || booking.appointmentTime;

            // Skip availability check if same slot
            const isSameSlot = newDate.toString() === booking.appointmentDate.toString() &&
                newTime === booking.appointmentTime;

            if (!isSameSlot) {
                const available = await isSlotAvailable(booking.doctor, newDate, newTime);

                if (!available) {
                    return res.status(400).json({
                        success: false,
                        message: 'New time slot is not available'
                    });
                }
            }
        }

        // Prevent updating certain fields
        delete req.body.doctor;
        delete req.body.user;
        delete req.body.visitNotes;

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('doctor', 'name specialization photo hospital')
            .populate('user', 'name email phone');

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            data: updatedBooking
        });
    } catch (error) {
        console.error('Error in updateBooking:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating booking',
            error: error.message
        });
    }
};

/**
 * @desc    Cancel booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization
        const isPatient = booking.user.toString() === req.user.id;
        const isDoctor = booking.doctor.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isPatient && !isDoctor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Cannot cancel already completed or cancelled bookings
        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed appointment'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        booking.status = 'cancelled';
        booking.cancelledBy = req.user.role;
        booking.cancelledAt = new Date();
        booking.cancellationReason = req.body.reason || 'No reason provided';

        await booking.save();

        // TODO: Send cancellation notification

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error in cancelBooking:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        });
    }
};

/**
 * @desc    Approve booking (Doctor only)
 * @route   PUT /api/bookings/:id/approve
 * @access  Private (Doctor only)
 */
export const approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Verify doctor is approving their own appointment
        if (booking.doctor.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to approve this booking'
            });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot approve ${booking.status} booking`
            });
        }

        booking.status = 'approved';
        await booking.save();

        // TODO: Send approval notification to patient

        res.status(200).json({
            success: true,
            message: 'Booking approved successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error in approveBooking:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving booking',
            error: error.message
        });
    }
};

/**
 * @desc    Complete appointment and add visit notes (Doctor only)
 * @route   PUT /api/bookings/:id/complete
 * @access  Private (Doctor only)
 */
export const completeAppointment = async (req, res) => {
    try {
        const { visitNotes } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Verify doctor is completing their own appointment
        if (booking.doctor.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to complete this booking'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot complete cancelled booking'
            });
        }

        booking.status = 'completed';
        if (visitNotes) {
            booking.visitNotes = visitNotes;
        }

        await booking.save();

        // Update doctor's total patients count
        await Doctor.findByIdAndUpdate(booking.doctor, {
            $inc: { totalPatients: 1 }
        });

        // TODO: Send completion notification to patient

        res.status(200).json({
            success: true,
            message: 'Appointment completed successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error in completeAppointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing appointment',
            error: error.message
        });
    }
};
