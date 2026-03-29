import express from 'express';
import { 
    createNotification, getUserNotifications, 
    markAsRead, deleteNotification 
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. UNPROTECTED ROUTE: The Interview Service will call this automatically behind the scenes
router.post('/', createNotification); 

// 2. PROTECTED ROUTES: The user must be logged in to view or delete their own notifications
router.use(protect);
router.get('/', getUserNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;