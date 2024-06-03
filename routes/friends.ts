import express from "express";
const friends = express.Router();

import { addFriend, getFriends } from "../controller";

friends.route('/').post(addFriend);
friends.route('/:userId').get(getFriends);

export default friends;