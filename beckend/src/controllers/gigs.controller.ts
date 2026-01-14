import { Request, Response } from "express";
import Gig from "../models/gig.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Bid from "../models/bid.model.js";
export const getGigs = async (req: Request, res: Response) => {
  try {
    const { status = "open", limit } = req.query;

    const pipeline: any[] = [
      { $match: { status } },
      { $sort: { createdAt: -1 } },

      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },

      {
        $lookup: {
          from: "bids",
          localField: "_id",
          foreignField: "gigId",
          as: "bids",
        },
      },

      {
        $addFields: {
          bidCount: { $size: "$bids" },
          ownerName: "$owner.name",
          ownerAvatar: "$owner.avatarUrl",
        },
      },

      {
        $project: {
          bids: 0,
          owner: 0,
          ownerId: 0,
        },
      },
    ];

    if (limit) pipeline.push({ $limit: Number(limit) });

    const gigs = await Gig.aggregate(pipeline);

    return res
      .status(200)
      .json(new ApiResponse(200, gigs, "Gigs fetched successfully"));
  } catch (e) {
    throw new ApiError(500, "Failed to fetch gigs");
  }
};



export const getGigById = async (req: Request, res: Response) => {
  try {
    const gig = await Gig.findById(req.params.id)
    .populate("ownerId", "name avatarUrl")
    if (!gig) {
      throw new ApiError(404, "Gig not found");
    }
    return res.status(200).json(new ApiResponse(200, gig, "Gig fetched successfully"));
  } catch (error) {

    throw new ApiError(500, "Failed to fetch gig");
  }
};


export const createGig = async (req: Request, res: Response) => {
  try {
    const { title, description, budget } = req.body;
    if (!title || !description || budget == null) {
      throw new ApiError(400, "title, description, budget required");
    }
    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user?._id,
      status: "open",
    });
    return res.status(201).json(new ApiResponse(201, gig, "Gig created successfully"));
  } catch (e) {
    throw new ApiError(500, "Failed to create gig");
  }
};

export const changeGigInfo = async (req: Request, res: Response) => {
  try {
    const { title, description, budget } = req.body;

    if (!title && !description && budget === undefined) {
      throw new ApiError(400, "At least one field (title, description, budget) is required");
    }

    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      throw new ApiError(404, "Gig not found");
    }

    if (gig.ownerId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, "Not authorized to update this gig");
    }

    if (title) gig.title = title;
    if (description) gig.description = description;
    if (budget !== undefined) gig.budget = budget;

    await gig.save();

    return res.status(200).json(new ApiResponse(200, gig, "Gig updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to update gig");
  }
};

export const searchGigs = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const query: any = { status: "open" };

    if (search) {
      query.title = {
        $regex: search,
        $options: "i", 
      };
    }

    const gigs = await Gig.find(query).sort({ createdAt: -1 });

    return  res.status(200).json(new ApiResponse(200, gigs, "Gigs fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch gigs");
  }
};

export const deleteGig = async (req: Request, res: Response) => {
  try {
    const gig = await Gig.findByIdAndDelete(req.params.id);
    if (!gig) {
      throw new ApiError(404, "Gig not found");
    }
    return res.status(200).json(new ApiResponse(200, gig, "Gig deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to delete gig");
  }
};

export const myGigs = async (req: Request, res: Response) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user?._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, gigs, "Gigs fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch gigs");
  }
};