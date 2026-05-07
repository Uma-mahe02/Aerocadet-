const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nccairwing1881@gmail.com',
        pass: 'ayhq eror xdyx guxz'
    }
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: '"AirWing Command" <nccairwing1881@gmail.com>',
        to: email,
        subject: 'Squadron Enlistment - Verification Code',
        html: `
            <h2>SQUADRON ENLISTMENT VERIFICATION</h2>
            <p>Your authentication code is: <strong>${otp}</strong></p>
            <p>Please enter this code in the portal to finalize your enlistment.</p>
        `
    };
    return transporter.sendMail(mailOptions);
};

const sendAnnouncement = async (emails, title, content) => {
    const mailOptions = {
        from: '"AirWing Command" <nccairwing1881@gmail.com>',
        to: emails, // array of strings
        subject: `NEW ORDER: ${title}`,
        html: `
            <h3>${title}</h3>
            <p>${content}</p>
        `
    };
    return transporter.sendMail(mailOptions);
};

const sendCampNotice = async (emails, campName, date) => {
    const mailOptions = {
        from: '"AirWing Command" <nccairwing1881@gmail.com>',
        to: emails,
        subject: `DEPLOYMENT ALERT: ${campName}`,
        html: `
            <h3>Mission Deployment Alert</h3>
            <p>You are hereby notified of an upcoming deployment: <strong>${campName}</strong> scheduled for ${new Date(date).toLocaleDateString()}.</p>
            <p>Check the command terminal for details.</p>
        `
    };
    return transporter.sendMail(mailOptions);
};

const sendCertificateNotice = async (email, certType) => {
    const mailOptions = {
        from: '"AirWing Command" <nccairwing1881@gmail.com>',
        to: email,
        subject: `CERTIFICATE ISSUED: ${certType}`,
        html: `
            <h3>Aero Certificate Authorized</h3>
            <p>Your certificate under the category <strong>${certType}</strong> has been officially authorized and issued.</p>
            <p>You may download the log from the command portal.</p>
        `
    };
    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendOTP,
    sendAnnouncement,
    sendCampNotice,
    sendCertificateNotice
};
