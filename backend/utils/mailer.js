const nodemailer = require('nodemailer');

const getMailConfig = () => {
  const user = (process.env.SMTP_EMAIL || process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '').trim();
  const host = (process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

  return { user, pass, host, port, secure };
};

const createTransporter = () => {
  const { user, pass, host, port, secure } = getMailConfig();

  if (!user || !pass) {
    throw new Error('SMTP email/user or password is not set in backend/.env');
  }

  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

const formatDeadline = (deadline) => {
  if (!deadline) return 'No deadline set';

  return new Date(deadline).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const sendTaskAssignmentEmail = async (recipientEmail, taskDetails) => {
  const transporter = createTransporter();
  const { user } = getMailConfig();
  const { title, description, deadline, priority, organizerEmail } = taskDetails;

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
  };
  const priorityColor = priorityColors[priority] || '#6b7280';

  const mailOptions = {
    from: `"Volunteer Organizer" <${user}>`,
    to: recipientEmail,
    subject: `New Task Assigned: ${title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:36px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Task Assigned to You</h1>
                    <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">Volunteer Organizer Notification</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 40px;">
                    <p style="margin:0 0 20px;color:#334155;font-size:16px;line-height:1.6;">
                      Hi there! An organizer has assigned a new task to you. Here are the details:
                    </p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:24px;">
                          <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;">${title}</h2>
                          <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">${description}</p>

                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:6px 0;color:#64748b;font-size:13px;width:100px;vertical-align:top;">Deadline</td>
                              <td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:600;">${formatDeadline(deadline)}</td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0;color:#64748b;font-size:13px;width:100px;vertical-align:top;">Priority</td>
                              <td style="padding:6px 0;">
                                <span style="display:inline-block;padding:2px 12px;border-radius:20px;background:${priorityColor}20;color:${priorityColor};font-size:12px;font-weight:700;text-transform:uppercase;">${priority || 'medium'}</span>
                              </td>
                            </tr>
                            ${organizerEmail ? `
                            <tr>
                              <td style="padding:6px 0;color:#64748b;font-size:13px;width:100px;vertical-align:top;">Organizer</td>
                              <td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:600;">${organizerEmail}</td>
                            </tr>` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
                      Please log in to your <strong>Volunteer Dashboard</strong> to view and manage this task.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;">
                      This is an automated message from the Volunteer Organizer system.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Task assignment email sent to ${recipientEmail}. Message ID: ${info.messageId}`);
  return info;
};

module.exports = { sendTaskAssignmentEmail };
