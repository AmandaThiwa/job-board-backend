import Notification from '../models/notificationModel.js';
import sendEmail from '../utils/sendEmail.js';

// Helper functions for validation
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @desc    Create a notification & send email (Usually called by other services)
// @route   POST /api/notifications
export const createNotification = async (req, res) => {
    const { userId, userEmail, subject, message, type } = req.body;

    // --- VALIDATION START ---
    if (!userId || !userEmail || !subject || !message) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }
    if (!isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid User ID format' });
    }
    if (!isValidEmail(userEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (subject.trim() === '' || message.trim() === '') {
        return res.status(400).json({ error: 'Subject and message cannot be empty strings' });
    }
    // --- VALIDATION END ---

    // 1. Save to Database for the User's Dashboard
    const notification = await Notification.create({
        userId,
        userEmail: userEmail.trim(),
        subject: subject.trim(),
        message: message.trim(),
        type: type ? type.trim() : 'general'
    });

    // 2. Send the actual Email
    await sendEmail({
        email: userEmail.trim(),
        subject: subject.trim(),
        message: message.trim()
    });

    res.status(201).json(notification);
};

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
export const getUserNotifications = async (req, res) => {
    // Find notifications where the userId matches the logged-in user's token
    const notifications = await Notification.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(notifications);
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
export const markAsRead = async (req, res) => {
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Notification ID format' });
    }
    // --- VALIDATION END ---

    const notification = await Notification.findById(req.params.id);

    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    // Ensure the user owns this notification
    if (notification.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }

    notification.isRead = true;
    const updatedNotification = await notification.save();
    res.json(updatedNotification);
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Notification ID format' });
    }
    // --- VALIDATION END ---

    const notification = await Notification.findById(req.params.id);

    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    // Ensure the user owns this notification
    if (notification.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted successfully' });
};