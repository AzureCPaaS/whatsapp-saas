export async function sendVerificationEmail(email: string, token: string) {
    // In a real application, you would use Resend, SendGrid, Nodemailer, etc.
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'onboarding@resend.dev',
    //   to: email,
    //   subject: 'Verify your Wazend email address',
    //   html: `<p>Click <a href="http://localhost:3000/api/verify-email?token=${token}">here</a> to verify your email.</p>`
    // });

    const verifyLink = `http://localhost:3000/api/verify-email?token=${token}`;

    console.log("=======================================================");
    console.log(" MOCK EMAIL SENDER triggered for:", email);
    console.log(" Please click the following link to verify your email:");
    console.log(" " + verifyLink);
    console.log("=======================================================");

    return { success: true };
}
