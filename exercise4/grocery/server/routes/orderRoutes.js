import express from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import {
  authenticateToken,
  authorizeOwner,
  authorizeOwnerOrSupplier,
} from "../middleware/auth.js";
import {
  createOrderValidation,
  updateOrderStatusValidation,
} from "../middleware/validation/orderValidation.js";
import { validate } from "../middleware/validation/validateBody.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeOwner,
  validate(createOrderValidation),
  createOrder
);
router.get("/", authenticateToken, getOrders);
router.put(
  "/:orderNumber/status",
  authenticateToken,
  authorizeOwnerOrSupplier,
  validate(updateOrderStatusValidation),
  updateOrderStatus
);

export default router;
