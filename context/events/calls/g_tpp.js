const Metering = require('../../../model/Meter_Data')
const { makeObject } = require('../../../posgoose/tool')
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
  const { hasId, name, role, abbrv, queries, search } = req.QUERIES
  console.log(role)
  if (role === 'CBN') return fromBS(req, message)

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
      const data = {
        [name || 'meter_number']: hasId,
        map_allocation_to: abbrv,
        disco_acknowledgement_by: abbrv,
      }
      const user = await TryAndCatch(Metering, data, message, 'findOne')
      return user
    } else {
      const user = await TryAndCatch(
        Metering,
        {
          map_allocation_to: abbrv,
          disco_acknowledgement_by: abbrv,
          ...queries,
        },
        message,
        'find'
      )
      return user
    }
  }
}

async function fromBS(req, message) {
  const { hasId, name, abbrv, queries } = req.QUERIES
  if (hasId) {
    const data = {
      [name || 'meter_number']: hasId,
    }
    const user = await TryAndCatch(Metering, data, message, 'findOne')
    return user
  } else {
    const que = makeObject([queries])
    const user = await TryAndCatch(Metering, que, message, 'find')
    return user
  }
}
