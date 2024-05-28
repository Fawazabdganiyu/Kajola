import { Document, Types } from "mongoose";

export interface IChat extends Document {
  participants: Types.ObjectId[];
  messages: IMessage[];
  createdAt: Date;
}

interface UserPayload {
  id: string;
  iat: number;
  exp: number;
  buyerId: string;
  sellerId: string;
}
