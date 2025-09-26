import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, "Inserisci un'email valida"]
    },
    password: {
        type: String,
        minlength: 6,
    },
    googleId: {
        type: String,
        sparse: true // consente più valori null senza errore unique
    },
    role: {
        type: String,
        enum: ["ADMIN", "CUSTOMER", "EMPLOYEE", "SUPPLIER"],
        required: true,
    },
}, { timestamps: true });


///// Hash della password prima del salvataggio /////
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

///// Metodo per confrontare password in fase di login /////
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};


const User = mongoose.model("User", UserSchema);
export default User;
