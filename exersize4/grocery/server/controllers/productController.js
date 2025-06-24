import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

//הוספת מוצר לספק
export const createProduct = async (req, res) => {
  const { name, price, minQuantity } = req.validatedBody;
  const supplierId = req.user._id;

  try {
    if (req.user.role !== "supplier") {
      return res.status(403).json({ msg: "only suppliers can add products" });
    }
    const productExists = await Product.findOne({ name, supplier: supplierId });
    if (productExists) {
      return res
        .status(409)
        .json({ msg: "you already have a product with this name" });
    }
    const product = await Product.create({
      supplier: supplierId,
      name,
      price,
      minQuantity,
    });
    res.status(201).json({msg:`product ${product.name} created successfully`});
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error" });
  }
};
