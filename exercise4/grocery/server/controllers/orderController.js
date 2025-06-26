import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Counter } from "../models/Counter.js";

//למספר הזמנה
const getNextSeq = async (seqName) => {
  const newSeq = await Counter.findOneAndUpdate(
    { _id: seqName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, returnDocument: "after" }
  );
  return newSeq.seq;
};

export const createOrder = async (req, res) => {
  const { supplier, products } = req.validatedBody;
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ msg: "Only owner can create orders" });
    }
    const existSupplier = await User.findById(supplier);
    if (!existSupplier) {
      return res.status(404).json({ msg: "Supplier not found" });
    }
    if (existSupplier.role !== "supplier") {
      return res.status(400).json({ msg: "You can only order from supplier" });
    }
    const orderProducts = [];
    let totalPrice = 0;
    for (const p of products) {
      const { product: productId, quantity } = p;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ msg: `Product ${productId} not found` }); //אולי להחזיר את הID בשדה נפרד בגיסו כדי שבלקוח תהיה אפשרות לשלוף את שם המוצר מהרשימת מוצרים לפי ספק שכבר נשלפה מהשרת
        // אולי להוסיף בדיקה על כלל המוצרים ואז להחיזר רשימה של כל המוצרים שאינם קיימים במקום אחד אחד
      }
      if (product.supplier.toString() !== supplier) {
        return res.status(422).json({
          msg: `The supplier you choose doesn't have the product ${product.name}`,
        });
      }
      if (quantity < product.minQuantity) {
        return res.status(422).json({
          msg: `quantity for product ${product.name} must be at least ${product.minQuantity}`,
        });
      }
      orderProducts.push({ product: product._id, quantity });
      totalPrice += product.price * quantity;
    }
    const orderNumber = await getNextSeq("orderId");
    const order = await Order.create({
      supplier,
      products: orderProducts,
      orderNumber,
      totalPrice,
      status: "new",
    });
    res.status(201).json({ msg: "Order crated successfully" });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ msg: "Invalid id format for product or supplier" });
    }
    if (error.code === 11000) {
      return res.status(500).json({ msg: "Duplicate order number. try again" });
    }
    res.status(500).json({ msg: "server error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let orders;

    if (role === "owner") {
      orders = await Order.find()
        .populate("supplier", "userName companyName contactName phone")
        .populate({
          path: "products.product",
          select: "name price",
        });
    } else if (role == "supplier") {
      orders = await Order.find({ supplier: userId })
        .populate("supplier", "userName companyName contactName phone")
        .populate({
          path: "products.product",
          select: "name price",
        });
    } else return res.status(403).json({ msg: "Unauthorized role" });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ msg: "No orders found" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const userRole = req.user.role;
    const orderNumber = parseInt(req.params.orderNumber);
    const { status } = req.validatedBody;

    if (isNaN(orderNumber) || orderNumber <= 0) {
      return res.status(400).json({
        msg: "Invalid order number format",
      });
    }

    const allowedStatuses = ["new", "in progress", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({ msg: "order not found" });
    }

    if (userRole === "supplier") {
      if (status !== "in progress") {
        return res
          .status(403)
          .json({ msg: "You can only set status to 'in progress'" });
      }
      if (order.supplier.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ msg: "You can update only your own orders" });
      }
    } else if (userRole === "owner") {
      if (status !== "completed") {
        return res
          .status(403)
          .json({ msg: "You can only set status to 'completed'" });
      }
    } else {
      return res.status(403).json({ msg: "Undefined role" });
    }

    // עדכון סטטוס
    order.status = status;
    await order.save();
    res.json({ msg: `Order ${order.orderNumber} status updated successfully` });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ msg: "Invalid orderNumber" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};
