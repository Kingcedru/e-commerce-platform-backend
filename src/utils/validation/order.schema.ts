import Joi from "joi";

export const createOrderSchema = Joi.array()
  .items(
    Joi.object({
      productId: Joi.string().guid({ version: "uuidv4" }).required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  )
  .min(1)
  .required()
  .messages({ "array.min": "The order must contain at least one product." });
