import mongoose from 'mongoose';

const jobSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: Number },
    companyId: { type: String, required: true }, // Links to the User ID from Auth Service
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
export default Job;