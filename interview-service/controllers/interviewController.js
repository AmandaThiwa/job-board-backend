import Interview from '../models/interviewModel.js';

// @desc    Schedule an interview (Company Only)
// @route   POST /api/interviews
export const scheduleInterview = async (req, res) => {
    const { applicationId, jobId, seekerId, seekerEmail, scheduledDate, meetingLink } = req.body;

    if (!applicationId || !seekerEmail || !scheduledDate || !meetingLink) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const interview = await Interview.create({
        applicationId, 
        jobId, 
        seekerId, 
        seekerEmail, 
        scheduledDate, 
        meetingLink,
        companyId: req.user.userId 
    });

    res.status(201).json(interview);
};

// @desc    Get all interviews for a specific user (Seeker Only)
// @route   GET /api/interviews/my-interviews
export const getSeekerInterviews = async (req, res) => {
    const interviews = await Interview.find({ seekerId: req.user.userId }).sort({ scheduledDate: 1 });
    res.json(interviews);
};

// @desc    Get all interviews for a specific company (Company Only)
// @route   GET /api/interviews/company-interviews
export const getCompanyInterviews = async (req, res) => {
    const interviews = await Interview.find({ companyId: req.user.userId }).sort({ scheduledDate: 1 });
    res.json(interviews);
};

// @desc    Get interview by ID
// @route   GET /api/interviews/:id
export const getInterviewById = async (req, res) => {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    // Ensure only the involved seeker or company can view it
    if (interview.seekerId !== req.user.userId && interview.companyId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view this interview' });
    }
    res.json(interview);
};

// @desc    Update interview details like time/link (Company Only)
// @route   PUT /api/interviews/:id
export const updateInterview = async (req, res) => {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    if (interview.companyId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
    }

    interview.scheduledDate = req.body.scheduledDate || interview.scheduledDate;
    interview.meetingLink = req.body.meetingLink || interview.meetingLink;
    const updatedInterview = await interview.save();

    res.json(updatedInterview);
};

// @desc    Update interview status (Company Only)
// @route   PATCH /api/interviews/:id/status
export const updateInterviewStatus = async (req, res) => {
    const { status } = req.body;
    if (!['scheduled', 'completed', 'cancelled', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    if (interview.companyId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
    }

    interview.status = status;
    const updatedInterview = await interview.save();
    res.json(updatedInterview);
};

// @desc    Delete specific interview by ID (Company Only)
// @route   DELETE /api/interviews/:id
export const deleteInterview = async (req, res) => {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    if (interview.companyId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
    }

    await interview.deleteOne();
    res.json({ message: 'Interview deleted successfully' });
};

// @desc    Delete ALL closed interviews for the logged-in company (Company Only)
// @route   DELETE /api/interviews/cleanup/closed
export const deleteClosedInterviews = async (req, res) => {
    // Delete many where the companyId matches the cookie AND status is 'closed'
    const result = await Interview.deleteMany({ companyId: req.user.userId, status: 'closed' });
    
    res.json({ message: `Successfully deleted ${result.deletedCount} closed interviews.` });
};