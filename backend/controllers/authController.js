import bcrypt from "bcryptjs";
import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import { generateToken } from "../utils/jwtUtils.js";

/**
 * @desc    Register a new user (Patient or Doctor)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
    try {
        const { email, password, name, role, phone, gender, photo, specialization } = req.body;

        // Validation
        if (!email || !password || !name || !role) {
            return res.status(400).json({
                success: false,
                message: "Please provide email, password, name, and role",
            });
        }

        // Check if user already exists
        let existingUser;
        if (role === "doctor") {
            existingUser = await Doctor.findOne({ email });
        } else {
            existingUser = await User.findOne({ email });
        }

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user based on role
        let user;
        if (role === "doctor") {
            // Doctors require specialization
            if (!specialization) {
                return res.status(400).json({
                    success: false,
                    message: "Specialization is required for doctors",
                });
            }

            user = await Doctor.create({
                email,
                password: hashedPassword,
                name,
                phone,
                gender,
                photo,
                role: "doctor",
                specialization,
                isApproved: "pending", // Doctors need admin approval
            });
        } else {
            user = await User.create({
                email,
                password: hashedPassword,
                name,
                phone,
                gender,
                photo,
                role: role || "patient",
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: role === "doctor"
                ? "Doctor registered successfully. Awaiting admin approval."
                : "User registered successfully",
            token,
            user: userResponse,
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to register user",
            error: error.message,
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        // Find user in both collections
        let user = await User.findOne({ email }).select("+password");
        let role = "patient";

        if (!user) {
            user = await Doctor.findOne({ email }).select("+password");
            role = "doctor";
        }

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Your account has been deactivated. Please contact support.",
            });
        }

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userResponse,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to login",
            error: error.message,
        });
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
    try {
        let user;
        if (req.role === "doctor") {
            user = await Doctor.findById(req.userId)
                .select("-password")
                .populate("appointments");
        } else {
            user = await User.findById(req.userId)
                .select("-password")
                .populate("appointments");
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get Me Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get user data",
            error: error.message,
        });
    }
};
