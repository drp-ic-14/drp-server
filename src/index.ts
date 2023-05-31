import express from "express";
import prisma from "./prisma";
import dotenv from "dotenv";

dotenv.config();

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
