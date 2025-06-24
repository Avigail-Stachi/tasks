import Joi from "joi";

const orderItemValidation = Joi.object({
  product: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const createOrderValidation = Joi.object({
  supplier: Joi.string().hex().length(24).required(),
  products: Joi.array().items(orderItemValidation).min(1).required(),
});

export const updateOrderStatusValidation = Joi.object({
  status: Joi.string().valid("new", "in progress", "completed").required(),
});
