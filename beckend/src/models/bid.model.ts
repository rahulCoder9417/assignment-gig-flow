import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBid extends Document {
  gigId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  message: string;
  price: number;
  status: "pending" | "hired" | "rejected";
}

const bidSchema = new Schema<IBid>(
  {
    gigId: { type: Schema.Types.ObjectId, ref: "Gig", required: true, index: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ["pending", "hired", "rejected"], default: "pending", index: true },
  },
  { timestamps: true }
);

bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true });

const Bid: Model<IBid> = mongoose.models.Bid || mongoose.model<IBid>("Bid", bidSchema);
export default Bid;
