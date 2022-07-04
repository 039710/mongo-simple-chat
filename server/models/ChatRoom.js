import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const CHAT_ROOM_TYPES = {
  PRIVATE: "PRIVATE",
  GROUP: "GROUP",
};

const chatRoomSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    name:{
      type: String,
      required: true,
    },
    userIds: {
      type: [String],
      default : []
    },
    type: String,
    chatInitiator: String,
    chatRoomId :{
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
    collection: "chatrooms",
  }
);

/**
 * @param {String} userId - id of user
 * @return {Array} array of all chatroom that the user belongs to
 */
chatRoomSchema.statics.getChatRoomsByUserId = async function (userId) {
  try {
    const rooms = await this.find({ userIds: { $all: [userId] } });
    return rooms;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
  try {
    const room = await this.findOne({ _id: roomId });
    return room;
  } catch (error) {
    throw error;
  }
}

chatRoomSchema.statics.getAllRoomsByUser = async function (userId) {
  try {
    let parents = await this.find({ userIds: { $all: [userId] }, chatRoomId: null });
    parents = parents.map(async (parent) => {
      // console.log(parent._doc.userIds.includes(userId))
      if (parent._doc.userIds.includes(userId)){
        parent = parent._doc
        let children = await this.find({ chatRoomId: parent._id, userIds: { $all: [userId] } });
        parent.subRooms = children;
        return parent;
      }
    });
    let results = await Promise.allSettled(parents)
    results = results.map(result => result.value)
    return results;
  } catch (error) {
    throw error.message;
  }
}


/**
 * @param {Array} userIds - array of strings of userIds
 * @param {String} chatInitiator - user who initiated the chat
 * @param {CHAT_ROOM_TYPES} type
 */
chatRoomSchema.statics.initiateChat = async function (userIds, type, chatInitiator, chatRoomId,name) {
  try {
    const availableRoom = await this.findOne({
      name
    });
    if (availableRoom) {
      return {
        isNew: false,
        message: 'retrieving an old chat room, room already exist',
        chatRoomId: availableRoom._doc._id,
        type: availableRoom._doc.type,
      };
    }
    // if its recursive room with chatRoomId
    let newRoom = null;
    if(chatRoomId){
      const parentRoom = await this.findOne({
        id : chatRoomId,
      })
      
      if(!parentRoom) throw new Error('parent room not found')
      console.log({ userIds, type, chatInitiator, chatRoomId, name })
      newRoom = await this.create({ userIds , type, chatInitiator, chatRoomId,name });    
    }else{
      // check if its belongs to other rooms
      newRoom = await this.create({ userIds , type, chatInitiator, chatRoomId : null,name });
    }

    return {
      isNew: true,
      message: 'creating a new chatroom',
      chatRoomId: newRoom._doc._id,
      type: newRoom._doc.type,
    };
  } catch (error) {
    console.log('error on start chat method', error);
    throw error;
  }
}

export default mongoose.model("ChatRoom", chatRoomSchema);