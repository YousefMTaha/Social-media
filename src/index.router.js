import userRouter from "./modules/user/user.router.js";
import postRouter from "./modules/post/post.router.js";
import replyCommentRouter from "./modules/replyComment/replyComment.router.js";
import commentRouter from "./modules/comment/comment.router.js";
import connectionDB from "../DB/connection.js";
import { globalErrorHandling } from "./utils/globalErrorHandling.js";

const bootstrap = (app, express) => {
  //convert buffer data
  app.use(express.json());

  app.use("/user", userRouter);
  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("/replyComment", replyCommentRouter);

  app.use("*", (req, res) => {
    return res.json("invalid routing check URL or Method");
  });

  // enable global error handling
  app.use(globalErrorHandling);

  // connect to mongoDB
  connectionDB();
};

export default bootstrap;
