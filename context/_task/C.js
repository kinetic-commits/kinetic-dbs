const {
  ND_URL,
  NM_URL,
  CS_URL,
  CREATE_URL,
  LOGIN_URL,
  NM,
  ND,
  CS,
  ISSUES,
} = require('../../helpers/Types')
const Form74 = require('../../model/CustomerData')
const IssueLoggerSchema = require('../../model/IssueLogger')
const User = require('../../model/UserData')
const { dateAndTime } = require('../../utils/dateTime')
const { isArray } = require('../essentials/usables')
const { mmps, ndps } = require('../events/calls/p_spp')
const { create_alert_msg } = require('./alert_msg')
const { TryAndCatch, sendError } = require('./_task_tools')

const POST = async (req) => {
  const message = {
    error: 'Access denied',
    success: false,
    data: undefined,
    code: 500,
  }

  const {
    originalUrl: baseUrl,
    method,
    QUERIES,
    baseUrl: url,
    main,
    user,
  } = req
  const isExact = method === 'POST' && !QUERIES.search
  const { role, abbrv } = QUERIES

  const parse_main = isArray(main) ? main.length : 1

  if (parse_main <= 200000) {
    if (url === CREATE_URL && isExact) {
      const { email, password } = main
      if (baseUrl === LOGIN_URL) {
        const user = await User.findOne({ email })
        const isMatch =
          password && user ? await User.matchPassword(password) : false

        if (!user || !isMatch)
          return sendError({ errorMsg: 'Invalid login credential', message })

        await User.UpdateDocument(email, {
          last_login_info: dateAndTime().currentDate_time,
        })

        if (user.is_disabled)
          return sendError({
            errorMsg:
              'It seems you will need the ADMIN to help you access your profile',
            message,
          })

        message.data = true
        message.success = true
        return message
      } else {
        const exst = await User.findOne({ email })
        if (exst)
          return sendError({
            errorMsg: `User already exist with email: ${email}`,
            message,
          })

        const rs = await TryAndCatch(User, main, message)
        return rs
      }
    } else if (url === NM_URL && role === NM()) return await mmps(req, message)
    else if (url === ND_URL && role === ND()) return await ndps(req, message)
    else if (url === CS_URL && (role === CS() || role === ND())) {
      const rs = await TryAndCatch(Form74, main, message)

      if (message.success) {
        await create_alert_msg({
          sender: abbrv,
          receiver: abbrv,
          logger_type: 'Customer Record Upload',
          refID: isArray(main) ? main[0].store_id : main.store_id,
          message: `Customer record upload of ${
            isArray(main) ? main.length : 1
          } was succesfully`,
          email: user.email,
        })
      }

      return rs
    } else if (url === ISSUES) {
      const bdy = isArray(main)
        ? main.map((d) => {
            return { ...d, uploaded_by: abbrv }
          })
        : { ...main, uploaded_by: abbrv }
      const rs = await TryAndCatch(IssueLoggerSchema, bdy, message)
      return rs
    }

    return message
  } else {
    message.error = `Request is above max of ${parse_queries.max}`
    return message
  }
}

module.exports = POST
