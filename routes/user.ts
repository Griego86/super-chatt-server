import express from "express";
import {validateUser, decryptToken} from "../controller";

const user = express.Router();

user.route('/login').post(validateUser);
user.route('/validation').post(decryptToken);

export default user;