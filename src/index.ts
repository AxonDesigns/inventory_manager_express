import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});