const mongoose = require('mongoose')

const connectDB = async () => { 
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connection SUCCESS!");
    } catch (error) {
        console.error("MongoDB connection FAILED!",error);
        process.exit();
    }
}

module.exports = connectDB;     