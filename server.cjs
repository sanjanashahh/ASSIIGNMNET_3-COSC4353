const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const users = []; // Mock array to store user data
const JWT_SECRET = 'your_secret_key';

// Function to generate a JWT token
function generateToken(user) {
    return jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
}

// Registration route
app.post('/register', [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('username').isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('role').notEmpty().withMessage('Role is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, username, password, phoneNumber, role } = req.body;
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { firstName, lastName, username, password: hashedPassword, phoneNumber, role };
    users.push(newUser);

    console.log(users.map(user => ({ ...user, password })));
    return res.status(201).json({ message: 'User registered successfully' });
});

// Login route
app.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').notEmpty().withMessage('Role is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array()); // Log validation errors
        return res.status(400).json({ errors: errors.array() }); // Return 400 for validation errors
    }

    const { username, password, role } = req.body;

    // Attempt to find user by username and role
    const user = users.find(u => u.username === username && u.role === role);
    
    // If the user is not found, return a 401
   // if (!user) {  // uncomment later if needed*****************************
       // console.log(`Login failed: User not found or role mismatch for username: ${username}`);
       // return res.status(401).json({ message: 'Invalid credentials' }); // Return 401 if user not found
   // }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log(`Login failed: Incorrect password for username: ${username}`);
        return res.status(401).json({ message: 'Invalid credentials' }); // Return 401 if password doesn't match
    }

    // Generate token and login successful
    const token = generateToken(user);
    console.log(`Login successful for username: ${username}. Role: ${role}. Token generated.`);
    return res.status(200).json({ message: 'Login successful', user: { username: user.username, role: user.role }, token });
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' }); // Returns 401 if no token

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(401).json({ message: 'Invalid or expired token' }); // Return 401 for invalid/expired token
        req.user = user;
        next();
    });
}

// Protected route
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: `Welcome to the dashboard, ${req.user.username}!` });
});

// Function to start the server
function startServer() {
    const PORT = process.env.PORT || 3000;
    return app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}


//Start the server if this module is run directly
if (require.main === module) {        // uncomment 
   startServer();
}

// Export the app for testing
module.exports = { app, startServer };
