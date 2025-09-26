import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    number: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    total: { type: Number, required: true },
    status: { type: String, enum: ["DRAFT", "SENT", "PAID", "CANCELLED"], default: "DRAFT" }
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", InvoiceSchema);

export default Invoice;
