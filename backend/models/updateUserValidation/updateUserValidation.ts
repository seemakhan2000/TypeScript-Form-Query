import Joi from "joi";

export const updateUserValidation = Joi.object({
  username: Joi.string().min(5).max(30).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]+$/)
    .optional()
    .length(10),
  password: Joi.string().min(6).optional(),
});
