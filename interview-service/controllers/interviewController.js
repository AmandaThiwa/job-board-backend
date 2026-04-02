import Interview from '../models/interviewModel.js';

// Helper functions for validation
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidURL = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};
const isValidDate = (date) => !isNaN(Date.parse(date));

// @desc    Schedule an interview (Company Only) & Automatically Trigger Notification
// @route   POST /api/interviews
export const scheduleInterview = async (req, res) => {
    const { applicationId, jobId, seekerId, seekerEmail, scheduledDate, meetingLink } = req.body;

    // --- VALIDATION START ---
    if (!applicationId || !jobId || !seekerId || !seekerEmail || !scheduledDate || !meetingLink) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }
    if (!isValidObjectId(applicationId) || !isValidObjectId(jobId) || !isValidObjectId(seekerId)) {
        return res.status(400).json({ error: 'Invalid ID format provided for application, job, or seeker' });
    }
    if (!isValidEmail(seekerEmail)) {
        return res.status(400).json({ error: 'Please provide a valid seeker email address' });
    }
    if (!isValidURL(meetingLink)) {
        return res.status(400).json({ error: 'Please provide a valid URL for the meeting link' });
    }
    if (!isValidDate(scheduledDate)) {
        return res.status(400).json({ error: 'Please provide a valid scheduled date' });
    }
    // --- VALIDATION END ---

    // 1. Save the interview in the database
    const interview = await Interview.create({
        applicationId, 
        jobId, 
        seekerId, 
        seekerEmail: seekerEmail.trim(), 
        scheduledDate, 
        meetingLink: meetingLink.trim(),
        companyId: req.user.userId 
    });

    // 2. 🔥 THE AUTOMATIC TRIGGER 🔥
    // Send a request to the Notification Service (Port 3005) behind the scenes
    try {
        const message = `Good news! A company has scheduled an interview with you on ${new Date(scheduledDate).toLocaleString()}.\nMeeting Link: ${meetingLink}`;
        
        await fetch('http://localhost:3005/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: seekerId,
                userEmail: seekerEmail,
                subject: 'New Interview Scheduled!',
                message: message,
                type: 'interview'
            })
        });
        console.log('✅ Automatic notification sent successfully to Notification Service!');
    } catch (error) {
        console.error('❌ Failed to trigger automatic notification:', error.message);
    }

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
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Interview ID format' });
    }
    // --- VALIDATION END ---

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
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Interview ID format' });
    }
    if (req.body.meetingLink && !isValidURL(req.body.meetingLink)) {
        return res.status(400).json({ error: 'Please provide a valid URL for the meeting link' });
    }
    if (req.body.scheduledDate && !isValidDate(req.body.scheduledDate)) {
        return res.status(400).json({ error: 'Please provide a valid scheduled date' });
    }
    // --- VALIDATION END ---

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
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Interview ID format' });
    }
    const { status } = req.body;
    if (!status || !['scheduled', 'completed', 'cancelled', 'closed'].includes(status.trim().toLowerCase())) {
        return res.status(400).json({ error: 'Invalid status. Must be scheduled, completed, cancelled, or closed' });
    }
    // --- VALIDATION END ---

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    if (interview.companyId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
    }

    interview.status = status.trim().toLowerCase();
    const updatedInterview = await interview.save();
    res.json(updatedInterview);
};

// @desc    Delete specific interview by ID (Company Only)
// @route   DELETE /api/interviews/:id
export const deleteInterview = async (req, res) => {
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid Interview ID format' });
    }
    // --- VALIDATION END ---

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