import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    department: { type: String, enum: ["PRODUCTION", "ADMINISTRATION", "LOGISTICS"], required: true },
    handledOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
}, { timestamps: true });


const Employee = mongoose.model("Employee", EmployeeSchema)

export default Employee
