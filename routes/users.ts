import express from "express";
import { blockUser, createUser, getUser, getUserFriend, unblockUser, updateUserPassword, updateUsername, testing, getAllUsers } from "../controller";

const users = express.Router();

users.route('/').post(createUser);
users.route('/test').post(testing);
users.route('/').get(getAllUsers);
users.route('/:userId').get(getUser).post(updateUserPassword);
users.route('/update/:userId').post(updateUsername);
users.route('/block/:friendName').post(blockUser);
users.route('/unblock/:friendName').post(unblockUser);
users.route('/userfriend/:friendName').post(getUserFriend);

export default users;