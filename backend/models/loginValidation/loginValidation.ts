import Joi from "joi";

export const loginValidation = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .optional(),
  password: Joi.string().min(6).required(),
  consent: Joi.boolean().optional(),
});
