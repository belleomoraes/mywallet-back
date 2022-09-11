import joi from "joi";

const signinSchema = joi.object({
  email: joi.string().trim().email().required(),
  password: joi.number().required(),
});
function validateSignInSchema(req, res, next) {
  const validation = signinSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    return res.status(422).send({ message: validation.error.message });
  }
  next();
}

export default validateSignInSchema;
