import { Schema, Types, model } from "mongoose";


const postSchema = new Schema(
  {
    content: { type: String, required: true },
    images: [{ type: Object }],
    video: { type: Object },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    comments: [{ type: Types.ObjectId, ref: "Comment" }],
    isDeleted: { type: Boolean, default: "false" },
    privacy: { type: String, enum: ["only me", "public"], default: "public" },
    pathId: String,
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);
const postModel = model("Post", postSchema);

export default postModel;
