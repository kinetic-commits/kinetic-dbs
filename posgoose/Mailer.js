const nodemailer = require('nodemailer')
const { _transformerID } = require('../utils/idGen')

function Mailer() {
  this.mails = {}
  const tkn = _transformerID().toString().substring(0, 6)
  this.tk = tkn
}

Mailer.prototype.sendMsg = async function ({ from, to, subject, body, html }) {
  const auth = { user: process.env.MAIL_URL, pass: process.env.MAIL_WORD }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth,
    tls: { rejectUnauthorized: false },
  })
  let result = { success: false, message: null }
  try {
    const rs = await transporter.sendMail({
      from: from || process.env.MAIL_URL,
      to,
      subject,
      ...(body ? { text: body } : ''),
      ...(html ? { html } : ''),
    })
    result = { success: true, message: rs.response }
  } catch (error) {
    result.message = error.message
  }
  return result
}

Mailer.prototype.getUrl = function (req, route) {
  const params = route ? route : ''
  const url = `${req.protocol}://${req.get('host')}/${params}`
  return url
}

Mailer.prototype.sendLink = async function ({
  req,
  route,
  to,
  subject = 'Email Verification',
  body,
  program_name,
  company_name,
}) {
  const url = this.getUrl(req, route)

  const fm = `"${company_name || 'Automated_mail'}" <${process.env.MAIL_URL}>`
  const rs = await this.sendMsg({
    from: fm,
    to,
    subject,
    html: `
    <h2 style="font-weight: bold">Your registration was successful</h2>
    <p>Here are your login details:</p>
    <p>Username: ${to}</p>
    <p>Password: ${body}</p>
    <p style="font-weight: bold">Click the link below to verify your email.</p>
    <p style="color: red">You are receiving this mail because you are part of the ${
      program_name || '<Program name>'
    } and your email needs to be verified.</p>
    <p>Thank you.</p>
    <a href="${url}">Verify email</a>
    `,
  })
  return rs
}

module.exports = new Mailer()
