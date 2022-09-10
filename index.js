import express from "express";
import cors from "cors";
import joi from "joi";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db("mywallet");
});

const signinSchema = joi.object({
  email: joi.string().trim().email().required(),
  password: joi.number().required(),
});

const signupSchema = joi.object({
  name: joi.string().trim().required(),
  email: joi.string().trim().email().required(),
  password: joi.number().required(),
  confirmPassword: joi.number().required(),
});

const newRecordSchema = joi.object({
  description: joi.string().trim().required(),
  value: joi.number().required(),
});
app.post("/", async (req, res) => {
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
  await db.collection("sessions").insertOne({ userId: isUserExists._id, token });

  res.send(token);
});

app.post("/sign-up", async (req, res) => {
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
});

app.get("/home", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  const session = await db.collection("sessions").findOne({ token });

  if (!session) {
    return res.status(401).send({ message: "O usuário não está logado" });
  }
  try {
    const userInfo = await db.collection("user").findOne({_id: session.userId})
    const historyUser = await db.collection("history").find({ userId: session.userId }).toArray();
    res.send(historyUser);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/deposit", async (req, res) => {
  const { description, value } = req.body;
  const { authorization } = req.headers;
  const validation = newRecordSchema.validate(req.body, { abortEarly: false });
  const token = authorization?.replace("Bearer ", "");
  if (!token) {
    return res.sendStatus(401);
  }

  const session = await db.collection("sessions").findOne({ token });

  if (!session) {
    return res.status(401).send({ message: "O usuário não está logado" });
  }

  if (validation.error) {
    return res.status(422).send({ message: validation.error.message });
  }

  db.collection("history").insertOne({
    date: dayjs().format("D/M"),
    description,
    value,
    userId: session.userId,
    type: "deposit",
  });
  res.sendStatus(201);
});

app.post("/withdraw", async (req, res) => {
  const { date, description, value } = req.body;
  const { authorization } = req.headers;
  const validation = newRecordSchema.validate(req.body, { abortEarly: false });
  const token = authorization?.replace("Bearer ", "");
  if (!token) {
    return res.sendStatus(401);
  }

  const session = await db.collection("sessions").findOne({ token });

  if (!session) {
    return res.status(401).send({ message: "O usuário não está logado" });
  }

  if (validation.error) {
    return res.status(422).send({ message: validation.error.message });
  }

  db.collection("history").insertOne({
    date: dayjs().format("D/M"),
    description,
    value,
    userId: session.userId,
    type: "withdraw",
  });
  res.sendStatus(201);
});

app.listen(5000, () => console.log("Listening on port 5000"));
