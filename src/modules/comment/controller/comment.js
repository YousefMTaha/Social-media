import { StatusCodes } from "http-status-codes";
import commentModel from "../../../../DB/models/Comment.model.js";
import postModel from "../../../../DB/models/Post.model.js";
import ErrorClass from "../../../utils/errorClass.js";

export const add = async (req, res, next) => {
  const { commentBody } = req.body;
  const { postId } = req.params;

  // validate that the post is exist
  const isPostExist = await postModel.findById(postId);
  if (!isPostExist) {
    return next(new ErrorClass("post doesn't exist", StatusCodes.NOT_FOUND));
  }

  // validate that the post isn't deleted
  if (isPostExist.isDeleted) {
    return next(new ErrorClass("post is deleted", StatusCodes.NOT_FOUND));
  }

  // add comment info into DB
  const comment = await commentModel.create({
    commentBody,
    postId,
    createdBy: req.user._id,
  });

  // add comment into post comments array
  await postModel.updateOne(
    { _id: postId },
    { $push: { comments: comment._id } }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done", comment });
};

export const update = async (req, res, next) => {
  const { commentId } = req.params;
  const { commentBody } = req.body;

  // validate that the comment is exist
  const isCommentExist = await commentModel.findById(commentId);
  if (!isCommentExist) {
    return next(new ErrorClass("comment doesn't exist", StatusCodes.NOT_FOUND));
  }

  // verifying that the user own this comment
  if (isCommentExist.createdBy.toString() != req.user._id) {
    return next(
      new ErrorClass("you don't have permission", StatusCodes.FORBIDDEN)
    );
  }

  // update comment info into DB
  await commentModel.updateOne({ _id: commentId }, { commentBody });

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const remove = async (req, res, next) => {
  const { id } = req.params; // comment id

  // validate that the comment is exist
  const isCommentExist = await commentModel.findById(id);
  if (!isCommentExist) {
    return next(new ErrorClass("comment doesn't exist", StatusCodes.NOT_FOUND));
  }

  // verifying that the user own this comment
  if (isCommentExist.createdBy.toString() != req.user._id) {
    return next(
      new ErrorClass("you don't have permission", StatusCodes.FORBIDDEN)
    );
  }

  // remove comment from DB
  await commentModel.deleteOne({ _id: id });

  // remove commentId from post DB
  await postModel.updateOne(
    { _id: isCommentExist.postId },
    { $pull: { comments: id } }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const like = async (req, res, next) => {
  const { id } = req.params; //comment ID

  //verifying that comment is exist
  const comment = await commentModel.findById(id);
  if (!comment) {
    return next(new ErrorClass("Comment not found", StatusCodes.NOT_FOUND));
  }

  //add userId to likes array
  await commentModel.updateOne(
    { _id: id },
    {
      $addToSet: { likes: req.user._id }, // if userId is already exist in array it will not  be added again
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const unlike = async (req, res, next) => {
  const { id } = req.params; //comment ID

  //verifying that comment is exist
  const comment = await commentModel.findById(id);
  if (!comment) {
    return next(new ErrorClass("Comment not found", StatusCodes.NOT_FOUND));
  }

  //remove userId from likes array into comment DB
  await commentModel.updateOne(
    { _id: id },
    {
      $pull: { likes: req.user._id },
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};
