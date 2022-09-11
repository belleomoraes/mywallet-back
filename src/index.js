import express from "express";
import cors from "cors";
import signinRouter from "./routers/signin.routers.js";
import signupRouter from "./routers/signup.routers.js";
import historyRouter from "./routers/history.routers.js";
import depositRouter from "./routers/deposit.routers.js";
import withdrawRouter from "./routers/withdraw.routers.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(signinRouter, signupRouter, historyRouter, depositRouter, withdrawRouter);

app.listen(5000, () => console.log("Listening on port 5000"));
