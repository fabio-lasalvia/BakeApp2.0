import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: String,
    contact: String,
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
}, { timestamps: true });

const Supplier = mongoose.model("Supplier", SupplierSchema)

export default Supplier
