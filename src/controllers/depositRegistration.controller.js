
import db from "../database/db.js";
import dayjs from "dayjs";

async function registerDeposit(req, res) {
  const { description, value } = req.body;
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  if (!token) {
    return res.sendStatus(401);
  }

  const session = await db.collection("sessions").findOne({ token });

  if (!session) {
    return res.status(401).send({ message: "O usuário não está logado" });
  }

  db.collection("history").insertOne({
    date: dayjs().format("D/M"),
    description,
    value,
    userId: session.userId,
    type: "deposit",
  });
  res.sendStatus(201);
}

export { registerDeposit };
