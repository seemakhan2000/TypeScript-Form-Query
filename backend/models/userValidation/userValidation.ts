import Joi from "joi";

export const userValidation = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .length(10),
  password: Joi.string().min(6).required(),
});
