import express from 'express';
import { 
    scheduleInterview, getSeekerInterviews, getCompanyInterviews, 
    getInterviewById, updateInterview, updateInterviewStatus, 
    deleteInterview, deleteClosedInterviews 
} from '../controllers/interviewController.js';
import { protect, seekerOnly, companyOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// Specific Routes First
router.get('/my-interviews', seekerOnly, getSeekerInterviews);
router.get('/company-interviews', companyOnly, getCompanyInterviews);
router.delete('/cleanup/closed', companyOnly, deleteClosedInterviews); // Bulk delete

// Base Routes
router.post('/', companyOnly, scheduleInterview);

// Dynamic ID Routes Last
router.route('/:id')
    .get(getInterviewById)
    .put(companyOnly, updateInterview)
    .delete(companyOnly, deleteInterview);

// Status update
router.patch('/:id/status', companyOnly, updateInterviewStatus);

export default router;