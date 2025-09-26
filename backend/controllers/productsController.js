import mongoose from "mongoose";
import Product from "../models/Product.js";
import { createError } from "../helpers/error.js";

//////////////////////////////////
///// GET - TUTTI I PRODOTTI /////
//////////////////////////////////
export async function index(request, response, next) {
    try {
        const products = await Product.find();
        return response.status(200).json(products);
    } catch (error) {
        next(error);
    }
}

//////////////////////////////////
///// GET - SINGOLO PRODOTTO /////
//////////////////////////////////
export async function show(request, response, next) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "Invalid product ID"));
        }

        const product = await Product.findById(id);
        if (!product) {
            return next(createError(404, "Product not found"));
        }

        return response.status(200).json(product);
    } catch (error) {
        next(error);
    }
}

/////////////////////////////////
///// POST - SINGOLO PRODOTTO ///
/////////////////////////////////
export async function create(request, response, next) {
    try {
        const { name, description, price, category, supplier, type, productionTime } = request.body;

        if (!name || !price || !type) {
            return next(createError(400, "Missing required fields: name, price or type"));
        }

        if (!["RAW", "FINISHED"].includes(type)) {
            return next(createError(400, "Invalid product type"));
        }

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            supplier,
            type,
            productionTime: type === "FINISHED" ? productionTime || 2 : undefined
        });

        const savedProduct = await newProduct.save();
        return response.status(201).json(savedProduct);
    } catch (error) {
        next(error);
    }
}

/////////////////////////////////////
///// UPDATE - SINGOLO PRODOTTO /////
/////////////////////////////////////
export async function update(request, response, next) {
    try {
        const { id } = request.params;
        const { name, description, price, category, supplier, type, productionTime } = request.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "Invalid product ID"));
        }

        const product = await Product.findById(id);
        if (!product) {
            return next(createError(404, "Product not found"));
        }

        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.category = category ?? product.category;
        product.supplier = supplier ?? product.supplier;
        product.type = type ?? product.type;
        if (product.type === "FINISHED") {
            product.productionTime = productionTime ?? product.productionTime ?? 2;
        } else {
            product.productionTime = undefined;
        }

        const updatedProduct = await product.save();
        return response.status(200).json(updatedProduct);
    } catch (error) {
        next(error);
    }
}

/////////////////////////////////////
///// DELETE - SINGOLO PRODOTTO /////
/////////////////////////////////////
export async function remove(request, response, next) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "Invalid product ID"));
        }

        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return next(createError(404, "Product not found"));
        }

        return response.status(200).json({ message: "Product successfully deleted", product: deletedProduct });
    } catch (error) {
        next(error);
    }
}
