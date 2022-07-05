const {
  OutGoingForMeter,
  OutGoingForUser,
} = require('../../../model/in_&_outs/OutgoingData');
const createMeterData = require('../../../model/Meter_Data');
const CreateUserData = require('../../../model/UserData');
const QUERIES = require('../../Queries');
const { ND } = require('../../Types');
const { getAllExceptions } = require('../docs_helper/ReportArgs');

async function EXCEPTION_REPORT(req) {
  const { search, from, to, skip } = await QUERIES(req);
  const QP = ['DISCO', 'MAP'];

  if (search === 'VIEW' && (!from || !to) && !QP.includes(skip)) {
    const rs = await getAllExceptions();
    return rs;
  } else if (QP.includes(skip)) {
    const rs = await CreateUserData.find(
      `where other_user_info.role='${skip}'`
    );
    const rs_ = OutGoingForUser(rs, 'email');

    return rs_;
  } else {
    const rs = await createMeterData.find(
      `where meter_activities.allocation_status='Allocated' and 
      meter_activities.uploaded_by='${from}' and 
      meter_activities.map_allocation_to='${to}' and 
      meter_activities.disco_acknowledgement=false`
    );
    const rs_ = OutGoingForMeter(rs, 'meter_number');
    return rs_;
  }
}

module.exports = EXCEPTION_REPORT;
