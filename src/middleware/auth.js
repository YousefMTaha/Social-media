import { StatusCodes } from "http-status-codes";
import ErrorClass from "../utils/errorClass.js";
import { asyncHandler } from "../utils/globalErrorHandling.js";
import jwt from "jsonwebtoken";
import userModel from "../../DB/models/User.model.js";

const auth =  asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    // verify that the bearer Key is valid
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(
        new ErrorClass("In-valid bearer key", StatusCodes.BAD_REQUEST)
      );
    }

    // verify that the token valid
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      return next(new ErrorClass("In-valid token", StatusCodes.UNAUTHORIZED));
    }

    // verify that the payload of token valid
    const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE);
    if (!decoded?.id) {
      return next(
        new ErrorClass("In-valid token payload", StatusCodes.BAD_REQUEST)
      );
    }

    // verify that the userID in DB
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(
        new ErrorClass("Not register account", StatusCodes.NOT_FOUND)
      );
    }

    // verify that the user hasn't been deleted
    if (user.isDeleted) {
      return next(
        new ErrorClass("User account has been deleted", StatusCodes.FORBIDDEN)
      );
    }

    // add user info into request so I can use him in next middleware
    req.user = user;

    // go to the next middleware
    return next();
  });

export default auth;
