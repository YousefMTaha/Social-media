import { StatusCodes } from "http-status-codes";
import postModel from "../../../../DB/models/Post.model.js";
import ErrorClass from "../../../utils/errorClass.js";
import cloudinary from "../../../utils/cloudinary.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import { pageInfo } from "../../../utils/countPage.js";
import { nanoid } from "nanoid";
import commentModel from "../../../../DB/models/Comment.model.js";
import commentReplayModel from "../../../../DB/models/CommentReplay.model.js";
import {
  cloudinaryRemove,
  cloudinaryTypes,
  cloudinaryUpload,
} from "../../../utils/cloudinaryFunctions.js";

export const add = async (req, res, next) => {
  const { content, privacy } = req.body;
  const pathId = nanoid();

  // check if user send video
  if (req.files.video?.length) {
    await cloudinaryUpload({
      req,
      type: cloudinaryTypes.video,
      files: true,
      pathId,
    });
  }

  // check if user send images
  if (req.files.images?.length) {
    await cloudinaryUpload({
      req,
      type: cloudinaryTypes.image,
      files: true,
      pathId,
    });
  }

  // add post to DB
  const post = await postModel.create({
    createdBy: req.user._id,
    content,
    privacy,
    pathId,
    images: req.body.images,
    video: req.body.video,
  });

  return res.status(StatusCodes.ACCEPTED).json({ message: "done", post });
};

