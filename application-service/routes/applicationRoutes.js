import express from 'express';
import { 
    applyForJob, getAllApplications, getMyApplications, 
    getJobApplications, getApplicationById, updateApplicationStatus, deleteApplication 
} from '../controllers/applicationController.js';
import { protect, seekerOnly, companyOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here require the user to be logged in
router.use(protect); 

// Static routes first
router.get('/my-applications', seekerOnly, getMyApplications);
router.get('/job/:jobId', companyOnly, getJobApplications);

// Base routes
router.route('/')
    .post(seekerOnly, applyForJob)
    .get(getAllApplications); // Admin only logic is handled in the controller

// Dynamic ID routes last
router.route('/:id')
    .get(getApplicationById)
    .delete(deleteApplication);

// Status update
router.patch('/:id/status', companyOnly, updateApplicationStatus);

export default router;