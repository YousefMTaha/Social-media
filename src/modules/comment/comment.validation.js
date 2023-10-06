import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const add = {
  body: Joi.object({
    commentBody: Joi.string().required(),
  }).required(),
  params: Joi.object({
    postId: generalFields.id.required(),
  }).required(),
  query: Joi.object({}).required(),
};

export const update = {
  body: Joi.object({
    commentBody: Joi.string().required(),
  }).required(),
  params: Joi.object({
    commentId: generalFields.id.required(),
  }).required(),
  query: Joi.object({}).required(),
};
