import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { truncate } from "fs/promises";

export interface IUser extends Document {
  email: string;
  password?: string;
  tier: "free" | "pro";
  createdAt: Date;
  googleId: string;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, unique: true },
  password: { type: String, required: false },
  tier: { type: String, enum: ["free", "pro"], default: "free" },
  createdAt: { type: Date, default: Date.now },
  googleId: { type: String, unique: true,sparse:true },
});

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
