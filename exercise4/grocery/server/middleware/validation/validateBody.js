import { registerUserValidation, loginValidation } from "./userValidation.js";
import { createProductValidation } from "./productValidation.js";
import {
  createOrderValidation,
  updateOrderStatusValidation,
} from "./orderValidation.js";

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((detail) => {
      return {
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""),
        type: detail.type,
      };
    });
    return res.status(400).json({ msg: "Validation failed", errorMessage });
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
