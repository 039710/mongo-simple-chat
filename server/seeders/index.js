import "../config/mongo.js";
import disconnect from "../config/mongo.js";
import UserModel from "../models/User.js";
import ChatRoomModel from "../models/ChatRoom.js";
import users from "./users/index.js";
import rooms from "./rooms/index.js";
(async () => {
  try {
    await UserModel.deleteMany({});
    await ChatRoomModel.deleteMany({});
    await UserModel.insertMany(users);
    await ChatRoomModel.insertMany(rooms);
    console.log("Successfully seeded database");
    disconnect();
  } catch (error) {
    console.log(error);
  }
}
)();