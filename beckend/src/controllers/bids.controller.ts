import { Request, Response } from "express";
import mongoose from "mongoose";
import Bid from "../models/bid.model.js";
import Gig from "../models/gig.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getIO } from "../ws/ws.js";
export const createBid = async (req: Request, res: Response) => {
  try {
    const { gigId, message, price } = req.body;
    const freelancerId = req.user?._id;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      throw new ApiError(404, "Gig not found");
    }

    if (gig.status !== "open") {
      throw new ApiError(400, "Gig is not open for bidding");
    }
    if (gig.ownerId.toString() === freelancerId?.toString()) {
      throw new ApiError(403, "You cannot bid on your own gig");
    }

    const bid = await Bid.create({
      gigId,
      freelancerId,
      message,
      price,
    });

    return res.status(201).json(new ApiResponse(201, bid, "Bid submitted successfully"));
  } catch (err: any) {

    throw new ApiError(500, "Failed to submit bid");
  }
};  

export const getBidsForGig = async (req: Request, res: Response) => {
  try {
    const { gigId } = req.params;
    const userId = req.user?._id;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      throw new ApiError(404, "Gig not found");
    }


    const bids = await Bid.find({ gigId })
      .populate("freelancerId", "name _id avatarUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, bids, "Bids fetched successfully"));
  } catch (err) {
    throw new ApiError(500, "Failed to fetch bids");
  }
};
export const acceptBid = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const bidId = new mongoose.Types.ObjectId(req.params.bidId);
    const userId = req.user!._id;

    const bid = await Bid.findOne({
      _id: bidId,
      status: "pending",
    }).session(session);

    if (!bid) {
      throw new ApiError(404, "Bid not found or already processed");
    }
    const gig = await Gig.findOne({
      _id: bid.gigId,
      ownerId: userId,
      status: "open",
    }).session(session);

    if (!gig) {
      throw new ApiError(
        400,
        "Gig not found, not owned by you, or already assigned"
      );
    }
    bid.status = "hired";
    await bid.save({ session });

    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: bidId } },
      { status: "rejected" },
      { session }
    );

    gig.status = "assigned";
    await gig.save({ session });

    await session.commitTransaction();
    const io = getIO();
    io.to(bid.freelancerId.toString()).emit("hire-notification", {
      message: `You have been hired for "${gig.title}"`,
      gigId: gig._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, bid, "Bid accepted successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};



export const getMyBids = async (req: Request, res: Response) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user?._id })
  .populate({
    path: "gigId",
    populate: {
      path: "ownerId",
      select: "name _id avatarUrl", // choose what you need
    },
  })
  .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, bids, "Bids fetched successfully"));
  } catch (err) {
    throw new ApiError(500, "Failed to fetch bids");
  }
};