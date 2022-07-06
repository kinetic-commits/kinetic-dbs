const Metering = require('../../../model/Meter_Data')
const { isArray } = require('../../essentials/usables')
const { create_alert_msg } = require('../../_task/alert_msg')
const { body_recognition } = require('../../_task/bodyApplicationParser')
const { TryAndCatch, CheckMatches } = require('../../_task/_task_tools')

exports.mmpp = async (req, message) => {
  const { QUETIES: q, body, user } = req
  const parsed = body_recognition({
    [q.name || 'carton_id']: q.hasId,
    allocation_status: 'In store',
    limit: q.limit,
  })

  let response = []
  const { data: info, success } = await TryAndCatch(
    Metering,
    parsed,
    message,
    'find'
  )

  if (!success) return message

  for (let i = 0; i < info.length; i++) {
    const meter = info[i]
    const rs = await Metering.UpdateDocument(meter.meterNumber, {
      map_allocation_to: body.allocation_to,
      destination_store: body.destination_store,
      allocation_status: 'Allocated',
    })
    const fai = rs.startsWith('Document UPDATE with keyID')
    response.push({
      success: fai ? true : false,
      meterNumber: meter.meterNumber,
    })
  }
  const resp = CheckMatches(response, info)

  message.code = 200
  message.success = true
  message.data = resp

  if (message.success) {
    await create_alert_msg({
      sender: q.abbrv,
      receiver: isArray(body) ? body[0].allocation_to : body.allocation_to,
      logger_type: 'Metering Allocation',
      refID: isArray(info) ? info[0].store_id : info.store_id,
      message: resp,
      email: user.email,
    })
  }

  return message
}

exports.ndpp = async (req, message) => {
  const { QUETIES: q, body, user } = req
  const parsed = body_recognition({
    [q.name || 'carton_id']: q.hasId,
    allocation_status: 'Allocated',
    map_allocation_to: q.abbrv,
    disco_allocation_to: 'undefined',
    limit: q.limit,
  })

  const { data: info, success } = await TryAndCatch(
    Metering,
    parsed,
    message,
    'find'
  )

  if (!success) return message

  for (let i = 0; i < info.length; i++) {
    const meter = info[i]
    const f74 = body.allocation_customer_id || {}
    const { data, ...exs } = await TryAndCatch(
      Form74,
      {
        disco: parse_queries.disco,
        _id: f74[i],
        has_allocation: false,
        is_certified: true,
      },
      message,
      'findOne'
    )

    if (!exs.success)
      response.push(
        `Allocation of ${meter.meterNumber} FAILED with status: 404`
      )

    if (exs.success) {
      const rs_ = await Metering.UpdateDocument(meter.meterNumber, {
        disco_allocation_to: body.disco_allocation_to,
      })

      const rs = await Form74.UpdateDocument(data._id || data.customer_id, {
        has_allocation: true,
        meter_number: meter.meterNumber,
        meter_owner: meter.meterOwner,
      })

      const fai =
        rs.startsWith('Document UPDATE with keyID') &&
        rs_.startsWith('Document UPDATE with keyID')

      response.push({
        success: fai ? true : false,
        meterNumber: meter.meterNumber,
      })
    }
  }

  const resp =
    response.length > 0
      ? JSON.stringify(response)
      : CheckMatches(response, info)

  message.code = 200
  message.success = true
  message.data = resp

  if (message.success) {
    await create_alert_msg({
      sender: q.abbrv,
      receiver: isArray(body) ? body[0].allocation_to : body.allocation_to,
      logger_type: 'Metering Allocation',
      refID: isArray(info) ? info[0].store_id : info.store_id,
      message: resp,
      email: user.email,
    })
  }

  return message
}
