import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import usersRoute from "@/routes/users"
import loginRoute from "@/routes/login";
import logoutRoute from "@/routes/logout";
import sessionRoute from "@/routes/session";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({
  origin: (process.env.TRUSTED_ORIGINS ?? "*").split(",").map(origin => origin.trim()),
  credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.disable('x-powered-by');

app.use("/api/users", usersRoute);
app.use("/api/login", loginRoute);
app.use("/api/logout", logoutRoute);
app.use("/api/current-user", sessionRoute);

app.get("/", (req, res) => {
  console.log(req.cookies)
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});