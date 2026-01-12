import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IGig extends Document {
  title: string;
  description: string;
  budget: number;
  ownerId: Types.ObjectId;
  status: "open" | "assigned";
}

const gigSchema = new Schema<IGig>(
  {
    title: {
      type: String, 
      required: true, 
      trim: true 
    },
    description: {
      type: String, 
      required: true, 
      trim: true 
    },
    budget: {
      type: Number, 
      required: true, 
      min: 0 
    },
    ownerId: {
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    status: {
      type: String, 
      enum: ["open", "assigned"], 
      default: "open", 
      index: true 
    },
  },
  { timestamps: true }
);

const Gig: Model<IGig> = mongoose.models.Gig || mongoose.model<IGig>("Gig", gigSchema);
export default Gig;
