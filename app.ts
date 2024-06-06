import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import users from './routes/users';

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

app.use(cors())
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Welcome!");
});

app.use("/api/v1/users", users);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

