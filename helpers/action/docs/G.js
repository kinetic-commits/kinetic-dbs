const {
  OutGoingForMeter,
  OutGoingForUser,
  OutGoingForCustomer,
} = require('../../../model/in_&_outs/OutgoingData');
const createMeterData = require('../../../model/Meter_Data');
const CreateUserData = require('../../../model/UserData');
const QUERIES = require('../../Queries');
const { NM, ND, CS } = require('../../Types');
const CreateForm74 = require('../../../model/CustomerData');
const { getStoreDetails } = require('./Store');
const { MobileActivities } = require('./mobile_activities');
const NAVIGATION = require('./navigation');
const EXCEPTION_REPORT = require('./Reports');

const GET = async ({ req, route }) => {
  const {
    user,
    role,
    hasId,
    name,
    select,
    sql_queries,
    abbrv,
    limit,
    search,
    offset,
  } = await QUERIES(req);

  const EXCP = ['ITEMS', 'STORE'];

  const q = sql_queries ? `and ${sql_queries}` : '';

  const ID = hasId || abbrv;
  const ume = req.baseUrl === '/api/v1/user';
  const XP = ['DISK', 'DISK-MAP', 'CBS'];
  const XMP = ['VIEW'];

  //**************************IMPORTANT *********************** */

  if (search === 'FROM-INSTALLER') return await MobileActivities({ req });

  if (XMP.includes(search)) return await EXCEPTION_REPORT(req);

  if (XP.includes(search)) return await NAVIGATION({ req });

  if (EXCP.includes(search) && (ND() || NM())) {
    const rs = await getStoreDetails({ req });
    return rs;
  }

  //****************** NM() *****************************//
  if (role === NM() && !ume) {
    if (hasId) {
      const rs_ = await createMeterData.findOne(
        `where uploaded_by = '${abbrv}' and meter_number='${hasId}' ${q}`,
        select ? select : undefined
      );

      const rs = OutGoingForMeter(rs_, 'meter_number')[0];
      return rs;
    } else {
      const lm = limit ? `limit ${limit}` : '';

      const rs_ = await createMeterData.find(
        `where uploaded_by = '${abbrv}' ${q} ${lm}`,
        select ? select : undefined
      );
      const rs = OutGoingForMeter(rs_, 'meter_number');
      return rs;
    }

    //************************** ND() ********************/
  } else if (role === ND() && !route && !ume) {
    if (hasId) {
      const rs_ = await createMeterData.findOne(
        `where map_allocation_to = '${abbrv}' and meter_number='${hasId}' ${q}`,
        select ? select : undefined
      );
      const rs = OutGoingForMeter(rs_, 'meter_number')[0];
      return rs;
    } else {
      const lm = limit ? `limit ${limit}` : '';

      const rs_ = await createMeterData.find(
        `where map_allocation_to = '${abbrv}' ${q} ${lm}`,
        select ? select : undefined
      );
      const rs = OutGoingForMeter(rs_, 'meter_number');
      return rs;
    }

    // ******************GENERAL***********************//
  } else if (ume) {
    if (hasId) {
      const user = await CreateUserData.findOne(
        `where ${name || 'email'}= '${ID}'`
      );
      const rs = OutGoingForUser(user, 'email')[0];
      return rs;
    } else {
      const rs_ = await CreateUserData.find(`where email= '${user.email}'`);
      const rs = OutGoingForUser(rs_, 'email');
      return search === 'DECODE' ? rs[0] : rs;
    }

    // ******************ND() & CS()***********************//
  } else if (role === CS() || role === ND() || route) {
    if (hasId) {
      const rs_ = await CreateForm74.findOne(
        `where other_customer_info.disco = '${abbrv}' and _id='${hasId}' ${q}`,
        select ? select : undefined
      );

      const rs = OutGoingForCustomer(rs_, 'customer_id')[0];
      return rs;
    } else {
      const lm = limit ? `limit ${limit}` : '';
      const ofs = offset ? `offset ${offset > 0 ? offset : 0}` : '';

      const rs_ = await CreateForm74.find(
        `where other_customer_info.disco = '${abbrv}' ${q} ${ofs} ${lm}`,
        select ? select : undefined
      );

      const rs = OutGoingForCustomer(rs_, 'customer_id');
      return rs;
    }
  }
};

module.exports = GET;
