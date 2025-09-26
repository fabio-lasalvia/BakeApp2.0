import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    price: Number
  }],
  status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED", "DELIVERED"], default: "PENDING" },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  deliveryDate: Date
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema)

export default Order
