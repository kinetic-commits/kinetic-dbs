const bcript = require('bcrypt');
const { OutGoingForMeter } = require('../../../model/in_&_outs/OutgoingData');
const createMeterActivities = require('../../../model/Meter_Activities');
const createMeterData = require('../../../model/Meter_Data');
const createOtherMeterInfo = require('../../../model/OtherMeterInfo');
const CreateUserData = require('../../../model/UserData');
const CreateUserAddress = require('../../../model/UserAddress');
const CreateOtherUserInfo = require('../../../model/OtherUserInfo');
const CreateUserFranchiseAreas = require('../../../model/UserFranchise');
const QUERIES = require('../../Queries');
const { NM, ND, CS } = require('../../Types');
const CreateForm74 = require('../../../model/CustomerData');
const CreateForm74Address = require('../../../model/CustomerAddress');
const CreatePropertyDesc = require('../../../model/CustomerPropertyDesc');
const CreateCustomerInfo = require('../../../model/OtherCustomerInfo');
const NAVIGATION = require('./navigation');
const { isArray } = require('../../essential');
const IssueLoggerSchema = require('../../../model/IssueLogger');
const { _transformerID } = require('../../../utils/idGen');
const { dateAndTime } = require('../../../utils/dateTime');

const CREATE = async ({ req, data, dependencies, route }) => {
  const { BODY, user, role, search } = await QUERIES(req);
  const info = data || BODY;
  const ume = req.baseUrl === '/api/v1/user';
  const fo = isArray(info) ? info : [info];

  if (search === 'FETCH') {
    return await NAVIGATION({ req, route });
  }

  if (role === NM() && !ume) {
    const rs = await createMeterData.create(info);
    if (rs.success) {
      const rs0 = await createMeterActivities.create(info);
      if (rs0.success) {
        await createOtherMeterInfo.create(info);
      }
    }
    return {
      success: true,
      msg: `Processing ${fo.length} record. You will be notified after task resolution`,
    };
  } else if (role === ND() && !ume && !dependencies) {
    await createIssue({
      user,
      title: 'Metering Acknoledgement',
      msg: `Received a total of ${fo.length} meter(s) from ${fo[0].meterOwner}`,
      sender: fo[0].meterOwner,
      data: fo[0],
    });

    const scan = isArray(info)
      ? info.map(async (v) => create(v, user, true))
      : await create(info, user);
    if (!isArray(info) && !scan.success)
      return { success: false, msg: scan.msg };

    return {
      success: true,
      msg: `Processing ${fo.length} record. You will be notified after task resolution`,
    };
  } else if (ume) {
    const u_salt = isArray(info) ? info[0] : info;
    const salt = await bcript.genSalt(10);
    const password_config = await bcript.hash(u_salt.password, salt);
    u_salt.password = password_config;
    console.log(info);
    const rs = await CreateUserData.create(info);
    if (rs.success) {
      const rs0 = await CreateUserAddress.create(info);
      if (rs0.success && isArray(u_salt.franchiseStates || {})) {
        const states = u_salt.franchiseStates || [];
        states.map(
          async (a, i) =>
            await CreateUserFranchiseAreas.create({
              _id: u_salt._id,
              states: a,
              user_email: u_salt.user_email,
            })
        );
      }
      const rs00 = await CreateOtherUserInfo.create(info);

      return rs00;
    }
  } else if (role === CS() || role === ND() || dependencies) {
    const rs = await CreateForm74.create(info);
    if (rs.success) {
      const rs0 = await CreateForm74Address.create(info);
      if (rs0.success) {
        const rs00 = await CreatePropertyDesc.create(info);
        if (rs00.success) {
          const rs01 = await CreateCustomerInfo.create(info);
          if (rs01.success) return rs01;
        }
      }
    }
  }
};

async function create(data, user, isOne) {
  const { meter_number, meterNumber } = data || {};
  const ID = meterNumber || meter_number;

  const rs = await createMeterActivities.findOne(
    `where meter_id = '${ID}' and map_allocation_to='${user.abbrv}'`
  );

  if (rs.length < 1) {
    await createIssue({ user, data });
    return {
      success: false,
      msg: `This meter is not allocated to ${user.abbrv}`,
    };
  }

  const rs_ = OutGoingForMeter(rs, 'meter_number')[0];

  if (rs.length > 0) {
    if (rs_) {
      await createMeterActivities.UpdateDocument('meter_id', ID, {
        disco_acknowledgement: true,
        disco_acknowledgement_by: user.abbrv,
      });
    }
  }
  return { success: true };
}

async function createIssue({ user, title, msg, sender, data }) {
  const { meterNumber, storeID } = data || {};

  await IssueLoggerSchema.create({
    sender: sender || user.abbrv,
    receiver: user.abbrv,
    logger_id: _transformerID(),
    stage_status: 'Registered',
    logger_type: title || 'Meter Upload Error',
    user_email: user.email,
    unique_id: storeID,
    message:
      msg ||
      `This meter number: ${meterNumber} is not allocated to ${user.abbrv}`,
    uploadedBy: user.abbrv,
    is_read: false,
    createAt: dateAndTime().currentDate_time,
  });
}

module.exports = CREATE;
