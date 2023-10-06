import { StatusCodes } from "http-status-codes";
import commentModel from "../../../../DB/models/Comment.model.js";
import commentReplayModel from "../../../../DB/models/CommentReplay.model.js";
import ErrorClass from "../../../utils/errorClass.js";

export const add = async (req, res, next) => {
  const { replayBody } = req.body;
  const { commentId } = req.params;

  // validate that the comment is exist
  const isCommentExist = await commentModel.findById(commentId);
  if (!isCommentExist) {
    return next(new ErrorClass("comment doesn't exist", StatusCodes.NOT_FOUND));
  }

  // add replyComment info into DB
  const replyComment = await commentReplayModel.create({
    replayBody,
    commentId,
    createdBy: req.user._id,
  });

  //add replayComment into original comment replies array
  await commentModel.updateOne(
    { _id: commentId },
    { $push: { replies: replyComment._id } }
  );

  return res
    .status(StatusCodes.ACCEPTED)
    .json({ message: "done", replyComment });
};

export const update = async (req, res, next) => {
  const { replyCommentId } = req.params;
  const { replayBody } = req.body;

  // validate that the replayComment is exist
  const isReplayCommentExist = await commentReplayModel.findById(
    replyCommentId
  );
  if (!isReplayCommentExist) {
    return next(new ErrorClass("comment doesn't exist", StatusCodes.NOT_FOUND));
  }

  // verifying that the user own this comment
  if (isReplayCommentExist.createdBy.toString() != req.user._id) {
    return next(
      new ErrorClass("you don't have permission", StatusCodes.FORBIDDEN)
    );
  }

  // update replyComment info into DB
  await commentReplayModel.updateOne({ _id: replyCommentId }, { replayBody });

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const remove = async (req, res, next) => {
  const { id } = req.params; // replyComment id

  // validate that the replayComment is exist
  const isReplayCommentExist = await commentReplayModel.findById(id);
  if (!isReplayCommentExist) {
    return next(new ErrorClass("comment doesn't exist", StatusCodes.NOT_FOUND));
  }

  // verifying that the user own this comment
  if (isReplayCommentExist.createdBy.toString() != req.user._id) {
    return next(
      new ErrorClass("you don't have permission", StatusCodes.FORBIDDEN)
    );
  }

  // remove replyComment from DB
  await commentReplayModel.deleteOne({ _id: id });

  // remove replyCommentId from comment DB
  await commentModel.updateOne(
    { _id: isReplayCommentExist.commentId },
    { $pull: { replies: id } }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const like = async (req, res, next) => {
  const { id } = req.params; //replyComment ID

  //verifying that replyComment is exist
  const replyComment = await commentReplayModel.findById(id);
  if (!replyComment) {
    return next(new ErrorClass("Comment not found", StatusCodes.NOT_FOUND));
  }

  //add userId to likes array into reply DB
  await commentReplayModel.updateOne(
    { _id: id },
    {
      $addToSet: { likes: req.user._id }, // if userId is already exist in array it will not  be added again
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const unlike = async (req, res, next) => {
  const { id } = req.params; //replyComment ID

  //verifying that replyComment is exist
  const replyComment = await commentReplayModel.findById(id);
  if (!replyComment) {
    return next(new ErrorClass("Comment not found", StatusCodes.NOT_FOUND));
  }

  //remove userId from likes array into reply DB
  await commentReplayModel.updateOne(
    { _id: id },
    {
      $pull: { likes: req.user._id },
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};
