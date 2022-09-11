import express from "express";
import cors from "cors";
import { signIn } from "./controllers/sign-in.controller.js";
import { signUp } from "./controllers/sign-up.controller.js";
import { showHistory } from "./controllers/home.controller.js";
import { registerDeposit } from "./controllers/depositRegistration.controller.js";
import { registerWithdraw } from "./controllers/withdrawRegistration.controller.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/", signIn);

app.post("/sign-up", signUp);

app.get("/home", showHistory);

app.post("/deposit", registerDeposit);

app.post("/withdraw", registerWithdraw);

app.listen(5000, () => console.log("Listening on port 5000"));
