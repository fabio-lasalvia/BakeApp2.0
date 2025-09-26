import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Employee from "../models/Employee.js";
import { createError } from "../helpers/error.js";

//////////////////////////////////
///// GET - TUTTE LE FATTURE /////
//////////////////////////////////
export async function index(request, response, next) {
    try {
        const invoices = await Invoice.find()
            .populate("customer", "name")
            .populate("employee", "name department")
            .populate("order", "products status")
            .sort({ createdAt: -1 });
        return response.status(200).json(invoices);
    } catch (error) {
        next(error);
    }
}

/////////////////////////////////
///// GET - SINGOLA FATTURA /////
/////////////////////////////////
export async function show(request, response, next) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "ID fattura non valido"));
        }

        const invoice = await Invoice.findById(id)
            .populate("customer", "name")
            .populate("employee", "name department")
            .populate("order", "products status");

        if (!invoice) {
            return next(createError(404, "Fattura non trovata"));
        }

        return response.status(200).json(invoice);
    } catch (error) {
        next(error);
    }
}

//////////////////////////////////
///// POST - SINGOLA FATTURA /////
//////////////////////////////////
export async function create(request, response, next) {
    try {
        const { customerId, orderId, employeeId } = request.body;

        if (!customerId || !orderId || !employeeId) {
            return next(createError(400, "Campi obbligatori mancanti"));
        }

        if (
            !mongoose.Types.ObjectId.isValid(customerId) ||
            !mongoose.Types.ObjectId.isValid(orderId) ||
            !mongoose.Types.ObjectId.isValid(employeeId)
        ) {
            return next(createError(400, "ID non validi"));
        }

        const customer = await Customer.findById(customerId);
        const employee = await Employee.findById(employeeId);
        const order = await Order.findById(orderId);

        if (!customer || !employee || !order) {
            return next(createError(404, "Cliente, dipendente o ordine non trovato"));
        }

        const total = order.products.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
        );

        // Generazione semplice numero fattura
        const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
        const lastNumber = lastInvoice
            ? parseInt(lastInvoice.number.split("-")[2])
            : 0;
        const invoiceNumber = `INV-${new Date().getFullYear()}-${(lastNumber + 1)
            .toString()
            .padStart(3, "0")}`;

        const newInvoice = new Invoice({
            customer: customer._id,
            employee: employee._id,
            order: order._id,
            number: invoiceNumber,
            total,
        });

        const savedInvoice = await newInvoice.save();
        return response.status(201).json({
            message: "Fattura creata con successo",
            invoice: savedInvoice,
        });
    } catch (error) {
        next(error);
    }
}

/////////////////////////////////
///// PUT - SINGOLA FATTURA /////
/////////////////////////////////
export async function update(request, response, next) {
    try {
        const { id } = request.params;
        const { customerId, orderId, employeeId, total } = request.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "ID fattura non valido"));
        }

        const updatedData = {};

        if (customerId) {
            if (!mongoose.Types.ObjectId.isValid(customerId))
                return next(createError(400, "ID cliente non valido"));
            updatedData.customer = customerId;
        }
        if (employeeId) {
            if (!mongoose.Types.ObjectId.isValid(employeeId))
                return next(createError(400, "ID dipendente non valido"));
            updatedData.employee = employeeId;
        }
        if (orderId) {
            if (!mongoose.Types.ObjectId.isValid(orderId))
                return next(createError(400, "ID ordine non valido"));
            updatedData.order = orderId;
        }
        if (total !== undefined) updatedData.total = total;

        const updatedInvoice = await Invoice.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!updatedInvoice) {
            return next(createError(404, "Fattura non trovata"));
        }

        return response.status(200).json({
            message: "Fattura aggiornata con successo",
            invoice: updatedInvoice,
        });
    } catch (error) {
        next(error);
    }
}

////////////////////////////////////
///// REMOVE - SINGOLA FATTURA /////
////////////////////////////////////
export async function remove(request, response, next) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "ID fattura non valido"));
        }

        const deletedInvoice = await Invoice.findByIdAndDelete(id);
        if (!deletedInvoice) {
            return next(createError(404, "Fattura non trovata"));
        }

        return response.status(200).json({
            message: "Fattura eliminata con successo",
            invoice: deletedInvoice,
        });
    } catch (error) {
        next(error);
    }
}
