const { OutGoingForMeter } = require('../../../model/in_&_outs/OutgoingData');
const IssueLoggerSchema = require('../../../model/IssueLogger');
const createMeterActivities = require('../../../model/Meter_Activities');
const createMeterData = require('../../../model/Meter_Data');
const CreateCustomerInfo = require('../../../model/OtherCustomerInfo');
const createOtherMeterInfo = require('../../../model/OtherMeterInfo');
const { dateAndTime } = require('../../../utils/dateTime');
const { _transformerID } = require('../../../utils/idGen');
const QUERIES = require('../../Queries');
const { NM, ND } = require('../../Types');
const { MobileActivities } = require('./mobile_activities');

const ALLOCATE = async ({ req }) => {
  const { body, limit, name, hasId, role, abbrv, user } = await QUERIES(req);

  if (role === 'INSTALLER') return await MobileActivities({ req });

  if (role === NM()) {
    const name_c = name === 'cartonID' ? 'carton_id' : name;

    const rs = await createMeterData.find(
      `where  ${
        name_c || 'carton_id'
      } = '${hasId}' and allocation_status <> 'Allocated' limit ${limit}`
    );

    const rs_ = OutGoingForMeter(rs, 'meter_number');

    if (rs_.length > 0) {
      rs_.map(
        async (d) =>
          await createMeterActivities.UpdateDocument(
            'meter_id',
            d.meterNumber,
            {
              map_allocation_to: body.allocatedTo,
              allocation_status: 'Allocated',
            }
          )
      );

      rs_.map(
        async (s) =>
          await createOtherMeterInfo.UpdateDocument('meter_id', s.meterNumber, {
            destination_store: body.destinationStore,
          })
      );

      await createIssue({
        user,
        title: 'Metering Allocation',
        msg: `Allocated a total of ${rs_.length} meter(s) to ${body.allocatedTo}`,
        sender: abbrv,
        data: rs_[0],
      });
    }

    return { success: true, msg: `${rs.length} UPDATED successfully...` };
  } else if (role === ND()) {
    const name_c = name === 'cartonID' ? 'carton_id' : name;
    const rs_ = await createMeterData.find(
      `where  ${name_c} = '${hasId}' and map_allocation_to = '${abbrv}' and disco_allocation_to = 'null' limit ${limit}`
    );

    const rs = OutGoingForMeter(rs_, 'meter_number');

    if (rs.length > 0) {
      rs.map(async (d, i) => {
        const { disco_allocation_to } = body[i] || {};
        await createMeterActivities.UpdateDocument('meter_id', d.meterNumber, {
          disco_allocation_to,
        });
      });

      rs.map(async (d, i) => {
        const { customer_id } = body[i] || {};
        await CreateCustomerInfo.UpdateDocument('customer_id', customer_id, {
          has_allocation: true,
          meter_number: d.meterNumber,
          meter_owner: d.meterOwner,
        });
      });

      await createIssue({
        user,
        title: 'Metering Allocation',
        msg: `Allocated a total of ${rs_.length} meter(s) to ${body[0].disco_allocation_to}`,
        sender: abbrv,
        data: rs[0],
      });
    }

    return { success: true, msg: `${rs.length} UPDATED successfully...` };
  }
};

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

module.exports = ALLOCATE;
