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

export async function decryptToken(req: Request, res: Response) {
  try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
          res.status(403).send("Header does not exist");
          return "";
      }
      const token = authHeader.split(" ")[1];
      const decodedUser = jwt.verify(token, "default_secret");
      //@ts-ignore
      const response = await db.select().from(users).where(eq(users.user_id, decodedUser.id));
      const user = response[0]
      res.json({ result: { user, token } });
  }
  catch (err) {
      res.status(401).json({ err });
  }
}

export async function searchUserById(id: number) {
  try {
      const result = await db.select().from(users).where(eq(users.user_id, id));
      if (result.length === 0) {
          return null;
      }
      const user = result;
      return user;
  } catch (error) {
      console.error('Error executing query:', error);
      // throw new Error('Error searching user by ID');
  }
}

export async function createUser(req: Request, res: Response) {
  const { username, password, email } = req.body
  if (username.length > 32) {
      return res.json({ success: false, message: "Username max char limit is 32" });
  }
  if (password.length > 80) {
      return res.json({ success: false, message: "password max char limit is 80" });
  }
  if (email.length > 255) {
      return res.json({ success: false, message: "email max char limit is 255" });
  }
  try {
      const usernameQuery = await db.select().from(users).where(eq(users.username, username))
      if (usernameQuery.length > 0) {
          return res.json({ success: false, message: "Username already exists" });
      };
      const emailQuery = await db.select().from(users).where(eq(users.email, email))
      if (emailQuery.length > 0) {
          return res.json({ success: false, message: "An account associated with this email already exists" });
      };
      const encrypted = await bcrypt.hash(password, saltRounds);
      const displayName = username;
      const now = new Date();
      const timestamp = now.toISOString();
      await db.insert(users).values({ username, password: encrypted.toString(), email, display_name: displayName, created_at: timestamp });
      res.status(201).send({ success: true, message: "Sign up successful!" })
  }
  catch (err) {
      console.log(err)
      res.status(400).json({ success: false, message: "Error creating user" })
  }
};

export async function getUser(req: Request, res: Response) {
    try {
        const userId = req.params.userId
        //@ts-ignore
        const user = await db.select().from(users).where(eq(users.user_id, userId));
        res.status(200).json(user[0]);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: "Error getting user" })
    }
}

export async function getUsersInChat(req: Request, res: Response) {
    try {
        const chatId = req.params.chatId
        //@ts-ignore
        const usersQuery = await db.select(users).from(user_chats).innerJoin(users, eq(user_chats.user_id, users.user_id)).where(eq(user_chats.chat_id, parseInt(chatId)))
        res.status(200).json(usersQuery);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: "Error getting users in chat" })
    }
}

export async function updateUserPassword(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.userId);
        const incomingUser = await req.body;
        const incomingPassword = incomingUser.password;
        const encrypted = await bcrypt.hash(incomingPassword, saltRounds);
        await db.update(users).set({ password: encrypted.toString() }).where(eq(users.user_id, userId));
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error updating password" });
    }
}

export async function updateUsername(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.userId);
        const incomingUsername = await req.body.username;
        await db.update(users).set({ username: incomingUsername.toString() }).where(eq(users.user_id, userId));
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error updating username" });
    }
}

export async function blockUser(req: Request, res: Response) {
    try {
        const userId = req.body.userId;
        const friendName = req.params.friendName;
        const friend = await db.select().from(users).where(eq(users.username, friendName));
        await db.update(user_friends).set({ blocked: true }).where(and(eq(user_friends.user_id, userId), eq(user_friends.friend_id, friend[0].user_id)));
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error blocking user" });
    }
}

export async function unblockUser(req: Request, res: Response) {
    try {
        const userId = req.body.userId;
        const friendName = req.params.friendName;
        const friend = await db.select().from(users).where(eq(users.username, friendName));
        await db.update(user_friends).set({ blocked: false }).where(and(eq(user_friends.user_id, userId), eq(user_friends.friend_id, friend[0].user_id)));
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error blocking user" });
    }
}

export async function getUserFriend(req: Request, res: Response) {
    try {
        const userId = req.body.userId;
        const friendName = req.params.friendName;
        const friend = await db.select().from(users).where(eq(users.username, friendName));
        const response = await db.select().from(user_friends).where(and(eq(user_friends.user_id, parseInt(userId)), eq(user_friends.friend_id, friend[0].user_id)));
        const userFriend = response[0]
        res.status(200).json(userFriend);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error getting user friend" });
    }
}

export async function addFriend(req: Request, res: Response) {
    try {
        const { friend, username } = req.body;
        if (username === friend) {
            return res.json({ success: false, message: "That's yourself!" });
        }
        const friendResult = await db.select().from(users).where(eq(users.username, friend));
        if (friendResult.length === 0) {
            return res.json({ success: false, message: "User does not exist" });
        }
        const friendId = friendResult[0].user_id;
        const userResult = await db.select().from(users).where(eq(users.username, username));
        const userId = userResult[0].user_id;
        const friendshipResult = await db.select().from(user_friends).where(and(eq(user_friends.user_id, userId), eq(user_friends.friend_id, friendId)));
        if (friendshipResult.length > 0) {
            return res.json({ success: false, message: "User is already your friend!" });
        }
        const now = new Date();
        const timestamp = now.toISOString();
        await db.insert(user_friends).values({ user_id: userId, friend_id: friendId, display_name: friend, created_at: timestamp });
        await db.insert(user_friends).values({ user_id: friendId, friend_id: userId, display_name: username, created_at: timestamp });
        res.status(201).send({ success: true, message: "User Friend created successfully" });
    } catch (error) {
        console.error("Error adding friend:", error);
        res.status(500).send("Internal Server Error");
    }
}

export async function getFriends(req: Request, res: Response) {
    try {
        const userId = req.params.userId;
        //@ts-ignore
        const friendsQuery = await db.select(users).from(user_friends).innerJoin(users, eq(user_friends.friend_id, users.user_id)).where(eq(user_friends.user_id, userId))
        const friends = friendsQuery;
        res.status(200).json(friends);
    } catch (error) {
        console.error("Error getting friends:", error);
        res.status(500).json({ success: false, message: "Error getting friends" });
    }
}