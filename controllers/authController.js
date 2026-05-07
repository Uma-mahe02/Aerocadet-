const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService');
const otpStore = {}; // Temporary memory store for OTPs since DB column is missing

exports.register = async (req, res) => {
    const { name, username, password, cadetDetails } = req.body;
    const role = 'Student'; // Enforce Student role for all new registrations

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let cadet_ref_id = null;

        // Create cadet entry first
        if (cadetDetails) {
            const {
                name: cName = name,
                cadet_id: cId = '',
                rank: cRank = 'Cadet',
                contact: cContact = '',
                email: cEmail = '',
                department: cDept = ''
            } = cadetDetails;

            const [cadetResult] = await db.execute(
                'INSERT INTO cadets (name, cadet_id, `rank`, contact, email, department) VALUES (?, ?, ?, ?, ?, ?)',
                [cName, cId, cRank, cContact, cEmail, cDept]
            );
            cadet_ref_id = cadetResult.insertId;
        }

        // Generate OTP
        const otp_code = Math.floor(100000 + Math.random() * 900000).toString();

        // Create user
        await db.execute(
            'INSERT INTO users (name, username, password, role, cadet_ref_id) VALUES (?, ?, ?, ?, ?)',
            [name, username, hashedPassword, role, cadet_ref_id]
        );

        // Store OTP in memory securely formatted
        otpStore[username] = otp_code;

        if (cadetDetails && cadetDetails.email) {
            await emailService.sendOTP(cadetDetails.email, otp_code);
        }

        res.status(201).json({ message: 'Registration initiated. Please verify your OTP.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
};

exports.verifyOTP = async (req, res) => {
    const { username, otp_code } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(400).json({ message: 'User not found' });

        // Retrieve from memory store instead of database
        const storedOtp = otpStore[username];
        
        if (storedOtp && storedOtp === otp_code) {
            delete otpStore[username]; // Clear OTP after successful use
            res.json({ message: 'Email verified successfully! You can now log in.' });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP code' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'OTP verification failed', error: err.message });
    }
};
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Bypass OTP check for login as per user request
        // if (user.role !== 'Admin' && (!user.is_verified || user.is_verified === 0)) {
        //     return res.status(403).json({ message: 'Please verify your email via OTP before logging in.' });
        // }
        const token = jwt.sign(
            { id: user.id, role: user.role, cadet_ref_id: user.cadet_ref_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};
