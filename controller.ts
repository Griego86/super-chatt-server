import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// import nodemailer from "nodemailer";
import { pool, db, users, user_friends, chats, user_chats, messages, comments } from "./connect";
import { eq, and } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

const saltRounds = 10;


export async function validateUser(req: Request, res: Response) {
  const { username, password } = req.body;
  try {
      const queryResult = await db.select().from(users).where(eq(users.username, username));
      const user = queryResult[0];
      if (!user) return res.json({ result: { user: null, token: null } });
      bcrypt.compare(password, user.password || "", function (err, result) {
          if (err) {
              console.error(err);
              return res.status(500).send("Internal Server Error");
          }
          if (result) {
              const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "14 days" });
              return res.json({ result: { user, token } });
          } else {
              return res.json({ result: { user: null, token: null } });
          }
      });
  }
  catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
  }
}