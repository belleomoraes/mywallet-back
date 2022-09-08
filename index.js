import express from "express";
import cors from "cors";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
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
    res.sendStatus(422);
    return;
  }

  if (!isUserExists) {
    res.sendStatus(404);
    return;
  }
  //comparar a criptação
  res.sendStatus(200);
});

app.post("/sign-up", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const validation = signupSchema.validate(req.body, { abortEarly: false });
  const isEmailExists = await db.collection("user").findOne({ email });

  if (validation.error) {
    res.sendStatus(422);
    return;
  }

  if (isEmailExists) {
    res.sendStatus(400);
    return;
  }

  if (password !== confirmPassword) {
    res.sendStatus(400);
    return;
  }

  try {
    db.collection("user").insertOne({ name, email, password }); //n esquecer de criptografar password
    res.sendStatus(201);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

app.get("/home", async (req, res) => {
  const userId = req.headers.user;
  try {
    const historyUser = await db.collection("history").find({ userId }).toArray();
    res.send(historyUser);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

app.post("/deposit", async (req, res) => {
  const { date, description, value } = req.body;
  const userId = req.headers.user;
  const validation = newRecordSchema.validate(req.body, { abortEarly: false });
  const isUserExists = await db.collection("user").findOne({ _id: ObjectId(userId) });

  if (validation.error) {
    res.sendStatus(422);
    return;
  }

  if (!isUserExists) {
    res.sendStatus(404);
    return;
  }

  db.collection("history").insertOne({ date, description, value, userId: userId, type: "deposit" });
  res.sendStatus(201);
});

app.post("/withdraw", async (req, res) => {
  const { date, description, value } = req.body;
  const userId = req.headers.user;
  const validation = newRecordSchema.validate(req.body, { abortEarly: false });
  const isUserExists = await db.collection("user").findOne({ _id: ObjectId(userId) });

  if (validation.error) {
    res.sendStatus(422);
    return;
  }

  if (!isUserExists) {
    res.sendStatus(404);
    return;
  }

  db.collection("history").insertOne({
    date,
    description,
    value,
    userId: userId,
    type: "withdraw",
  });
  res.sendStatus(201);
});

app.listen(5000, () => console.log("Listening on port 5000"));
