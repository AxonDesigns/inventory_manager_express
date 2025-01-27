import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import usersRoute from "@/routes/users"
import userRolesRoute from "@/routes/user-roles";
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
app.use("/api/user-roles", userRolesRoute);
app.use("/api/auth/login", loginRoute);
app.use("/api/auth/logout", logoutRoute);
app.use("/api/auth/me", sessionRoute);

app.get("/", (req, res) => {
  res.send((/^(?=[a-zA-Z0-9@._%+-]{1,254}$)([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/).toString());
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});