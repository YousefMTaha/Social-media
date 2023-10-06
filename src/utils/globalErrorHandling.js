import { StatusCodes } from "http-status-codes";
import ErrorClass from "./errorClass.js";

// catch any error from developer code like => Assignment to constant variable
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((err) => {
      return next(new ErrorClass(err?.message, StatusCodes.BAD_GATEWAY));
    });
  };
};

// catch any error from user request like  => ID is already exist
export const globalErrorHandling = (err, req, res, next) => {
  return res
    .status(err.status || 400)
    .json({ message: "Catch Error", err: err.message });
};
