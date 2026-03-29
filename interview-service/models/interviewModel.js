import mongoose from 'mongoose';

const interviewSchema = mongoose.Schema({
    applicationId: { type: String, required: true },
    jobId: { type: String, required: true },
    companyId: { type: String, required: true },
    seekerId: { type: String, required: true },
    seekerEmail: { type: String, required: true }, 
    scheduledDate: { type: Date, required: true },
    meetingLink: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['scheduled', 'completed', 'cancelled', 'closed'], 
        default: 'scheduled' 
    }
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;