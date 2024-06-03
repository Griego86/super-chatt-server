import express from "express";
import { createComment } from "../controller";

const comments = express.Router();

comments.route("/").post(createComment);

export default comments;