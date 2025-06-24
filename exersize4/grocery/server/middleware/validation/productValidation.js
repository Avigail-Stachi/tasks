import Joi from 'joi'

export const createProductValidation=Joi.object({
    name: Joi.string().min(2).max(30).required(),
    price: Joi.number().min(0).required(),
    minQuantity:Joi.number().integer().min(0).required(),
})