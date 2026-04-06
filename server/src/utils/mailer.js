const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

const sendMail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"NUR Encuestas" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html
  })
}

const sendInvitation = async ({ to, formTitle, invitationLink }) => {
  return sendMail({
    to,
    subject: `Invitación para responder: ${formTitle}`,
    html: `
      <h2>Te han invitado a responder una encuesta</h2>
      <p><strong>${formTitle}</strong></p>
      <p>Hacé clic en el siguiente enlace para responder:</p>
      <a href="${invitationLink}">${invitationLink}</a>
    `
  })
}

const sendThresholdNotification = async ({ to, formTitle, count }) => {
  return sendMail({
    to,
    subject: `Tu encuesta "${formTitle}" alcanzó ${count} respuestas`,
    html: `
      <h2>Notificación de respuestas</h2>
      <p>Tu encuesta <strong>${formTitle}</strong> ha alcanzado <strong>${count} respuestas</strong>.</p>
    `
  })
}

const sendSubmissionConfirmation = async ({ to, formTitle }) => {
  return sendMail({
    to,
    subject: `Respuesta registrada: ${formTitle}`,
    html: `
      <h2>¡Gracias por responder!</h2>
      <p>Tu respuesta a <strong>${formTitle}</strong> fue registrada correctamente.</p>
    `
  })
}

module.exports = { sendMail, sendInvitation, sendThresholdNotification, sendSubmissionConfirmation }
