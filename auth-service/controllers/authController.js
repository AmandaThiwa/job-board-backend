import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// Helper function to validate MongoDB Object IDs
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// Helper function to validate Email format
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @desc    Register a new user
// @route   POST /api/auth/signup
export const signupUser = async (req, res) => {
    const { email, password, role } = req.body;

    // --- VALIDATION START ---
    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Please provide email, password, and role' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (!['seeker', 'company', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be seeker, company, or admin' });
    }
    // --- VALIDATION END ---

    // Check if user already exists with this email
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    // Create user
    const user = await User.create({ email, password, role });

    if (user) {
        generateToken(res, user._id, user.role);
        res.status(201).json({ id: user._id, email: user.email, role: user.role });
    } else {
        res.status(400).json({ error: 'Invalid user data' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    // --- VALIDATION START ---
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }
    // --- VALIDATION END ---

    // Find user by email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id, user.role);
        res.json({ id: user._id, email: user.email, role: user.role });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
export const getUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
};

// @desc    Get user by ID
// @route   GET /api/auth/users/:id
export const getUserById = async (req, res) => {
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid User ID format' });
    }
    // --- VALIDATION END ---

    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/users/:id
export const updateUser = async (req, res) => {
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid User ID format' });
    }
    if (req.body.email && !isValidEmail(req.body.email)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (req.body.password && req.body.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    // --- VALIDATION END ---

    // Only allow user to update their own profile, or an admin to update anyone
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this user' });
    }

    const user = await User.findById(req.params.id);

    if (user) {
        user.email = req.body.email || user.email; // Updated to use email
        if (req.body.password) {
            user.password = req.body.password; // pre-save hook will hash it
        }

        const updatedUser = await user.save();
        res.json({ id: updatedUser._id, email: updatedUser.email, role: updatedUser.role });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
export const deleteUser = async (req, res) => {
    // --- VALIDATION START ---
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid User ID format' });
    }
    // --- VALIDATION END ---

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Check if the requester is an admin OR is the user themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this account' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed successfully' });
};