const Form74 = require('../../model/CustomerData')
const Metering = require('../../model/Meter_Data')
const { coordsID } = require('../../utils/idGen')
const { agg_returns } = require('./aggregation_tasks/aggregation_tools')
const { TryAndCatch } = require('./_task_tools')

const MobileActivities = async (req, message) => {
  const { body, user, QUERIES: q } = req
  const { lat, lng } = body

  if (q.search === 'METER-INSTALLATION') {
    const dg = ['INSTALLER', 'DISCO:INSTALLER', 'MAP:INSTALLER']

    if (!dg.includes(q.role)) return message

    const userID = `${user.fullName}:${user.email}`
    const dd = await Metering.findOne({
      meter_number: q.hasId,
      disco_allocation_to: userID,
    })

    if (!dd)
      return agg_returns([], message, 'No result found with key ID: ' + q.hasId)

    if (dd.allocationStatus === 'Installed') {
      return agg_returns([], message, 'Meter already installed: ' + q.hasId)
    }

    const geo = coordsID({ LAT: lat, LONG: lng }).geoCode
    const vy = await Form74.findOne({ meter_number: q.hasId })

    if (!vy)
      return agg_returns(
        [],
        message,
        `This meter no: ${q.hasId} is not allocated to any property yet`
      )

    if (q.hasId === vy.meterNumber) {
      if (vy.geoCode === geo) {
        const { fullName, email } = user || {}
        const na = `${fullName}:${email}`

        if (dd.allocatedTo === na) {
          await Metering.UpdateDocument(q.hasId, {
            installation_status: true,
            allocation_status: 'Installed',
            installation_by: na,
            property_ref_id: vy.customer_id,
          })
          // if(rs_.startsWith('Document UPDATE'))
          await Form74.UpdateDocument(vy.customer_id, {
            meter_installed: true,
          })

          message.data = `Document with ID: ${dd.meterNumber} UPDATED successfully...`
          message.success = true
          message.code = 200
          return message
        } else return agg_returns([], message, `Unidentified installer`)
      } else
        return agg_returns([], message, `Error: Geo-location match failure`)
    } else
      return agg_returns(
        [],
        message,
        `${dd.meterNumber} is not allocated to this property`
      )
  } else if (q.search === 'VERIFY-PROPERTY') {
    const dg = ['SITE-VERIFICATION-OFFICER']

    if (!dg.includes(q.role)) return message
    const { lat, lng, location_coords, is_certified, ...res } = body || {}

    if (!lat || !lng || !location_coords || !is_certified)
      return agg_returns([], message, `Geo-location config is null`)
    const { _center, areaCode, geoCode } = coordsID({ LAT: lat, LONG: lng })

    const dd = await Form74.findOne({
      [q.name || 'customer_id']: q.hasId,
      is_certified: false,
    })
    console.log(body)
    if (!dd)
      return agg_returns(
        [],
        message,
        `This property with KeyID: ${q.hasId} has been verified`
      )

    await Form74.UpdateDocument(q.hasId, {
      lat,
      lng,
      location_coords,
      _center,
      area_code: areaCode,
      geo_code: geoCode,
      is_certified,
      meter_phase: res.meter_phase,
      area_type: res.area_type,
    })

    message.data = `Document with ID: ${q.hasId} UPDATED successfully...`
    message.success = true
    message.code = 200
    return message
  } else if (q.search === 'FROM-INSTALLER') {
    const dg = ['INSTALLER', 'DISCO:INSTALLER', 'MAP:INSTALLER']
    if (dg.includes(q.role)) {
      const userID = `${user.fullName}:${user.email}`
      const que = {
        ...(q.hasId
          ? {
              meter_number: q.hasId,
              installation_status: false,
              disco_allocation_to: userID,
              ...q.queries,
            }
          : { disco_allocation_to: userID, ...q.queries }),
      }

      const { data: hs } = await TryAndCatch(Metering, que, message, 'find')
      if (!hs) agg_returns(rs, message)

      const rs = q.hasId ? hs[0] : hs
      return agg_returns(rs, message)
    }

    return message
  }
}

module.exports = MobileActivities
