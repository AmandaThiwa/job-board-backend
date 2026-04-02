import Job from '../models/jobModel.js';

// Helper function to validate MongoDB Object IDs
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// @desc    Get all active jobs (Public)
// @route   GET /api/jobs
export const getJobs = async (req, res) => {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(jobs);
};

// @desc    Get job by ID (Public)
// @route   GET /api/jobs/:id
export const getJobById = async (req, res) => {
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Job ID format' });
    }
    // --- VALIDATION END ---

    const job = await Job.findById(req.params.id);
    
    if (job) {
        res.json(job);
    } else {
        res.status(404).json({ error: 'Job not found' });
    }
};

// @desc    Create a new job (Company Only)
// @route   POST /api/jobs
export const createJob = async (req, res) => {
    const { title, description, companyName, location, salary } = req.body;

    // --- VALIDATION START ---
    if (!title || !description || !companyName || !location) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }
    // Prevent empty strings or just spaces
    if (title.trim() === '' || description.trim() === '' || companyName.trim() === '' || location.trim() === '') {
        return res.status(400).json({ error: 'Fields cannot be empty spaces' });
    }
    // Check if salary is provided and valid
    if (salary !== undefined && (isNaN(salary) || Number(salary) < 0)) {
        return res.status(400).json({ error: 'Salary must be a valid positive number' });
    }
    // --- VALIDATION END ---

    const job = await Job.create({
        title: title.trim(),
        description: description.trim(),
        companyName: companyName.trim(),
        location: location.trim(),
        salary: salary ? Number(salary) : undefined,
        companyId: req.user.userId // Automatically attached from the JWT cookie!
    });

    res.status(201).json(job);
};

// @desc    Update a job (Company Only - Must be the owner)
// @route   PUT /api/jobs/:id
export const updateJob = async (req, res) => {
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Job ID format' });
    }
    // If salary is being updated, ensure it's a valid number
    if (req.body.salary !== undefined && (isNaN(req.body.salary) || Number(req.body.salary) < 0)) {
        return res.status(400).json({ error: 'Salary must be a valid positive number' });
    }
    // --- VALIDATION END ---

    const job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    // Check if the user trying to update is the company that created it (or an admin)
    if (job.companyId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this job posting' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
};

// @desc    Delete a job (Company Only - Must be the owner)
// @route   DELETE /api/jobs/:id
export const deleteJob = async (req, res) => {
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Job ID format' });
    }
    // --- VALIDATION END ---

    const job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    // Check if the user trying to delete is the company that created it (or an admin)
    if (job.companyId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this job posting' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed successfully' });
};

// @desc    Get all jobs for a specific company (Public)
// @route   GET /api/jobs/company/:companyId
export const getJobsByCompanyId = async (req, res) => {
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.companyId)) {
        return res.status(400).json({ error: 'Invalid Company ID format' });
    }
    // --- VALIDATION END ---

    // Find jobs matching the company ID from the URL parameter
    const jobs = await Job.find({ companyId: req.params.companyId, isActive: true }).sort({ createdAt: -1 });
    
    if (jobs && jobs.length > 0) {
        res.status(200).json(jobs);
    } else {
        res.status(404).json({ message: 'No active jobs found for this company' });
    }
};

// @desc    Get all jobs posted by the logged-in company (Private Dashboard)
// @route   GET /api/jobs/myjobs
export const getMyJobs = async (req, res) => {
    // Find jobs matching the ID from the logged-in user's cookie token
    const jobs = await Job.find({ companyId: req.user.userId }).sort({ createdAt: -1 });
    
    res.status(200).json(jobs);
};