import joi from "joi";

const newRecordSchema = joi.object({
    description: joi.string().trim().required(),
    value: joi.number().required(),
  });

  function validatenewRecordSchema(req, res, next) {
    const validation = newRecordSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
      return res.status(422).send({ message: validation.error.message });
    }
    next();
  }
  
  export default validatenewRecordSchema;
  