import jwt from "jsonwebtoken";

/**
 * Generate JWT Token
 * @param {String} id - User ID
 * @param {String} role - User role (patient, doctor, admin)
 * @returns {String} JWT token
 */
export const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || "7d",
        }
    );
};

/**
 * Verify JWT Token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};
