import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    csvFile: {
      type: String,
      required: true
    },
    emailTemplate: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'queued', 'sending', 'completed', 'failed'],
      default: 'draft'
    },
    totalEmails: {
      type: Number,
      required: true
    },
    sentEmails: {
      type: Number,
      default: 0
    },
    emails:{
      type:string,
      deafult:[]
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Campaign', campaignSchema);