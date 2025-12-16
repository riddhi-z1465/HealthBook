import mongoose from "mongoose";

/**
 * Connect to MongoDB Database
 */
const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB URI:", process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("🔌 Mongoose disconnected from MongoDB");
});

export default connectDB;
