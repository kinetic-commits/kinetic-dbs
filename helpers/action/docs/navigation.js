const Form74 = require('../../../model/CustomerData');
const createMeterData = require('../../../model/Meter_Data');
const { NM, ND } = require('../../Types');
const ANALYSIS = require('./Analysis');
const DISK = require('./ForDisk');
const { DISK_MAP } = require('./ForDiskMap');
const { parseUserFetch } = require('./ObjectParser');

const NAVIGATION = async ({ req, route }) => {
  const { who, body, abbrv, role, limit, search } = req.QUERIES;
  const EXCP = [NM(), ND()];
  const XP = ['DISK', 'DISK-MAP', 'CBS'];

  if (EXCP.includes(who) && !route) {
    const rs = await parseUserFetch({ req });
    return rs;
  } else if (role === ND() && !XP.includes(search) && !route) {
    const rs = await createMeterData.find(
      `where meter_activities.map_allocation_to = '${abbrv}' and carton_id = '${body.carton_id}' limit ${limit}`
    );

    return { success: true, msg: rs };
  } else if (route && !XP.includes(search)) {
    if (!body.state) throw new Error('Property location province is required');
    const rs =
      await Form74.find(`where other_customer_info.has_allocation=false and other_customer_info.is_certified = true
      and other_customer_info.disco = '${abbrv}' and customer_address.state = '${body.state}' 
      and other_customer_info.meter_phase = '${body.meter_phase}' limit ${limit}`);

    return { success: true, msg: rs };
  } else if (XP.includes(search)) {
    if (search === 'DISK') return await DISK({ req });
    else if (search === 'DISK-MAP') return await DISK_MAP({ req });
    else if (search === 'CBS') return await ANALYSIS({ req });
  }
};

module.exports = NAVIGATION;
