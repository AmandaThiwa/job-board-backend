import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email address'
        ]
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['company', 'seeker', 'admin'], required: true, default: 'seeker' }
}, { timestamps: true });

// Hash password before saving to the database
userSchema.pre('save', async function () {
    // If the password wasn't changed, exit this function immediately
    if (!this.isModified('password')) {
        return; 
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;