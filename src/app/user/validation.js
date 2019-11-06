import Joi from "@hapi/joi";

// USE THE PACKEAGE JOI FOR VALIDATION
// Register Validation

const registerValidation = data => {
  const schema = Joi.object({
    firstname: Joi.string()
      .min(6)
      .required(),
    lastname: Joi.string()
      .min(1)
      .required(),
    email: Joi.string()
      .min(6)
      .required()
      .email(),
    phoneNumber: Joi.string()
      .min(6)
      .required(),
    password: Joi.string()
      .min(6)
      .required()
  });

  return schema.validate(data);
};

// Login Validation
const loginValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
      .min(6)
      .required()
      .email(),
    password: Joi.string()
      .min(6)
      .required()
  });

  return schema.validate(data);
};

export { registerValidation, loginValidation };
