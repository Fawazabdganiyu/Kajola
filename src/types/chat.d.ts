import { Document } from "mongoose";

export interface IChat extends Document {
  participants: string[];
  messages: IMessage[];
  createdAt: Date;
}

interface UserPayload {
  id: string;
  iat: number;
  exp: number;
}
