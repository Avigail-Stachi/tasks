import express from "express";
import {
  registerUser,
  loginUser,
  createUser,
  refreshToken,
  logoutUser,
} from "../controllers/userController.js";
import {
  registerUserValidation,
  loginValidation,
} from "../middleware/validation/userValidation.js";
import { validate } from "../middleware/validation/validateBody.js";
import { authenticateToken, authorizeOwner } from "../middleware/auth.js";

const router = express.Router();

router.post("/registerUser", validate(registerUserValidation), registerUser);

router.post(
  "/create",
  authenticateToken,
  authorizeOwner,
  validate(registerUserValidation),
  createUser
);

router.post("/loginUser", validate(loginValidation), loginUser);

router.post("/refreshToken", refreshToken);
router.post("/logout", logoutUser);

export default router;
