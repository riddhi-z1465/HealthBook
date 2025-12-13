import express from 'express';
import {
    createReview,
    getDoctorReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getMyReviews
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Routes
 */
// Get all reviews for a specific doctor
router.get('/doctor/:id', getDoctorReviews);

// Get single review
router.get('/:id', getReviewById);

/**
 * Protected Routes - Patient Only
 */
// Create new review
router.post('/', protect, restrictTo('patient'), createReview);

// Get my reviews
router.get('/my/reviews', protect, restrictTo('patient'), getMyReviews);

// Update own review
router.put('/:id', protect, restrictTo('patient'), updateReview);

// Delete own review (or admin can delete any)
router.delete('/:id', protect, restrictTo('patient', 'admin'), deleteReview);

export default router;
