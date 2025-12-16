import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import createDefaultAdmin from "./utils/createDefaultAdmin.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
const allowedOrigins = new Set([
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:5174",
]);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.startsWith("http://localhost:")) return callback(null, true);
        if (allowedOrigins.has(origin)) return callback(null, true);
        return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "HealthBook API is running",
        timestamp: new Date().toISOString(),
    });
});

// Root route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to HealthBook API",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            auth: "/api/auth",
            doctors: "/api/doctors",
            bookings: "/api/bookings",
            reviews: "/api/reviews",
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        await connectDB();
        console.log("MongoDB connected. Creating admin...");
        await createDefaultAdmin();
        console.log("Admin check complete. Starting express...");

        app.listen(PORT, () => {
            console.log(`\n🚀 HealthBook Server is running`);
            console.log(`📍 Port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`🔗 API URL: http://localhost:${PORT}`);
            console.log(`💚 Health Check: http://localhost:${PORT}/api/health\n`);
        });
    } catch (error) {
        console.error("❌ Unable to start server:", error);
        process.exit(1);
    }
};

startServer();

export default app;
