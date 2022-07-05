const CreateForm74Address = require('../../../model/CustomerAddress');
const CreateForm74 = require('../../../model/CustomerData');
const {
  OutGoingForMeter,
  OutGoingForCustomer,
} = require('../../../model/in_&_outs/OutgoingData');
const createMeterActivities = require('../../../model/Meter_Activities');
const createMeterData = require('../../../model/Meter_Data');
const CreateCustomerInfo = require('../../../model/OtherCustomerInfo');
const { coordsID } = require('../../../utils/idGen');

const QUERIES = require('../../Queries');

const MobileActivities = async ({ req }) => {
  const { search, body, user, hasId } = await QUERIES(req);

  if (search === 'METER-INSTALLATION') {
    const dd = OutGoingForMeter(
      await createMeterData.findOne(`where meter_number = '${hasId}'`),
      'meter_number'
    )[0];

    if (!dd)
      return {
        error: 'No result found with key ID: ' + hasId,
        code: 400,
      };

    const geo = coordsID(body).geoCode;

    const vy = await CreateForm74.findOne(
      `where other_customer_info.meter_number = '${body.meterNumber}'`
    );
    const verify = OutGoingForCustomer(vy, 'customer_id')[0];

    if (!verify)
      return {
        error: `This meter no: ${body.meterNumber} is not allocated to any property yet`,
        code: 404,
      };

    if (body.meterNumber === verify.meterNumber) {
      if (verify.geoCode === geo) {
        const { fullName, email } = user || {};
        const na = `${fullName}: ${email}`;

        if (dd.allocatedTo === na) {
          await createMeterActivities.UpdateDocument(
            'meter_id',
            dd.meterNumber,
            {
              installation_status: true,
              allocation_status: 'Installed',
              installation_by: na,
              property_ref_id: dd.customer_id,
            }
          );

          await CreateCustomerInfo.UpdateDocument(
            'meter_number',
            dd.meterNumber,
            { meter_installed: true }
          );
          return {
            success: true,
            msg: `Document with ID: ${dd.meterNumber} UPDATED successfully...`,
          };
        } else return { success: false, msg: 'Unidentified installer' };
      } else
        return { success: false, msg: 'Error: Geo-location match failure' };
    } else
      return {
        msg: `${dd.meterNumber} is not allocated to this property`,
        success: false,
      };
  } else if (search === 'VERIFY-PROPERTY') {
    const { LAT, LONG, locationCoords, isCertified } = body || {};

    if (!LAT || !LONG || !locationCoords || !isCertified)
      return { success: false, msg: 'Geo-location config is null' };
    const { _center, areaCode, geoCode } = coordsID(body);

    await CreateForm74Address.UpdateDocument('customer_id', hasId, {
      lat: LAT,
      lng: LONG,
      location_coords: locationCoords,
      _center,
      area_code: areaCode,
      geo_code: geoCode,
    });

    await CreateCustomerInfo.UpdateDocument('customer_id', hasId, {
      is_certified: isCertified,
    });
    return {
      success: true,
      msg: `Document with ID: ${hasId} UPDATED successfully...`,
    };
  } else if (search === 'FROM-INSTALLER') {
    const userID = `${user.fullName}: ${user.email}`;
    const hs = hasId
      ? `meter_number = '${hasId}' and meter_activities.disco_allocation_to = '${userID}' and meter_activities.installation_status=false`
      : `disco_allocation_to = '${userID}'`;
    const vy = await createMeterData.findOne(`where ${hs}`);
    const verify = OutGoingForMeter(vy, 'meter_number');
    if (!verify) return undefined;

    return hasId ? verify[0] : verify;
  }
};

module.exports = { MobileActivities };
