const emailService = require('./utils/emailService');

async function testEmail() {
    try {
        console.log("Attempting to send OTP email...");
        await emailService.sendOTP('test@example.com', '123456');
        console.log("Email sent successfully!");
    } catch (err) {
        console.error("Failed to send email:", err.message);
    }
}

testEmail();
