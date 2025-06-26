import Joi from "joi";

export const createProductValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(30)
    .pattern(/^[A-Za-z][A-Za-z0-9 .\-]*$/)
    .required()
    .messages({
      "string.pattern.base":
        "Product name must start with a letter and contain only letters, numbers, spaces, dots, or hyphens",
    }),
  price: Joi.number().min(0).required(),
  minQuantity: Joi.number().integer().min(0).required(),
});
