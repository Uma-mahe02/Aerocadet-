const nodemailer = require('nodemailer');

nodemailer.createTestAccount((err, account) => {
    if (err) return;
    let transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass }
    });
    transporter.sendMail({
        from: '"Quartermaster HQ" <qm@airwingncc.com>',
        to: "brajan@airwing.com",
        subject: "Equipment Dispatch Order: Test Boot",
        text: "Dear Cadet Brajan,\n\nYou have been issued: Test Boot on 2026-03-14.\nPlease keep your equipment well maintained.\n\nRegards,\nAirWing Quartermaster"
    }, (err, info) => {
        if (!err) {
            console.log("\n--- ETHEREAL EMAIL DISPATCH ---");
            console.log("Sent Mail to: brajan@airwing.com");
            console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
            console.log("-------------------------------\n");
        }
    });
});
