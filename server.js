require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const db = require('./config/db');
const bcrypt = require('bcryptjs');

// Initialize Default Admin
async function initializeAdmin() {
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ? OR username = ?', ['admin1881', 'ADMIN1881']);
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('1881', salt);

        if (rows.length === 0) {
            await db.execute(
                'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
                ['Core Command', 'admin1881', hashedPassword, 'Admin']
            );
            console.log('Default admin user created: admin1881 / 1881');
        } else {
            // Force reset the password to 1881 just in case it was changed to something unknown.
            await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, rows[0].id]);
            console.log('Default admin user verified and password ensured.');
        }
    } catch (err) {
        console.error('Failed to initialize default admin:', err);
    }
}

// Run initialization
initializeAdmin();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/camps', require('./routes/campRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/cadets', require('./routes/cadetRoutes'));
app.use('/api/certificates', require('./routes/certRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/study-materials', require('./routes/studyMaterialRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
