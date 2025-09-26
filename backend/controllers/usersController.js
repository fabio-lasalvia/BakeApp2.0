import mongoose from "mongoose";

///// Import modelli /////
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Employee from "../models/Employee.js";
import Supplier from "../models/Supplier.js";

///// Import helpers /////
import { createError } from "../helpers/error.js";

//////////////////////////////////
///// GET - TUTTI GLI UTENTI /////
//////////////////////////////////
export async function index(request, response, next) {
    try {
        const users = await User.find().select("-password"); // per non esporre la password
        return response.status(200).json(users);
    } catch (error) {
        next(error);
    }
}

////////////////////////////////
///// GET - SINGOLO UTENTE /////
////////////////////////////////
export async function show(request, response, next) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "Invalid user ID"));
        }

        const user = await User.findById(id).select("-password");
        if (!user) {
            return next(createError(404, "User not found"));
        }

        return response.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

////////////////////////////////
///// POST - SINGOLO UTENTE /////
////////////////////////////////
export async function create(request, response, next) {
    try {
        const { email, password, role, name, phone, address, department, companyName, contact } = request.body;

        // Controllo del ruolo in base a chi crea l'utente
        if (request.user.role !== "ADMIN" && role !== "CUSTOMER") {
            return next(createError(403, "You are not allowed to create this type of account"));
        }

        const existing = await User.findOne({ email });
        if (existing) return next(createError(400, "Email already registered"));

        const newUser = new User({ email, password, role: role || "CUSTOMER" });
        await newUser.save();

        // Creazione profilo specifico
        if (role === "CUSTOMER" || !role) {
            // Cliente
            await Customer.create({ user: newUser._id, name, phone, address });            
        } else if (role === "EMPLOYEE") {
            // Impiegato
            await Employee.create({ user: newUser._id, name, department });            
        } else if (role === "SUPPLIER") {
            // Fornitore
            await Supplier.create({ user: newUser._id, companyName, contact });
        }

        return response.status(201).json({ message: "User created successfully", user: { id: newUser._id, email: newUser.email, role: newUser.role } });

    } catch (error) {
        next(error);
    }
}

////////////////////////////////
///// PUT - SINGOLO UTENTE /////
////////////////////////////////
export async function update(request, response, next) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "Invalid user ID"));
        }

        const { email, role, name, phone, address, department, companyName, contact } = request.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { email, role }, // aggiorno solo i campi diretti di User
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return next(createError(404, "User not found"));
        }

        // Aggiorno il profilo collegato al ruolo
        if (role === "CUSTOMER") {
            await Customer.findOneAndUpdate({ user: id }, { name, phone, address });
        } else if (role === "EMPLOYEE") {
            await Employee.findOneAndUpdate({ user: id }, { name, department });
        } else if (role === "SUPPLIER") {
            await Supplier.findOneAndUpdate({ user: id }, { companyName, contact });
        }

        return response.status(200).json({
            message: "User successfully updated",
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
}

///////////////////////////////////
///// DELETE - SINGOLO UTENTE /////
///////////////////////////////////
export async function remove(request, response, next) {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "Invalid user ID"));
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return next(createError(404, "User not found"));
        }

        // Cancello anche il profilo collegato
        await Customer.deleteOne({ user: id });
        await Employee.deleteOne({ user: id });
        await Supplier.deleteOne({ user: id });

        return response.status(200).json({
            message: "User successfully deleted",
            user: deletedUser,
        });
    } catch (error) {
        next(error);
    }
}
