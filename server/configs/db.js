import mongoose from "mongoose";    

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database connected successfully")
        })

        let mongodbURI = process.env.MONGODB_URI;
        const projectName = 'resume-builder';

        if (!mongodbURI) {
            throw new Error("MONGODB_URI environment variable not set")
        }

        // ✅ Correct: ADD '/' if missing, don't remove characters
        if (!mongodbURI.endsWith('/')) {
            mongodbURI = mongodbURI + '/'
        }
        
        await mongoose.connect(`${mongodbURI}${projectName}`)
    } catch (error) {
        console.log("Error connecting to MongoDB:", error)
    }
}

export default connectDB;