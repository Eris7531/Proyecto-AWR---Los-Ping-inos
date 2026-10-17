import { Schema, model, Document, Types } from 'mongoose';


export interface IMessage extends Document {
  roomId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}


const messageSchema = new Schema<IMessage>({
  roomId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true, 
    index: true 
  },
  senderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true, 
    trim: true, //quita espacios en blanco al inicio y al final
    maxlength: 1000 
  }
}, {
  timestamps: true 
});

const Message = model<IMessage>('Message', messageSchema);

export default Message;import mongoose from "mongoose";