export const update = async (req, res, next) => {
  const { content } = req.body;
  const { id } = req.params; // postId

  // validate that the post is exist
  const isPostExist = await postModel.findById(id);
  if (!isPostExist) {
    return next(new ErrorClass("post doesn't exist", StatusCodes.NOT_FOUND));
  }

  // validate that the user own this post
  if (isPostExist.createdBy.toString() != req.user._id) {
    return next(
      new ErrorClass("you don't have permission", StatusCodes.FORBIDDEN)
    );
  }
  // validate that the post isn't deleted
  if (isPostExist.isDeleted) {
    return next(new ErrorClass("post is deleted", StatusCodes.NOT_FOUND));
  }

  // if user want to update or upload image
  if (req.files.images?.length) {
    await cloudinaryUpload({
      req,
      type: cloudinaryTypes.image,
      files: true,
      pathId: isPostExist.pathId,
      deletePrevious: isPostExist.images ? true : false, // check if there is any image uploaded before or not
    });
  }

  // if user want to update or upload video
  if (req.files.video?.length) {
    await cloudinaryUpload({
      req,
      type: cloudinaryTypes.video,
      files: true,
      pathId: isPostExist.pathId,
      deletePrevious: isPostExist.video ? true : false, // check if there is any video uploaded before or not
    });
  }

  // update post into DB
  await postModel.updateOne(
    { _id: id },
    {
      content,
      images: req.body.images,
      video: req.body.video,
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const getPostById = async (req, res, next) => {
  const { id } = req.params;

  // verifying that postId is exist
  const post = await postModel.findById(id);
  if (!post || post.isDeleted) {
    return next(new ErrorClass("post not found", StatusCodes.NOT_FOUND));
  }

  // verifying that the user can see that post (privacy)
  if (post.privacy == "only me" && post.createdBy.toString() != req.user._id) {
    return next(
      new ErrorClass("Only the owner can see this post", StatusCodes.FORBIDDEN)
    );
  }

  return res.status(StatusCodes.ACCEPTED).json({ message: "done", post });
};

export const postPrivacy = async (req, res, next) => {
  const { privacy } = req.body;
  const { postId } = req.params;

  // change privacy into DB
  const post = await postModel.findOneAndUpdate(
    { _id: postId, isDeleted: false },
    { privacy }
  );
  return !post
    ? next(new ErrorClass("post is deleted", StatusCodes.NOT_FOUND))
    : res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const getAllPosts = async (req, res, next) => {
  // get all public posts with comments
  let posts = postModel
    .find({
      privacy: "public",
      isDeleted: false,
    })
    .populate({
      path: "comments",
    });

  const apiFeatures = new ApiFeatures(posts, req.query)
    .search() // search with specific key
    .select() // select some fields to appear
    .filter() // filter some words from query request like(sort,fields,....)
    .pagination() // spilt posts into different pages and control amount of posts that appear on one page
    .sort(); // sort posts with specific fields

  posts = await apiFeatures.mongooseQuery; // apply all queries on data

  if (!posts.length) {
    return next(new ErrorClass("no posts found", StatusCodes.NOT_FOUND));
  }

  pageInfo(req.query); // add all page info to req

  return res.status(StatusCodes.ACCEPTED).json({
    message: "done",
    posts,
    noOfPosts: req.query.noDoc,
    noOfPage: req.query.noOfPage,
    currentPage: req.query.page,
    nextPage: req.query.nextPage,
    perviousPage: req.query.previousPage,
  });
};

export const getPostsToday = async (req, res, next) => {
  // get today's date
  const today = new Date();

  // Set the beginning of today
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // get all public posts with comments
  let posts = postModel.find({
    privacy: "public",
    createdAt: { $gte: todayStart },
    isDeleted: false,
  });

  const apiFeatures = new ApiFeatures(posts, req.query)
    .search() // search with specific key
    .select() // select some fields to appear
    .filter() // filter some words from request query like(sort,fields,....)
    .pagination() // spilt posts into different pages and control amount of posts that appear on one page
    .sort(); // sort posts with specific fields

  posts = await apiFeatures.mongooseQuery; // apply all queries on data

  if (!posts.length) {
    return next(new ErrorClass("no posts found", StatusCodes.NOT_FOUND));
  }

  pageInfo(req.query); // add all page info to req

  return res.status(StatusCodes.ACCEPTED).json({
    message: "done",
    posts,
    noOfPosts: req.query.noDoc,
    noOfPage: req.query.noOfPage,
    currentPage: req.query.page,
    nextPage: req.query.nextPage,
    perviousPage: req.query.previousPage,
  });
};

export const getPostsYesterday = async (req, res, next) => {
  // get yesterday's date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // set the beginning and end of yesterday
  const yesterdayStart = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );

  const yesterdayEnd = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
    23,
    59,
    59,
    999
  );

  // get all public posts with comments yesterday
  let posts = postModel.find({
    privacy: "public",
    createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd },
    isDeleted: false,
  });

  const apiFeatures = new ApiFeatures(posts, req.query)
    .search() // search with specific key
    .select() // select some fields to appear
    .filter() // filter some words from request query like(sort,fields,....)
    .pagination() // spilt posts into different pages and control amount of posts that appear on one page
    .sort(); // sort posts with specific fields

  posts = await apiFeatures.mongooseQuery; // apply all queries on data

  if (!posts.length) {
    return next(new ErrorClass("no posts found", StatusCodes.NOT_FOUND));
  }

  pageInfo(req.query); // add all page info to req

  return res.status(StatusCodes.ACCEPTED).json({
    message: "done",
    posts,
    noOfPosts: req.query.noDoc,
    noOfPage: req.query.noOfPage,
    currentPage: req.query.page,
    nextPage: req.query.nextPage,
    perviousPage: req.query.previousPage,
  });
};

export const likePost = async (req, res, next) => {
  const { id } = req.params; //post ID

  //verifying that postId is exist
  const post = await postModel.findById(id);
  if (!post || post.isDeleted) {
    return next(new ErrorClass("post not found", StatusCodes.NOT_FOUND));
  }

  //add userId to like array
  await postModel.updateOne(
    { _id: id },
    {
      $addToSet: { likes: req.user._id }, // if userId is already exist in array it will not  be added again
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const unlikePost = async (req, res, next) => {
  const { id } = req.params; //post ID

  //verifying that postId is exist
  const post = await postModel.findById(id);
  if (!post || post.isDeleted) {
    return next(new ErrorClass("post not found", StatusCodes.NOT_FOUND));
  }

  //remove userId from like array
  await postModel.updateOne(
    { _id: id },
    {
      $pull: { likes: req.user._id },
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const deletePost = async (req, res, next) => {
  const { id } = req.params; // post id

  // validate that the post is exist
  const isPostExist = await postModel.findById(id);
  if (!isPostExist) {
    return next(new ErrorClass("post doesn't exist", StatusCodes.NOT_FOUND));
  }

  // validate that the user own this post
  if (isPostExist.createdBy.toString() != req.user._id) {
    return next(
      new ErrorClass("you don't have permission", StatusCodes.FORBIDDEN)
    );
  }

  if (isPostExist.images.length) {
    // delete the previous images from cloudinary
    await cloudinaryRemove({
      req,
      pathId: isPostExist.pathId,
      delete_folder: true,
    });
  }

  if (isPostExist.video) {
    // delete the previous video from cloudinary
    await cloudinaryRemove({
      req,
      pathId: isPostExist.pathId,
      delete_folder: true,
      type: cloudinaryTypes.video,
    });
  }

  // delete replayComments from DB
  const comments = await commentModel.find({ postId: id });
  for (const comment of comments) {
    await commentReplayModel.deleteMany({ commentId: comment._id });
    await commentModel.deleteOne({ _id: comment._id });
  }

  // delete post from DB
  await postModel.deleteOne({ _id: id });

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const softDeletePost = async (req, res, next) => {
  const { id } = req.params; //post id

  // validate that the post is exist
  const isPostExist = await postModel.findById(id);
  if (!isPostExist) {
    return next(new ErrorClass("post doesn't exist", StatusCodes.NOT_FOUND));
  }

  // validate that the user own this post
  if (isPostExist.createdBy.toString() != req.user._id) {
    return next(
      new ErrorClass("you don't have permission", StatusCodes.FORBIDDEN)
    );
  }

  // change status of isDeleted to true
  await postModel.updateOne({ _id: id }, { isDeleted: true });

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const addVideo = async (req, res, next) => {
  const { id } = req.params; // postId

  // validate that the post is exist
  const isPostExist = await postModel.findById(id);
  if (!isPostExist) {
    return next(new ErrorClass("post doesn't exist", StatusCodes.NOT_FOUND));
  }

  // validate that the user own this post
  if (isPostExist.createdBy.toString() != req.user._id) {
    return next(
      new ErrorClass("you don't have permission", StatusCodes.FORBIDDEN)
    );
  }
  // validate that the post isn't deleted
  if (isPostExist.isDeleted) {
    return next(new ErrorClass("post is deleted", StatusCodes.NOT_FOUND));
  }

  req.body.video = isPostExist.video;
  await cloudinaryUpload({
    req,
    type: cloudinaryTypes.video,
    pathId: isPostExist.pathId,
    deletePrevious: isPostExist.video ? true : false, // check if there is any video uploaded before or not
  });

  // add video link in DB
  await postModel.updateOne(
    { _id: id },
    {
      video: req.body.video,
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};
