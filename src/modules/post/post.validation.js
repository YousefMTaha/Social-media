import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const add = {
  body: Joi.object({
    content: Joi.string().required(),
    privacy: Joi.string().valid("privacy", "only me"),
  }).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
  files: Joi.object({
    video: Joi.array().items(generalFields.file).length(1),
    images: Joi.array().items(generalFields.file).min(1).max(5),
  }),
};

export const addVideo = {
  body: Joi.object({}).required(),
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
  query: Joi.object({}).required(),
  file: generalFields.file.required(),
};

export const update = {
  body: Joi.object({
    content: Joi.string(),
  }).required(),
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
  query: Joi.object({}).required(),
  files: Joi.object({
    video: Joi.array().items(generalFields.file).length(1),
    images: Joi.array().items(generalFields.file).min(1).max(5),
  }),
};

export const updatePrivacy = {
  body: Joi.object({
    privacy: Joi.string().valid("privacy", "only me").required(),
  }).required(),
  params: Joi.object({
    postId: generalFields.id.required(),
  }).required(),
  query: Joi.object({}).required(),
};
