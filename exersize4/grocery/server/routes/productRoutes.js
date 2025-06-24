import express from "express";
import {
  createProduct,
  getProducts,
  getProductBySupplier,
} from "../controllers/productController.js";
import {
  authenticateToken,
  authorizeSupplier,
} from "../middleware/auth.js";
import { createProductValidation } from "../middleware/validation/productValidation.js";
import { validate } from "../middleware/validation/validateBody.js";

const router = express.Router();

router.get('/',authenticateToken,getProducts);
router.get('/:userName',authenticateToken,getProductBySupplier)
router.post('/',authenticateToken,authorizeSupplier,validate(createProductValidation),createProduct)

export default router;
