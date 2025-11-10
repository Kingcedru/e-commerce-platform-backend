import Joi from "joi";

const name = Joi.string().required().min(3).max(100);
const description = Joi.string().required().min(10);
const price = Joi.number().required().precision(2).positive().strict();
const stock = Joi.number().integer().required().min(0).strict();
const category = Joi.string().required().min(1);

export const createProductSchema = Joi.object({
  name,
  description,
  price,
  stock,
  category,
});

export const updateProductSchema = Joi.object({
  name: name.optional(),
  description: description.optional(),
  price: price.optional(),
  stock: stock.optional(),
  category: category.optional(),
})
  .min(1)
  .messages({
    "object.min": "Request body must contain at least one field to update.",
  });
