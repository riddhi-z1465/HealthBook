import bcrypt from "bcryptjs";
import User from "../models/UserSchema.js";

/**
 * Ensures there is at least one admin user in the system.
 * Uses environment overrides when provided, otherwise falls back
 * to safe defaults suitable for local development.
 */
const createDefaultAdmin = async () => {
    const email = process.env.ADMIN_EMAIL || "admin@healthbook.com";
    const password = process.env.ADMIN_PASSWORD || "Admin@123";
    const name = process.env.ADMIN_NAME || "HealthBook Admin";

    const existingUser = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
        existingUser.role = "admin";
        existingUser.name = name || existingUser.name;
        existingUser.isActive = true;
        existingUser.password = hashedPassword;
        await existingUser.save();
        console.log(`🔐 Ensured admin credentials for ${email}`);
        return;
    }

    await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
    });

    console.log("✅ Default admin user created:");
    console.log(`   • Email: ${email}`);
    console.log("   • Password: (use ADMIN_PASSWORD env or default)");
};

export default createDefaultAdmin;
