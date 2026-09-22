import mongoose from "mongoose";

const dbName = "projectManagement"; // Replace with your desired database name

const connectDB = async () => {
   try {
      const { connection } = await mongoose.connect(
         `${process.env.MONGO_URI}/${dbName}`,
      );

      // Modern Mongoose versions do not need these old flags:
      // useNewUrlParser and useUnifiedTopology are deprecated/removed.
      // Only pass extra options if you truly need them, for example:
      // await mongoose.connect(process.env.MONGO_URI, {
      //    maxPoolSize: 10,
      //    serverSelectionTimeoutMS: 5000,
      //    socketTimeoutMS: 45000,
      //    autoIndex: true,
      // });
      console.log("✅ MongoDB connected successfully", connection.host);
   } catch (error) {
      console.error("❌ Error connecting to MongoDB:", error);
      process.exit(1); // Exit the process with a failure code
   }
};

export default connectDB;
