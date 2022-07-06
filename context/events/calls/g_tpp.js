const Metering = require('../../../model/Meter_Data')
const { isArray } = require('../../essentials/usables')
const { create_alert_msg } = require('../../_task/alert_msg')
const { body_recognition } = require('../../_task/bodyApplicationParser')
const { TryAndCatch, CheckMatches } = require('../../_task/_task_tools')

exports.mmpgt = async (req, message) => {
  const { hasId, name, abbrv } = req.QUETIES
  if (hasId) {
    const data = body_recognition({
      [name || 'meter_number']: hasId,
      allocation_status: 'In store',
      uploaded_by: abbrv,
    })
    const user = await TryAndCatch(Metering, data, message, 'findOne')
    return user
  } else {
    const user = await TryAndCatch(
      Metering,
      body_recognition({
        ...parse_queries,
        allocation_status: 'In store',
        uploaded_by: abbrv,
      }),
      message,
      'find'
    )
    return user
  }
}

exports.ndpgt = async (req, message) => {
  const { hasId, name, abbrv, queries } = req.QUETIES

  if (hasId) {
    const data = body_recognition({
      [name || 'meter_number']: hasId,
      map_allocation_to: abbrv,
      disco_acknowledgement_by: abbrv,
    })
    const user = await TryAndCatch(Metering, data, message, 'findOne')
    return user
  } else {
    const user = await TryAndCatch(
      Metering,
      body_recognition({
        map_allocation_to: abbrv,
        disco_acknowledgement_by: abbrv,
        ...queries,
      }),
      message,
      'find'
    )
    return user
  }
}
