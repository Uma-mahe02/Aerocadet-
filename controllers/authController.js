const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, username, password, role, cadetDetails } = req.body;

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let cadet_ref_id = null;

        // If Student, create cadet entry first
        if (role === 'Student' && cadetDetails) {
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

        // Create user
        await db.execute(
            'INSERT INTO users (name, username, password, role, cadet_ref_id) VALUES (?, ?, ?, ?, ?)',
            [name, username, hashedPassword, role, cadet_ref_id]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
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
