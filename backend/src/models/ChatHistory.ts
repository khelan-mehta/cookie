import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  query: string;
  severity: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatHistoryDocument extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema({
  query: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const chatHistorySchema = new Schema<ChatHistoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

chatHistorySchema.index({ userId: 1 });
chatHistorySchema.index({ 'messages.query': 'text' });

export const ChatHistory = mongoose.model<ChatHistoryDocument>('ChatHistory', chatHistorySchema);
