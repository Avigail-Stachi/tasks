import Joi from "joi";

const orderItemValidation = Joi.object({
  product: Joi.string().trim().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const createOrderValidation = Joi.object({
  supplier: Joi.string().trim().hex().length(24).required(),
  products: Joi.array().items(orderItemValidation).min(1).required(),
});

export const updateOrderStatusValidation = Joi.object({
  status: Joi.string().trim().valid("new", "in progress", "completed").required(),
});
