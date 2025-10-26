import mongoose,{Document,Schema} from "mongoose";

export interface IFile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  url: string;
  thumbnailUrl?: string;
  fileType: "image" | "video" | "document";
  size: number;
  fileExtension: string;
  createdAt: Date;
}


const FileSchema: Schema = new Schema<IFile>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  thumbnailUrl: String,
  fileType: { type: String, enum: ["image", "video", "document"], required: true },
  size: { type: Number, required: true },
  fileExtension: String,
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.models.File || mongoose.model<IFile>("File", FileSchema);