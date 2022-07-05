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
} = require('../../helpers/Types');
const Form74 = require('../../model/CustomerData');
const IssueLoggerSchema = require('../../model/IssueLogger');
const Metering = require('../../model/Meter_Data');
const User = require('../../model/UserData');
const { isArray } = require('../essentials/usables');
const { create_alert_msg } = require('./alert_msg');
const { TryAndCatch, sendError } = require('./_task_tools');

const POST = async (req) => {
  const message = {
    error: 'Access denied',
    success: false,
    data: undefined,
    code: 500,
  };

  const {
    originalUrl: baseUrl,
    method,
    QUERIES,
    baseUrl: url,
    body,
    user,
  } = req;
  const isExact = method === 'POST' && !QUERIES.search;
  const { role, abbrv } = QUERIES;
  const parse_body = isArray(body) ? body.length : 1;

  if (parse_body <= 200000) {
    if (url === CREATE_URL && isExact) {
      const { email, password } = body;
      if (baseUrl === LOGIN_URL) {
        const user = await User.findOne({ email });
        const isMatch = password ? await User.matchPassword(password) : false;
        if (!user || !isMatch)
          return sendError({ errorMsg: 'Invalid login credential', message });

        message.data = true;
        message.success = true;
        return message;
      } else {
        const exst = await User.findOne({ email });
        if (exst)
          return sendError({ errorMsg: 'Invalid login credential', message });

        const rs = await TryAndCatch(User, body, message);
        return rs;
      }
    } else if (url === NM_URL && role === NM()) {
      const rs = await TryAndCatch(Metering, body, message);
      if (message.success) {
        await create_alert_msg({
          sender: abbrv,
          receiver: abbrv,
          logger_type: 'Meter Uploaded to Virtual Store',
          refID: isArray(body) ? body[0].store_id : body.store_id,
          message: `Metering upload of ${
            isArray(body) ? body.length : 1
          } was succesfully`,
          email: user.email,
        });
      }
      return rs;
    } else if (url === ND_URL && role === ND()) {
      let response = [];
      const info = isArray(body) ? body : [body];

      for (let i = 0; i < info.length; i++) {
        const mt = info[i];
        const meter = await Metering.findOne({
          map_allocation_to: abbrv,
          meter_number: mt.meter_number,
          disco_acknowledgement: false,
        });

        if (meter) {
          await Metering.UpdateDocument(meter.meterNumber, {
            disco_acknowledgement: true,
            disco_acknowledgement_by: abbrv,
          });
          response.push(`${mt.meter_number} moved to store successfully...`);
        }
      }
      const rsf =
        response.length > 0
          ? `${response.length} saved to store successfully...`
          : 'Error: Perharp the meters were not allocated to you';

      message.code = response.length > 0 ? 200 : 400;
      message.success = response.length > 0 ? true : false;
      message.data = rsf;
      message.error = rsf.startsWith('Error: Perharp') ? rsf : message.error;

      if (message.success) {
        await create_alert_msg({
          sender: abbrv,
          receiver: abbrv,
          logger_type: 'Meter Uploaded to Virtual Store',
          message: `Metering upload of ${
            isArray(body) ? body.length : 1
          } was succesfully`,
          email: user.email,
        });
      }
    } else if (url === CS_URL && (role === CS() || role === ND())) {
      const rs = await TryAndCatch(Form74, body, message);

      if (message.success) {
        await create_alert_msg({
          sender: abbrv,
          receiver: abbrv,
          logger_type: 'Customer Record Upload',
          refID: isArray(body) ? body[0].store_id : body.store_id,
          message: `Customer record upload of ${
            isArray(body) ? body.length : 1
          } was succesfully`,
          email: user.email,
        });
      }

      return rs;
    } else if (url === ISSUES) {
      const rs = await TryAndCatch(IssueLoggerSchema, body, message);
      return rs;
    }

    return message;
  } else {
    message.error = `Request is above max of ${parse_queries.max}`;
    return message;
  }
};

module.exports = POST;
