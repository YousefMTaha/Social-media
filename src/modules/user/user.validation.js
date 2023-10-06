import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const signup = {
  body: Joi.object({
    userName: generalFields.name.required(),
    email: generalFields.email.required(),
    phone: generalFields.phone.required(),
    password: generalFields.password.required(),
    age: Joi.number().min(8).positive(),
  }).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
};

export const update = {
  body: Joi.object({
    firstName: generalFields.name,
    lastName: generalFields.name,
    email: generalFields.email,
    phone: generalFields.phone,
    age: Joi.number().min(8).positive(),
  }).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
};

export const login = {
  body: Joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  }).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
};

export const forgetPassword = {
  body: Joi.object({
    email: generalFields.email.required(),
    newPassword: generalFields.password.required(),
    code: Joi.string().required(),
  }).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
};

export const forgetPasswordMail = {
  body: Joi.object({
    email: generalFields.email.required(),
  }).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
};

export const updatePassword = {
  body: Joi.object({
    newPassword: generalFields.password.required(),
  }).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
};

export const confirmEmail = {
  body: Joi.object({
    email: generalFields.email.required(),
    code: Joi.string().required(),
  }).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
};

export const addProfilePhoto = {
  body: Joi.object({}).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
  file: generalFields.file.required(),
};

export const addCoverPhoto = {
  body: Joi.object({}).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
  files: Joi.array().items(generalFields.file).required(),
};

export const refreshToken = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }).required(),
  params: Joi.object({}).required(),
  query: Joi.object({}).required(),
};
