import { registerUserValidation, loginValidation } from "./userValidation.js";
import { createProductValidation } from "./productValidation.js";
import {
  createOrderValidation,
  updateOrderStatusValidation,
} from "./orderValidation.js";

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(" ,");
    return res.status(400).json({ msg: errorMessage });
  }
  req.validatedBody = value;
  next();
};
export {
  validate,
  registerUserValidation,
  loginValidation,
  createProductValidation,
  createOrderValidation,
  updateOrderStatusValidation,
};
