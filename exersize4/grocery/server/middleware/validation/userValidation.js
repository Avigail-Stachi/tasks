import Joi from "joi";

const userNameP = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const passwordP =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/;
const companyNameP = /^[A-Za-z][A-Za-z0-9 &’'.\-]*[A-Za-z0-9]$/;
const phoneP = /^0\d{8,9}$/;
const contactNameP = /^[A-Za-z\u0590-\u05FF][A-Za-z\u0590-\u05FF '-]*$/;

export const registerUserValidation = Joi.object({
  userName: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(userNameP)
    .required()
    .messages({
      "string.pattern.base":
        "Username must start with a letter and contain only letters, numbers, underscores, or hyphens",
    }),
  password: Joi.string()
    .trim()
    .min(8)
    .max(30)
    .pattern(passwordP)
    .required()
    .messages({
      "string.pattern.base":
        "password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
    }),
  role: Joi.string().trim().valid("owner", "supplier").required(),
  companyName: Joi.string()
    .trim()
    .min(2)
    .max(30)
    .pattern(companyNameP)
    .when("role", {
      is: "supplier",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "string.pattern.base":
        "Company name must start with a letter and can contain letters, numbers, spaces and common punctuation",
    }),
  phone: Joi.string()
    .trim()
    .pattern(phoneP)
    .when("role", {
      is: "supplier",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "string.pattern.base":
        "Phone must be a valid Israeli number starting with 0",
    }),
  contactName: Joi.string()
    .trim()
    .min(2)
    .max(30)
    .when("role", {
      is: "supplier",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "string.pattern.base":
        "Contact name must contain only valid Hebrew or Latin letters and some punctuation",
    }),
});
export const loginValidation = Joi.object({
  userName: Joi.string().trim().min(2).max(30).required(),
  password: Joi.string().trim().min(6).max(30).required(),
});
