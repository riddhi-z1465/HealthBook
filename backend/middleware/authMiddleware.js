import { verifyToken } from "../utils/jwtUtils.js";
import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";

/**
 * Protect routes - Verify JWT token
 * Attaches user/doctor object to req.user
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided",
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Get user/doctor from token
        let user;
        if (decoded.role === "doctor") {
            user = await Doctor.findById(decoded.id).select("-password");
        } else {
            user = await User.findById(decoded.id).select("-password");
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account is deactivated",
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = decoded.id;
        req.role = decoded.role;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed",
            error: error.message,
        });
    }
};

/**
 * Restrict access to specific roles
 * @param  {...String} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This route is restricted to: ${roles.join(", ")}`,
            });
        }
        next();
    };
};

/**
 * Check if doctor is approved
 * Only approved doctors can access certain routes
 */
export const checkDoctorApproval = async (req, res, next) => {
    try {
        if (req.role === "doctor") {
            const doctor = await Doctor.findById(req.userId);

            if (doctor.isApproved !== "approved") {
                return res.status(403).json({
                    success: false,
                    message: "Your account is pending approval from admin",
                    approvalStatus: doctor.isApproved,
                });
            }
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking doctor approval status",
            error: error.message,
        });
    }
};
