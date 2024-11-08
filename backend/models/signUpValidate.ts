import Joi from "joi";

export const validateSignupData = (signup: {
  username: string;
  email: string;
  phone: number;
  password: string;
}) => {
  const SignupModel = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });

  return SignupModel.validate(signup);
};
