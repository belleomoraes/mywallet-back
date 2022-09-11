import joi from "joi";
import db from "../database/db.js";
import bcrypt from "bcrypt";

const signupSchema = joi.object({
  name: joi.string().trim().required(),
  email: joi.string().trim().email().required(),
  password: joi.number().required(),
  confirmPassword: joi.number().required(),
});

async function signUp(req, res) {
  const { name, email, password, confirmPassword } = req.body;
  const validation = signupSchema.validate(req.body, { abortEarly: false });
  const isEmailExists = await db.collection("user").findOne({ email });

  if (validation.error) {
    return res.status(422).send({ message: validation.error.message });
  }

  if (isEmailExists) {
    return res.status(409).send({ message: "Este e-mail já está cadastrado" });
  }

  if (password !== confirmPassword) {
    return res.status(400).send({ message: "A senha não confere" });
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    await db.collection("user").insertOne({ name, email, password: passwordHash });
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

export { signUp };
