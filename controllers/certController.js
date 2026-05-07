const db = require('../config/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateCertificate = async (req, res) => {
    const { cadet_id, type, camp_name } = req.body; // type: Camp Participation, Achievement, etc.

    try {
        const [cadets] = await db.execute('SELECT * FROM cadets WHERE id = ?', [cadet_id]);
        if (cadets.length === 0) return res.status(404).json({ message: 'Cadet not found' });

        const cadet = cadets[0];
        const certificate_no = `NCC-${Date.now()}-${cadet_id}`;
        const issue_date = new Date().toISOString().split('T')[0];
        const filename = `cert-${certificate_no}.pdf`;
        const filePath = `public/uploads/certificates/${filename}`;
        const relativePath = `/uploads/certificates/${filename}`;

        // Ensure directory exists
        const dir = 'public/uploads/certificates/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Generate PDF
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
        doc.pipe(fs.createWriteStream(filePath));

        // Design
        doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100).stroke();
        doc.fontSize(40).text('CERTIFICATE OF PARTICIPATION', 0, 150, { align: 'center' });
        doc.fontSize(20).text('This is to certify that', 0, 220, { align: 'center' });
        doc.fontSize(30).text(cadet.name, 0, 260, { align: 'center' });
        doc.fontSize(20).text(`Rank: ${cadet.rank}`, 0, 300, { align: 'center' });
        doc.fontSize(20).text(`has successfully participated in ${camp_name || type}`, 0, 350, { align: 'center' });
        doc.fontSize(15).text(`Date: ${issue_date}`, 100, 450);
        doc.fontSize(15).text(`Certificate No: ${certificate_no}`, 100, 480);
        doc.fontSize(15).text('Authorized Official', 600, 450);

        doc.end();

        // Save to database
        await db.execute(
            'INSERT INTO certificates (cadet_id, type, issue_date, file_path, certificate_no) VALUES (?, ?, ?, ?, ?)',
            [cadet_id, type, issue_date, relativePath, certificate_no]
        );

        res.status(201).json({ message: 'Certificate generated successfully', file_path: relativePath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate certificate', error: err.message });
    }
};

exports.getCertificates = async (req, res) => {
    try {
        let query = 'SELECT cert.*, c.name FROM certificates cert JOIN cadets c ON cert.cadet_id = c.id';
        const params = [];

        if (req.user.role === 'Student') {
            query += ' WHERE cert.cadet_id = ?';
            params.push(req.user.cadet_ref_id);
        }

        const [certs] = await db.execute(query, params);
        res.json(certs);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch certificates', error: err.message });
    }
};
