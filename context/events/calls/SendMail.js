const User = require('../../../model/UserData')
const Mailer = require('../../../posgoose/Mailer')
const ErrorCatcher = require('../../../utils/errorCatcher')
const { isArray } = require('../../essentials/usables')

exports.changePassword = async (req, res, next) => {
  const { main, QUERIES: q } = req
  if (q.search === 'SEND-ME-TOKEN') {
    const tk = Mailer.tk
    const rs = await Mailer.sendMsg({
      to: main.email,
      subject: 'Reset Token',
      html: `<h1>${tk}</h1>`,
    })
    if (!rs.success) return next(new ErrorCatcher(rs.message, 400))
    return res.status(200).json({ success: true, data: tk })
  } else if (q.search === 'CHANGE-PASSWORD') {
    const { email, password, confirm_password } = main

    if (password !== confirm_password)
      return next(new ErrorCatcher('UPDATE FAILED - match error', 404))

    const rs = await User.findOne({ email })

    if (!rs)
      return next(new ErrorCatcher('UPDATE FAILED - Email does not exist', 404))
    const hh = await User.hashPassword(main)
    const hash = isArray(hh) ? hh[0] : hh

    await User.UpdateDocument(email, { password: hash.password })

    return res
      .status(200)
      .json({ success: true, data: 'Password change successfully...' })
  }
}

exports.verifyEmail = async (req) => {
  const { search } = req.QUERIES
  const vf = await User.findOne({ user_key: search })
  if (vf) {
    await User.UpdateDocument(vf.email, { email_verified: true })
  } else console.log(vf)
}
