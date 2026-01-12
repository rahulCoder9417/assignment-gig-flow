import { Router } from "express";
import {
  getOpenGigs,
  createGig,
  changeGigInfo,
  searchGigs,
  myGigs,
  deleteGig,
} from "../controllers/gigs.controller.js";  
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

router.get("/", getOpenGigs);
router.get("/search", searchGigs);
router.get("/my", verifyJWT, myGigs);
router.post("/", verifyJWT, createGig);
router.patch("/:id", verifyJWT, changeGigInfo);
router.delete("/:id", verifyJWT, deleteGig);
;

export default router;
