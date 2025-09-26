import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Employee from "../models/Employee.js";
import Supplier from "../models/Supplier.js";

import { signJWT } from "../helpers/jwt.js";
import mailer from "../helpers/mailer.js";

/////////////////
///// LOGIN /////
/////////////////
export async function login(request, response, next) {
    try {
        const { email, password } = request.body;

        const user = await User.findOne({ email });
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return response.status(400).json({ message: "Incorrect email or password" });
        }

        const token = await signJWT({ id: user._id, role: user.role });

        return response.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, email: user.email, role: user.role },
        });
    } catch (error) {
        next(error);
    }
}

//////////////////
///// SIGNUP /////
//////////////////
export async function signup(request, response, next) {
    try {
        const { email, password, role, name, phone, address, department, companyName, contact } = request.body;

        // Verifica se utente esiste
        const existing = await User.findOne({ email });
        if (existing) {
            return response.status(400).json({ message: "This email is already registered" });
        }

        // Crea utente
        const newUser = new User({ email, password, role });
        await newUser.save();

        // Crea tipo utente
        if (role === "CUSTOMER") {
            const newCustomer = new Customer({
                user: newUser._id,
                name,
                phone,
                address,
            });
            await newCustomer.save();
        }

        if (role === "EMPLOYEE") {
            const newEmployee = new Employee({
                user: newUser._id,
                name,
                department,
            });
            await newEmployee.save();
        }

        if (role === "SUPPLIER") {
            const newSupplier = new Supplier({
                user: newUser._id,
                companyName,
                contact,
            });
            await newSupplier.save();
        }

        // Benvenuto
        await mailer.sendMail({
            to: email,
            subject: "Welcome to BakeApp",
            html: `
                <h1>Welcome to BakeApp!</h1>
                <p>Hi ${name || "user"},</p>
                <p>Your account has been successfully created. You can now log in and start using BakeApp.</p>
                <p>We are happy to have you on board.</p>
                <p>- BakeApp Team</p>
            `,
            from: "studio.fabio.lasalvia@gmail.com",
        });

        response.status(201).json({
            message: "User successfully registered",
            user: { id: newUser._id, email: newUser.email, role: newUser.role },
        });
    } catch (error) {
        response.status(500).json({ message: "Error during registration", error });
    }
}
