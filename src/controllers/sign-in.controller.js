import joi from "joi";
import db from "../database/db.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

const signinSchema = joi.object({
  email: joi.string().trim().email().required(),
  password: joi.number().required(),
});

async function signIn(req, res) {
  const { email, password } = req.body;
  const validation = signinSchema.validate(req.body, { abortEarly: false });
  const isUserExists = await db.collection("user").findOne({ email });

  if (validation.error) {
    return res.status(422).send({ message: validation.error.message });
  }

  if (!isUserExists || !bcrypt.compareSync(password, isUserExists.password)) {
    return res.status(404).send({ message: "E-mail ou senha incorretos" });
  }

  const token = uuid();
  const username = isUserExists.name;

  await db.collection("sessions").insertOne({ userId: isUserExists._id, token });

  res.send({ token, username });
}

export { signIn };
