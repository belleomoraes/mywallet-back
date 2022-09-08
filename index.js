import express from "express";
import cors from "cors";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

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
  date: joi.date().required(), //confirmar o envio dessa data
  description: joi.string().trim().required(),
  value: joi.number().required(),
});
app.post("/", async (req, res) => {
  const { email, password } = req.body;
  const validation = signinSchema.validate(req.body, { abortEarly: false });
  const isUserExists = await db.collection("user").findOne({ email });

  if (validation.error) {
    return res.sendStatus(422);
  }

  if (!isUserExists || !bcrypt.compareSync(password, isUserExists.password)) {
    return res.sendStatus(404);
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
    return res.sendStatus(422);
  }

  if (isEmailExists) {
    return res.sendStatus(400);
  }

  if (password !== confirmPassword) {
    return res.sendStatus(400);
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    await db.collection("user").insertOne({ name, email, password: passwordHash });
    res.sendStatus(201);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
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
    return res.sendStatus(401);
  }
  try {
    const historyUser = await db.collection("history").find({ userId: session.userId }).toArray();

    res.send(historyUser);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

app.post("/deposit", async (req, res) => {
  const { date, description, value } = req.body;
  const { authorization } = req.headers;
  const validation = newRecordSchema.validate(req.body, { abortEarly: false });
  const token = authorization?.replace("Bearer ", "");
  if (!token) {
    return res.sendStatus(401);
  }

  const session = await db.collection("sessions").findOne({ token });

  if (!session) {
    return res.sendStatus(401);
  }

  if (validation.error) {
    return res.sendStatus(422);
  }

  
  db.collection("history").insertOne({
    date,
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
    return res.sendStatus(401);
  }

  if (validation.error) {
    return res.sendStatus(422);
  }

  db.collection("history").insertOne({
    date,
    description,
    value,
    userId: session.userId,
    type: "withdraw",
  });
  res.sendStatus(201);
});

app.listen(5000, () => console.log("Listening on port 5000"));
