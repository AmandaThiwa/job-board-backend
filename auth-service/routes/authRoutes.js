import express from 'express';
import { 
    signupUser, loginUser, logoutUser, 
    getUsers, getUserById, updateUser, deleteUser 
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes (Requires login token)
router.route('/users')
    .get(protect, admin, getUsers); // Only Admins can get all users

router.route('/users/:id')
    .get(protect, getUserById)
    .put(protect, updateUser)
    .delete(protect, deleteUser); // Logic for Admin/Self deletion is in the controller

export default router;