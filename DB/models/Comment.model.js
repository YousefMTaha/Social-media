import { Schema, Types, model } from "mongoose";

const commentSchema = new Schema(
  {
    commentBody: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    postId: { type: Types.ObjectId, ref: "Post", required: true },
    replies: [{ type: Types.ObjectId, ref: "CommentReplay" }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const commentModel = model("Comment", commentSchema);

export default commentModel;
