import joi from "joi";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

// custom validate for id
const validateObjectId = (value, helper) =>
  Types.ObjectId.isValid(value) ? true : helper.message("In-valid objectId");

// general common fields validation
export const generalFields = {
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 4,
    tlds: { allow: ["com", "net"] },
  }),
  password: joi.string(),
  id: joi.string().custom(validateObjectId),
  phone: joi.string().regex(/^01[0-2,5]{1}[0-9]{8}$/),
  name: joi.string(),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const reqFields = ["body", "params", "query", "headers", "file", "files"]; // array of validation fields (body,params ,....)
    const validationErr = []; // array of errors could be happened throw validation process

    // loops validate each field in reqFields array
    reqFields.forEach((key) => {
      if (schema[key]) {
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false, // to show all errors at the same time
        });

        // catch any error from validate process
        if (validationResult.error) {
          validationErr.push(validationResult.error);
        }
      }
    });

    // return message to users if there is any validation error happened
    if (validationErr.length) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Validation Err", validationErr });
    }

    return next(); // move to the next middleware
  };
};

// general id validation
export const IdValidator = {
  body: joi.object({}).required(),
  params: joi
    .object({
      id: generalFields.id.required(),
    })
    .required(),
  query: joi.object({}).required(),
};
