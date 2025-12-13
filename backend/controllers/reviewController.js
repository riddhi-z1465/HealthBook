import Review from '../models/ReviewSchema.js';
import Doctor from '../models/DoctorSchema.js';
import Booking from '../models/BookingSchema.js';

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private (Patient only)
 */
export const createReview = async (req, res) => {
    try {
        const { doctor, rating, reviewText } = req.body;

        // Validate required fields
        if (!doctor || !rating || !reviewText) {
            return res.status(400).json({
                success: false,
                message: 'Doctor, rating, and review text are required'
            });
        }

        // Validate rating range
        if (rating < 0 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 0 and 5'
            });
        }

        // Check if user has completed appointment with this doctor
        const hasCompletedAppointment = await Booking.findOne({
            user: req.user.id,
            doctor,
            status: 'completed'
        });

        if (!hasCompletedAppointment) {
            return res.status(400).json({
                success: false,
                message: 'You can only review doctors you have visited'
            });
        }

        // Check if user has already reviewed this doctor
        const existingReview = await Review.findOne({
            user: req.user.id,
            doctor
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this doctor. You can update your existing review.'
            });
        }

        // Create review
        const review = await Review.create({
            doctor,
            user: req.user.id,
            rating,
            reviewText
        });

        // Update doctor's average rating and add review reference
        const allReviews = await Review.find({ doctor });
        const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

        await Doctor.findByIdAndUpdate(doctor, {
            averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            $push: { reviews: review._id }
        });

        // Populate review for response
        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name photo');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: populatedReview
        });
    } catch (error) {
        console.error('Error in createReview:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating review',
            error: error.message
        });
    }
};

/**
 * @desc    Get all reviews for a doctor
 * @route   GET /api/reviews/doctor/:id
 * @access  Public
 */
export const getDoctorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ doctor: req.params.id })
            .populate('user', 'name photo')
            .sort({ createdAt: -1 });

        // Get average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
            : 0;

        res.status(200).json({
            success: true,
            count: reviews.length,
            averageRating: Math.round(avgRating * 10) / 10,
            data: reviews
        });
    } catch (error) {
        console.error('Error in getDoctorReviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

/**
 * @desc    Get single review
 * @route   GET /api/reviews/:id
 * @access  Public
 */
export const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('user', 'name photo')
            .populate('doctor', 'name specialization');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error in getReviewById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching review',
            error: error.message
        });
    }
};

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private (Patient only - own review)
 */
export const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review'
            });
        }

        const { rating, reviewText } = req.body;

        // Validate rating if provided
        if (rating && (rating < 0 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 0 and 5'
            });
        }

        // Update review
        if (rating) review.rating = rating;
        if (reviewText) review.reviewText = reviewText;

        await review.save();

        // Recalculate doctor's average rating
        const allReviews = await Review.find({ doctor: review.doctor });
        const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

        await Doctor.findByIdAndUpdate(review.doctor, {
            averageRating: Math.round(avgRating * 10) / 10
        });

        // Populate review for response
        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name photo');

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: populatedReview
        });
    } catch (error) {
        console.error('Error in updateReview:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating review',
            error: error.message
        });
    }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Patient - own review, Admin - any review)
 */
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check authorization
        const isOwner = review.user.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        const doctorId = review.doctor;

        // Delete review
        await review.deleteOne();

        // Remove review reference from doctor
        await Doctor.findByIdAndUpdate(doctorId, {
            $pull: { reviews: review._id }
        });

        // Recalculate doctor's average rating
        const remainingReviews = await Review.find({ doctor: doctorId });
        const avgRating = remainingReviews.length > 0
            ? remainingReviews.reduce((acc, item) => item.rating + acc, 0) / remainingReviews.length
            : 0;

        await Doctor.findByIdAndUpdate(doctorId, {
            averageRating: Math.round(avgRating * 10) / 10
        });

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteReview:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting review',
            error: error.message
        });
    }
};

/**
 * @desc    Get user's reviews
 * @route   GET /api/reviews/my-reviews
 * @access  Private (Patient only)
 */
export const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate('doctor', 'name specialization photo')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Error in getMyReviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your reviews',
            error: error.message
        });
    }
};
