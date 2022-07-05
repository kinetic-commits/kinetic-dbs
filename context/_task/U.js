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
const Aggregation_Functional_Component = require('./aggregation_tasks/aggregation_func');
const { create_alert_msg } = require('./alert_msg');
const { body_recognition } = require('./bodyApplicationParser');
const {
  TryAndCatch,
  TryAndCatchUpdates,
  CheckMatches,
} = require('./_task_tools');

const PUT = async (req) => {
  const message = {
    error: 'Access denied',
    success: false,
    data: undefined,
    code: 500,
  };

  const { QUERIES, baseUrl: url, body, user } = req;
  const { role, abbrv, name, queries, hasId, search, limit } = QUERIES;
  const parse_queries = body_recognition({ ...queries, abbrv, role });

  const aggregations = ['METER-INSTALLATION', 'VERIFY-PROPERTY'];

  if (aggregations.includes(search))
    return Aggregation_Functional_Component({ req, message });

  if (url === CREATE_URL) {
    const parsed = { ...parse_queries, [name || 'email']: hasId };
    return TryAndCatchUpdates(User, body, message, 'email', parsed);
  } else if (url === NM_URL && role === NM()) {
    if (search === 'ALLOCATE') {
      let response = [];
      const parsed = body_recognition({
        [name || 'carton_id']: hasId,
        allocation_status: 'In store',
        limit,
      });
      const { data: info, success } = await TryAndCatch(
        Metering,
        parsed,
        message,
        'find'
      );

      if (!success) return message;

      for (let i = 0; i < info.length; i++) {
        const meter = info[i];
        const rs = await Metering.UpdateDocument(meter.meterNumber, {
          map_allocation_to: body.allocation_to,
          destination_store: body.destination_store,
          allocation_status: 'Allocated',
        });
        const fai = rs.startsWith('Document UPDATE with keyID');
        response.push({
          success: fai ? true : false,
          meterNumber: meter.meterNumber,
        });
      }
      const resp = CheckMatches(response, info);

      message.code = 200;
      message.success = true;
      message.data = resp;

      if (message.success) {
        await create_alert_msg({
          sender: abbrv,
          receiver: isArray(body) ? body[0].allocation_to : body.allocation_to,
          logger_type: 'Metering Allocation',
          refID: isArray(info) ? info[0].store_id : info.store_id,
          message: resp,
          email: user.email,
        });
      }

      return message;
    }
  } else if (url === ND_URL && role === ND()) {
    let response = [];
    const parsed = body_recognition({
      [name || 'carton_id']: hasId,
      allocation_status: 'Allocated',
      map_allocation_to: abbrv,
      disco_allocation_to: 'undefined',
      limit,
    });

    const { data: info, success } = await TryAndCatch(
      Metering,
      parsed,
      message,
      'find'
    );

    if (!success) return message;

    for (let i = 0; i < info.length; i++) {
      const meter = info[i];
      const f74 = body.allocation_customer_id || {};
      const { data, ...exs } = await TryAndCatch(
        Form74,
        {
          disco: parse_queries.disco,
          _id: f74[i],
          // has_allocation: false,
          // is_certified: true,
        },
        message,
        'findOne'
      );

      if (!exs.success)
        response.push(
          `Allocation of ${meter.meterNumber} FAILED with status: 404`
        );

      if (exs.success) {
        const rs_ = await Metering.UpdateDocument(meter.meterNumber, {
          disco_allocation_to: body.disco_allocation_to,
        });

        const rs = await Form74.UpdateDocument(data._id || data.customer_id, {
          has_allocation: true,
          meter_number: meter.meterNumber,
          meter_owner: meter.meterOwner,
        });

        const fai =
          rs.startsWith('Document UPDATE with keyID') &&
          rs_.startsWith('Document UPDATE with keyID');

        response.push({
          success: fai ? true : false,
          meterNumber: meter.meterNumber,
        });
      }
    }

    const resp =
      response.length > 0
        ? JSON.stringify(response)
        : CheckMatches(response, info);

    message.code = 200;
    message.success = true;
    message.data = resp;

    if (message.success) {
      await create_alert_msg({
        sender: abbrv,
        receiver: isArray(body) ? body[0].allocation_to : body.allocation_to,
        logger_type: 'Metering Allocation',
        refID: isArray(info) ? info[0].store_id : info.store_id,
        message: resp,
        email: user.email,
      });
    }

    return message;
  } else if (url === CS_URL && (role === CS() || role === ND())) {
    const parsed = { ...parse_queries, [name || '_id']: hasId };
    return TryAndCatchUpdates(Form74, body, message, '_id', parsed);
  } else if (url === ISSUES) {
    const parsed = { ...parse_queries, [name || '_id']: hasId };
    return TryAndCatchUpdates(IssueLoggerSchema, body, message, '_id', parsed);
  }

  return message;
};

module.exports = PUT;
