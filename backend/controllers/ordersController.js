import mongoose from "mongoose";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import { createError } from "../helpers/error.js";

//////////////////////////////////
///// GET - TUTTI GLI ORDINI /////
//////////////////////////////////
export async function index(request, response, next) {
    try {
        const orders = await Order.find()
            .populate("customer", "name email phone")
            .populate("products", "name price type");
        return response.status(200).json(orders);
    } catch (error) {
        next(error);
    }
}

////////////////////////////////
///// GET - SINGOLO ORDINE /////
////////////////////////////////
export async function show(request, response, next) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "Invalid order ID"));
        }

        const order = await Order.findById(id)
            .populate("customer", "name email phone")
            .populate("products", "name price type");

        if (!order) {
            return next(createError(404, "Order not found"));
        }

        return response.status(200).json(order);
    } catch (error) {
        next(error);
    }
}

/////////////////////////////////
///// CREATE - NUOVO ORDINE /////
/////////////////////////////////
export async function create(request, response, next) {
    try {
        const { customerId, products } = request.body;

        if (!customerId || !Array.isArray(products) || products.length === 0) {
            return next(createError(400, "Missing customerId or products"));
        }

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return next(createError(400, "Invalid customer ID"));
        }

        // Verifica che il cliente esista
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return next(createError(404, "Customer not found"));
        }

        // Verifica che tutti i prodotti esistano
        for (const productId of products) {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return next(createError(400, `Invalid product ID: ${productId}`));
            }
            const productExists = await Product.findById(productId);
            if (!productExists) {
                return next(createError(404, `Product not found: ${productId}`));
            }
        }

        const newOrder = new Order({
            customer: customerId,
            products,
            status: "PENDING",
            createdAt: new Date(),
        });

        const savedOrder = await newOrder.save();
        const populatedOrder = await savedOrder
            .populate("customer", "name email phone")
            .populate("products", "name price type");

        return response.status(201).json(populatedOrder);
    } catch (error) {
        next(error);
    }
}

///////////////////////////////////
///// UPDATE - SINGOLO ORDINE /////
///////////////////////////////////
export async function update(request, response, next) {
    try {
        const { id } = request.params;
        const { status, products } = request.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "Invalid order ID"));
        }

        const order = await Order.findById(id);
        if (!order) {
            return next(createError(404, "Order not found"));
        }

        order.status = status ?? order.status;

        // Se vengono aggiornati i prodotti
        if (Array.isArray(products) && products.length > 0) {
            for (const productId of products) {
                if (!mongoose.Types.ObjectId.isValid(productId)) {
                    return next(createError(400, `Invalid product ID: ${productId}`));
                }
                const productExists = await Product.findById(productId);
                if (!productExists) {
                    return next(createError(404, `Product not found: ${productId}`));
                }
            }
            order.products = products;
        }

        const updatedOrder = await order.save();
        const populatedOrder = await updatedOrder
            .populate("customer", "name email phone")
            .populate("products", "name price type");

        return response.status(200).json(populatedOrder);
    } catch (error) {
        next(error);
    }
}

///////////////////////////////////
///// DELETE - SINGOLO ORDINE /////
///////////////////////////////////
export async function remove(request, response, next) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "Invalid order ID"));
        }

        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
            return next(createError(404, "Order not found"));
        }

        return response.status(200).json({
            message: "Order successfully deleted",
            order: deletedOrder,
        });
    } catch (error) {
        next(error);
    }
}
