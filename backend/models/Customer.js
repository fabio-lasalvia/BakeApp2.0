import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    phone: String,
    address: String,
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
}, { timestamps: true });

const Customer = mongoose.model("Customer", CustomerSchema)

export default Customer
