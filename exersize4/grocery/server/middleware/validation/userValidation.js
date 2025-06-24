import Joi from "joi";

export const registerUserValidation = Joi.object({
  userName: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).max(30).required(),
  role: Joi.string().valid("owner", "supplier").required(),
  companyName: Joi.string().min(2).max(30).when("role", {
    is: "supplier",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  phone: Joi.string()
    .pattern(/^0\d{8,9}$/)
    .when("role", {
      is: "supplier",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  contactName: Joi.string().min(2).max(30).when("role", {
    is: "supplier",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});
export const loginValidation = Joi.object({
  userName: Joi.string().min(2).max(30).required(),
  password: Joi.string().min(6).max(30).required(),
});
