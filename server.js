const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://quizthon.com', 'https://www.quizthon.com']
        : true,
    credentials: true
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static('.', {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
})); // Serve static files from current directory

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizthon', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            return this.authProvider !== 'google';
        },
        minlength: 6
    },
    authProvider: {
        type: String,
        enum: ['email', 'google'],
        default: 'email'
    },
    googleId: {
        type: String,
        sparse: true
    },
    avatar: {
        type: String,
        default: null
    },
    quizHistory: [{
        id: String,
        category: String,
        difficulty: String,
        score: Number,
        totalQuestions: Number,
        percentage: Number,
        date: {
            type: Date,
            default: Date.now
        },
        timestamp: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// User Registration
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please fill in all fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            authProvider: 'email',
            quizHistory: []
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                authProvider: user.authProvider,
                avatar: user.avatar,
                quizHistory: user.quizHistory
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Please fill in all fields' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                authProvider: user.authProvider,
                avatar: user.avatar,
                quizHistory: user.quizHistory
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// Google OAuth Login
app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        // Verify the Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        if (!email || !name) {
            return res.status(400).json({ error: 'Incomplete Google profile information' });
        }

        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { email: email },
                { googleId: googleId }
            ]
        });

        if (user) {
            // Update existing user with Google info if needed
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                user.avatar = picture;
                await user.save();
            }
        } else {
            // Create new user
            user = new User({
                name,
                email,
                googleId,
                authProvider: 'google',
                avatar: picture,
                quizHistory: []
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Google authentication successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                authProvider: user.authProvider,
                avatar: user.avatar,
                quizHistory: user.quizHistory
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        if (error.message.includes('Token used too early') || error.message.includes('Invalid token')) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }
        res.status(500).json({ error: 'Google authentication failed. Please try again.' });
    }
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                authProvider: user.authProvider,
                avatar: user.avatar,
                quizHistory: user.quizHistory,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// Save Quiz Result
app.post('/api/quiz/save-result', authenticateToken, async (req, res) => {
    try {
        const { category, difficulty, score, totalQuestions, percentage } = req.body;

        const quizResult = {
            id: Date.now().toString(),
            category,
            difficulty,
            score,
            totalQuestions,
            percentage,
            date: new Date(),
            timestamp: Date.now()
        };

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.quizHistory.unshift(quizResult); // Add to beginning of array
        await user.save();

        res.json({
            message: 'Quiz result saved successfully!',
            quizResult
        });
    } catch (error) {
        console.error('Save result error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// Get Quiz History
app.get('/api/quiz/history', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('quizHistory');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            history: user.quizHistory
        });
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
