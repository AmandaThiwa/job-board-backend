import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
    userId: { type: String, required: true }, // The user receiving the notification (Seeker or Company)
    userEmail: { type: String, required: true }, // Needed to send the actual email
    subject: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'general' }, // e.g., 'interview', 'application_update'
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;