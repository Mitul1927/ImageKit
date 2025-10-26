import mongoose, { Connection } from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI!;

if(!MONGODB_URI){
    throw new Error("Please define mongo_uri in env variables");
}

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;
if(!cached){
    cached = global.mongoose = {conn:null,promise:null};
}

export async function connectToDatabase(){
    if(cached.conn){
        console.log("cachec conn = ",cached.conn.readyState);
        return cached.conn;
    }
    if(!cached.promise){
        const options = {
            bufferCommands:false,
            maxPoolSize : 10,
            serverSelectionTimeoutMS:5000,
        };
        cached.promise = mongoose.connect(MONGODB_URI, options).then((mongooseInstance) => {
            console.log("MongoDB connected successfully!");
            return mongooseInstance.connection;
        });
    }
    try{
        cached.conn = await cached.promise;
        console.log("MongoDB connection state:", cached.conn.readyState);
    }catch(error){
        cached.promise = null;
        console.error("MongoDB connection failed:", error);
        throw error;
    }
    return cached.conn;
}