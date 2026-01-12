import { Router } from "express";
import {
  createBid,
  getBidsForGig,
  getMyBids,
  acceptBid,
} from "../controllers/bids.controller.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

router.post("/", verifyJWT, createBid);

router.get("/:gigId", verifyJWT, getBidsForGig);

router.get("/my", verifyJWT, getMyBids);
router.patch("/:bidId/hire", verifyJWT, acceptBid);

export default router;
