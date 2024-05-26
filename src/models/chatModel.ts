import { Schema, model } from 'mongoose';
import { IChat } from '../types';

const chatSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [
    {
      sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const Chat = model<IChat>('Chat', chatSchema);

export default Chat;
