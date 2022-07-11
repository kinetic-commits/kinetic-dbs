const Metering = require('../../../model/Meter_Data')
const { body_recognition } = require('../../_task/bodyApplicationParser')
const { TryAndCatch } = require('../../_task/_task_tools')

exports.mmpgt = async (req, message) => {
  const { hasId, name, abbrv, search } = req.QUERIES
  if (search === 'REPLACEMENT') {
    const data = {
      [name || 'meter_number']: hasId,
      uploaded_by: abbrv,
      needs_replacement: true,
      replace_with_id: 'undefined',
    }
    const user = await TryAndCatch(Metering, data, message, 'findOne')
    if (!user.success) message.error = 'No replacement request for this meter'
    return user
  } else if (hasId) {
    const data = {
      [name || 'meter_number']: hasId,
      allocation_status: 'In store',
      uploaded_by: abbrv,
    }

    const user = await TryAndCatch(Metering, data, message, 'findOne')
    return user
  } else {
    const user = await TryAndCatch(
      Metering,
      {
        ...parse_queries,
        allocation_status: 'In store',
        uploaded_by: abbrv,
      },
      message,
      'find'
    )
    return user
  }
}

exports.ndpgt = async (req, message) => {
  const { hasId, name, abbrv, queries, search } = req.QUERIES

  if (search === 'FAULT') {
    const data = {
      [name || 'meter_number']: hasId,
      map_allocation_to: abbrv,
      disco_acknowledgement_by: abbrv,
      needs_replacement: false,
    }
    const user = await TryAndCatch(Metering, data, message, 'findOne')
    if (!user.success) message.error = 'No replacement request for this meter'
    return user
  } else {
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
}
