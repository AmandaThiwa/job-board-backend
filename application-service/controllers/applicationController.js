import Application from '../models/applicationModel.js';

// @desc    Apply for a job (Seeker Only)
// @route   POST /api/applications
export const applyForJob = async (req, res) => {
    try {
        const { jobId, companyId, seekerEmail, resumeLink, coverLetter } = req.body;

        if (!jobId || !companyId || !seekerEmail || !resumeLink) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        const application = await Application.create({
            jobId,
            companyId,
            seekerId: req.user.userId, // From cookie
            seekerEmail,
            resumeLink,
            coverLetter
        });

        res.status(201).json(application);
    } catch (error) {
        // Handle duplicate application error (from the unique index)
        if (error.code === 11000) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get all applications (Admin Only)
// @route   GET /api/applications
export const getAllApplications = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const applications = await Application.find({}).sort({ createdAt: -1 });
    res.json(applications);
};

// @desc    Get a seeker's own applications (Seeker Only)
// @route   GET /api/applications/my-applications
export const getMyApplications = async (req, res) => {
    const applications = await Application.find({ seekerId: req.user.userId }).sort({ createdAt: -1 });
    res.json(applications);
};

// @desc    Get all applications for a specific job (Company Only)
// @route   GET /api/applications/job/:jobId
export const getJobApplications = async (req, res) => {
    const applications = await Application.find({ jobId: req.params.jobId }).sort({ createdAt: -1 });
    
    // Ensure the company requesting these applications actually owns them
    if (applications.length > 0 && applications[0].companyId !== req.user.userId && req.user.role !== 'admin') {
         return res.status(403).json({ error: 'Not authorized to view these applications' });
    }

    res.json(applications);
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
export const getApplicationById = async (req, res) => {
    const application = await Application.findById(req.params.id);
    
    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Only the seeker who applied, the company that owns the job, or an admin can view it
    if (application.seekerId !== req.user.userId && application.companyId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view this application' });
    }

    res.json(application);
};

// @desc    Update application status (Company Only)
// @route   PATCH /api/applications/:id/status
export const updateApplicationStatus = async (req, res) => {
    const { status } = req.body; // 'accepted' or 'rejected'
    
    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be accepted or rejected' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    if (application.companyId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    application.status = status;
    const updatedApplication = await application.save();

    res.json(updatedApplication);
};

// @desc    Delete an application (Seeker or Admin)
// @route   DELETE /api/applications/:id
export const deleteApplication = async (req, res) => {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    if (application.seekerId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this application' });
    }

    await application.deleteOne();
    res.json({ message: 'Application deleted successfully' });
};