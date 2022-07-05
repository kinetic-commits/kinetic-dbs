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
const { MobileActivities } = require('./mobile_activities');

const PATCH = async ({ req, data }) => {
  const { BODY, role, name, hasId, search } = await QUERIES(req);
  const info = data || BODY;
  const excp = ['VERIFY-PROPERTY', 'METER-INSTALLATION'];

  if (excp.includes(search)) {
    return await MobileActivities({ req });
  }

  if (role === NM()) {
    await createMeterData.UpdateDocument(name, hasId, info);
    await createMeterActivities.UpdateDocument(name, hasId, info);
    await createOtherMeterInfo.UpdateDocument(name, hasId, info);
  } else if (role === ND()) {
    await createMeterData.UpdateDocument('meter_number', hasId, info);
    await createMeterActivities.UpdateDocument('meter_id', hasId, info);
    await createOtherMeterInfo.UpdateDocument('meter_id', hasId, info);
  } else if (req.originalUrl === '/api/v1/user') {
    await CreateOtherUserInfo.UpdateDocument('user_email', hasId, info);
    await CreateUserAddress.UpdateDocument('user_email', hasId, info);
    await CreateUserData.UpdateDocument('email', hasId, info);
    await CreateUserFranchiseAreas.UpdateDocument('user_email', hasId, info);
  } else if (role === CS() || role === ND()) {
    await CreateForm74.create('_id', hasId, info);
    await CreateForm74Address.create('customer_id', hasId, info);
    await CreatePropertyDesc.create('customer_id', hasId, info);
    await CreateCustomerInfo.create('customer_id', hasId, info);
  }

  return `Document UPDATED with key ID ${hasId}`;
};

module.exports = PATCH;
