import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,    
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },

    type: { type: String, enum: ["RAW", "FINISHED"], required: true },
    productionTime: {
    type: Number,
    default: 2, // giorni
    required: function () {
      return this.type === "FINISHED";
    }
  }  
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema)

export default Product
