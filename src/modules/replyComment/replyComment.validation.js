import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const add = {
  body: Joi.object({
    replayBody: Joi.string().required(),
  }).required(),
  params: Joi.object({
    commentId: generalFields.id.required(),
  }).required(),
  query: Joi.object({}).required(),
};

export const update = {
  body: Joi.object({
    replayBody: Joi.string().required(),
  }).required(),
  params: Joi.object({
    replyCommentId: generalFields.id.required(),
  }).required(),
  query: Joi.object({}).required(),
};
