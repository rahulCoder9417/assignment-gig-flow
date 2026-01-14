import { Router } from "express";
import {
  getGigs,
  createGig,
  changeGigInfo,
  searchGigs,
  myGigs,
  deleteGig,
  getGigById,
} from "../controllers/gigs.controller.js";  
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

router.get("/", verifyJWT, getGigs);
router.get("/getById/:id", verifyJWT, getGigById);
router.get("/search", verifyJWT, searchGigs);
router.get("/my", verifyJWT, myGigs);
router.post("/", verifyJWT, createGig);
router.patch("/:id", verifyJWT, changeGigInfo);
router.delete("/:id", verifyJWT, deleteGig);
;

export default router;
