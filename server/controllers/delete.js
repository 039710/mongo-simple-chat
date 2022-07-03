import ChatRoomModel from '../models/ChatRoom.js';
import ChatMessageModel from '../models/ChatMessage.js';

export default {
  deleteRoomById: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRoomModel.findOne({ _id: roomId });
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }
      const isHasChild = room.chatRoomId == null? true: false
      console.log(room, isHasChild)
      // remove room with associated sub rooms
      if (!isHasChild) {
        // remove
        await ChatRoomModel.deleteOne({ _id: roomId });
        await ChatMessageModel.deleteMany({ chatRoomId: roomId });
      }else{
        const toDeleteRooms = await ChatRoomModel.find({ chatRoomId: roomId });
        await ChatRoomModel.deleteMany({ chatRoomId: roomId });
        await ChatMessageModel.deleteMany({ chatRoomId: { $in: toDeleteRooms.map(room => room._id) } });
        await ChatRoomModel.deleteOne({ _id: roomId });
        await ChatMessageModel.deleteMany({ chatRoomId: roomId });
      }
      return res.status(200).json({
        success: true,
        message: "Operation performed succesfully",
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message })
    }
  },
  deleteMessageById: async (req, res) => {
    try {
      const { messageId } = req.params;
      const message = await ChatMessageModel.remove({ _id: messageId });
      return res.status(200).json({
        success: true,
        deletedMessagesCount: message.deletedCount,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message })
    }
  },
}