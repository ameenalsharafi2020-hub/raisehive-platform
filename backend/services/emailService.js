const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send email
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `RaiseHive <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  }

  // Welcome email
  async sendWelcomeEmail(userEmail, username) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to RaiseHive! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hello ${username || 'there'}!</h2>
            <p>Thank you for joining RaiseHive, the decentralized crowdfunding platform powered by blockchain technology.</p>
            <p>With RaiseHive, you can:</p>
            <ul>
              <li>🚀 Launch your own crowdfunding campaigns</li>
              <li>💰 Support innovative projects with cryptocurrency</li>
              <li>🔒 Enjoy transparent and secure transactions</li>
              <li>🌍 Connect with a global community of creators</li>
            </ul>
            <p>Ready to get started?</p>
            <a href="${process.env.FRONTEND_URL}" class="button">Explore Campaigns</a>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              If you have any questions, feel free to reach out to our support team.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(userEmail, 'Welcome to RaiseHive', html);
  }

  // Campaign created notification
  async sendCampaignCreatedEmail(userEmail, campaignTitle, campaignUrl) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campaign Created Successfully! 🎊</h1>
          </div>
          <div class="content">
            <h2>Congratulations!</h2>
            <p>Your campaign "<strong>${campaignTitle}</strong>" has been successfully created and is now live on RaiseHive.</p>
            <p>Share your campaign with your network to start raising funds:</p>
            <a href="${campaignUrl}" class="button">View Campaign</a>
            <p style="margin-top: 30px;">
              <strong>Next steps:</strong>
            </p>
            <ul>
              <li>Share your campaign on social media</li>
              <li>Engage with your supporters</li>
              <li>Post regular updates</li>
              <li>Thank your contributors</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(userEmail, `Campaign Created: ${campaignTitle}`, html);
  }

  // Contribution received notification
  async sendContributionEmail(userEmail, campaignTitle, amount, contributorAddress) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount { font-size: 36px; font-weight: bold; color: #3b82f6; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contribution Received! 💰</h1>
          </div>
          <div class="content">
            <p>Great news! Your campaign "<strong>${campaignTitle}</strong>" just received a new contribution.</p>
            <div class="amount">${amount} ETH</div>
            <p><strong>From:</strong> ${contributorAddress}</p>
            <p>Keep up the momentum by:</p>
            <ul>
              <li>Thanking your contributor</li>
              <li>Posting an update</li>
              <li>Sharing your progress</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(userEmail, `New Contribution: ${campaignTitle}`, html);
  }

  // Campaign successful notification
  async sendCampaignSuccessEmail(userEmail, campaignTitle, totalRaised) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { font-size: 48px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campaign Successfully Funded! 🎉</h1>
          </div>
          <div class="content">
            <div class="success">🎊 SUCCESS! 🎊</div>
            <p>Congratulations! Your campaign "<strong>${campaignTitle}</strong>" has reached its funding goal!</p>
            <p><strong>Total Raised:</strong> ${totalRaised} ETH</p>
            <p>You can now withdraw the funds and start working on your project. Don't forget to:</p>
            <ul>
              <li>Thank all your supporters</li>
              <li>Share regular updates on your progress</li>
              <li>Complete the milestones you promised</li>
              <li>Deliver rewards to your backers</li>
            </ul>
            <p>Thank you for using RaiseHive to bring your vision to life!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(userEmail, `Campaign Successful: ${campaignTitle}`, html);
  }
}

module.exports = new EmailService();