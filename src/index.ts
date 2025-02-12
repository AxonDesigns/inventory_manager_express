import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import usersRoute from "@/routes/users"
import userRolesRoute from "@/routes/user-roles";
import userStatusesRoute from "@/routes/user-statuses";
import authRoute from "@/routes/auth";
import authMiddleware from "@/middlewares/auth";

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

app.use("/api", authMiddleware);

app.use("/api/users", usersRoute);
app.use("/api/user-roles", userRolesRoute);
app.use("/api/user-statuses", userStatusesRoute);
app.use("/api/auth", authRoute);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});