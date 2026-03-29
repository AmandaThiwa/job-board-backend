import mongoose from 'mongoose';

const applicationSchema = mongoose.Schema({
    jobId: { type: String, required: true },
    companyId: { type: String, required: true }, // The company that owns the job
    seekerId: { type: String, required: true },  // The user who is applying
    seekerEmail: { type: String, required: true }, // Needed for the interview emails later
    resumeLink: { type: String, required: true },
    coverLetter: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'], 
        default: 'pending' 
    }
}, { timestamps: true });

// Prevent a user from applying to the same job twice
applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;