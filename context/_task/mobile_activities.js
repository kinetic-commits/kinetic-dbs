const Form74 = require('../../model/CustomerData');
const Metering = require('../../model/Meter_Data');
const { coordsID } = require('../../utils/idGen');
const { agg_returns } = require('./aggregation_tasks/aggregation_tools');

const MobileActivities = async (req, message) => {
  const { body, user, QUERIES: q } = req;
  const { lat, lng, meter_number } = body;

  if (q.search === 'METER-INSTALLATION') {
    const userID = `${user.fullName}: ${user.email}`;
    const dd = await Metering.findOne({
      meter_number: q.hasId,
      disco_allocation_to: userID,
    });

    if (!dd)
      return agg_returns(
        [],
        message,
        'No result found with key ID: ' + q.hasId
      );

    if (dd.allocationStatus === 'Installed') {
      return agg_returns([], message, 'Meter already installed: ' + q.hasId);
    }

    const geo = coordsID({ LAT: lat, LONG: lng }).geoCode;
    const vy = await Form74.findOne({ meter_number: q.hasId });

    if (!vy)
      return agg_returns(
        [],
        message,
        `This meter no: ${q.hasId} is not allocated to any property yet`
      );

    if (meter_number === vy.meterNumber) {
      if (vy.geo_code === geo) {
        const { fullName, email } = user || {};
        const na = `${fullName}: ${email}`;

        if (dd.allocatedTo === na) {
          await Metering.UpdateDocument(q.hasId, {
            installation_status: true,
            allocation_status: 'Installed',
            installation_by: na,
            property_ref_id: vy.customer_id,
          });
          // if(rs_.startsWith('Document UPDATE'))
          await Form74.UpdateDocument(vy.customer_id, {
            meter_installed: true,
          });

          message.data = `Document with ID: ${dd.meterNumber} UPDATED successfully...`;
          message.success = true;
          message.code = 200;
          return message;
        } else return agg_returns([], message, `Unidentified installer`);
      } else
        return agg_returns([], message, `Error: Geo-location match failure`);
    } else
      return agg_returns(
        [],
        message,
        `${dd.meterNumber} is not allocated to this property`
      );
  } else if (q.search === 'VERIFY-PROPERTY') {
    const { lat, lng, location_coords, is_certified } = body || {};

    if (!lat || !lng || !location_coords || !is_certified)
      return agg_returns([], message, `Geo-location config is null`);
    const { _center, areaCode, geoCode } = coordsID({ LAT: lat, LONG: lng });

    const dd = await Form74.findOne({
      [q.name || 'customer_id']: q.hasId,
      is_certified: false,
    });
    console.log(dd);
    if (!dd)
      return agg_returns(
        [],
        message,
        `This property with KeyID: ${q.hasId} has been verified`
      );

    await Form74.UpdateDocument(q.hasId, {
      lat,
      lng,
      location_coords,
      _center,
      area_code: areaCode,
      geo_code: geoCode,
      is_certified,
    });

    message.data = `Document with ID: ${q.hasId} UPDATED successfully...`;
    message.success = true;
    message.code = 200;
    return message;
  } else if (q.search === 'FROM-INSTALLER') {
    const userID = `${user.fullName}: ${user.email}`;
    const hs = await Metering.find({
      ...(q.hasId
        ? {
            meter_number: q.hasId,
            installation_status: false,
            disco_allocation_to: userID,
          }
        : { disco_allocation_to: userID }),
    });
    if (!hs) agg_returns(rs, message);

    const rs = q.hasId ? hs[0] : hs;
    return agg_returns(rs, message);
  }
};

module.exports = MobileActivities;
