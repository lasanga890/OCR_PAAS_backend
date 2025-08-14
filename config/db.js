import mongoose from "mongoose";
const ConnectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error in mongodb connet ${error}`);
  }
};

export default ConnectDB;