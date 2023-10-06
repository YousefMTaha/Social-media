import { Schema, Types, model } from "mongoose";

const commentReplaySchema = new Schema(
  {
    replayBody: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    commentId: { type: Types.ObjectId, ref: "Comment", required: true },
    likes: [{ type: Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const commentReplayModel = model("CommentReplay", commentReplaySchema);

export default commentReplayModel;
