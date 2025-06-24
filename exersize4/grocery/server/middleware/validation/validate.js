import { registerUserValidation, loginValidation } from "./userValidation.js";
import { createProductValidation } from "./productValidation.js";
import {
  createOrderValidation,
  updateOrderStatusValidation,
} from "./orderValidation.js";

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(" ,");
    return res.status(400).json({ msg: errorMessage });
  }
  req.validatedBody = req.body;
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
