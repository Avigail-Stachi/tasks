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

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('supplier', 'userName companyName');
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
};

export const getProductBySupplier = async (req, res) => {
    const { userName } = req.params; 
    try {
        const supplierUser = await User.findOne({ userName });
        if (!supplierUser) {
            return res.status(404).json({ msg: "Supplier not found" });
        }
        const products = await Product.find({ supplier: supplierUser._id }).populate('supplier', 'userName companyName');
        if (!products || products.length === 0) {
            return res.status(404).json({ msg: `No products found for supplier ${userName}` });
        }
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
};
