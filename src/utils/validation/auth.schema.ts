import Joi from "joi";

// Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(30).alphanum().messages({
    "string.alphanum": "Username must contain only letters and numbers.",
  }),

  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      "string.email": "Email must be a valid email address format.",
    }),

  password: Joi.string().required().min(8).pattern(passwordRegex).messages({
    "string.min": "Password must be at least 8 characters long.",
    "string.pattern.base":
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } }),
  password: Joi.string().required(),
});
