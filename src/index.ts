import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import usersRoute from "@/routes/users"

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());

app.use("/api/users", usersRoute)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});