import { Request, Response } from "express";
import Gig from "../models/gig.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
export const getOpenGigs = async (req: Request, res: Response) => {
  try {
  
    const gigs = await Gig.find({
      status: "open"
    }).sort({ createdAt: -1 });
    return  new ApiResponse(200, gigs, "Gigs fetched successfully");
  } catch (e) {
    throw new ApiError(500, "Failed to fetch gigs");
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
    return new ApiResponse(201, gig, "Gig created successfully");
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

    return new ApiResponse(200, gig, "Gig updated successfully");
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

    return new ApiResponse(200, gigs, "Gigs fetched successfully");
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
    return new ApiResponse(200, gig, "Gig deleted successfully");
  } catch (error) {
    throw new ApiError(500, "Failed to delete gig");
  }
};

export const myGigs = async (req: Request, res: Response) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user?._id }).sort({ createdAt: -1 });
    return new ApiResponse(200, gigs, "Gigs fetched successfully");
  } catch (error) {
    throw new ApiError(500, "Failed to fetch gigs");
  }
};