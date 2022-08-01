const Form74 = require('../../../model/CustomerData')
const Metering = require('../../../model/Meter_Data')
const { KeyValuePairs } = require('../../../posgoose/tool')
const { dateAndTime } = require('../../../utils/dateTime')
const { isArray } = require('../../essentials/usables')
const { create_alert_msg } = require('../../_task/alert_msg')
const {
  TryAndCatch,
  CheckMatches,
  TryAndCatchUpdates,
} = require('../../_task/_task_tools')

exports.mmpp = async (req, message) => {
  const { QUERIES: q, main, user } = req
  if (q.search === 'ALLOCATE') {
    const parsed = {
      [q.name || 'carton_id']: q.hasId,
      allocation_status: 'In store',
      uploaded_by: q.abbrv,
      limit: q.limit,
    }
    if (q.limit > 25) {
      if (req.query.limit) {
        const { parameter: wh } = KeyValuePairs({
          [q.name || 'carton_id']: q.hasId,
          allocation_status: 'In store',
          uploaded_by: q.abbrv,
        })
        const { update: bd } = KeyValuePairs({
          map_allocation_to: main.allocation_to,
          allocation_status: 'Allocated',
        })
        try {
          const rs = await Metering.raw({
            name: 'meter_activities',
            method: 'UPDATE',
            where: `where meter_id in (
                select meter_number from ${Metering.schemaName}
                ${Metering.join()}
                where ${wh} limit ${req.query.limit}
              )`,
            body: bd,
          })
          await Metering.raw({
            name: 'other_meter_info',
            method: 'UPDATE',
            where: `where meter_id in (
                select meter_number from ${Metering.schemaName}
                ${Metering.join()}
                where ${wh} limit ${req.query.limit}
              )`,
            body: `destination_store='${main.destination_store}'`,
          })

          message.code = 200
          message.success = true
          message.data = rs

          if (message.success) {
            const ms = isArray(main)
              ? main[0].allocation_to
              : main.allocation_to
            await create_alert_msg({
              sender: q.abbrv,
              receiver: isArray(main)
                ? main[0].allocation_to
                : main.allocation_to,
              logger_type: 'Metering Allocation',
              message: `You allocated some meters to ${ms}`,
              email: user.email,
            })
          }
        } catch (error) {
          throw error
        }
        return message
      } else return message
    } else {
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
          map_allocation_to: main.allocation_to,
          destination_store: main.destination_store,
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
        const ms = isArray(main) ? main[0].allocation_to : main.allocation_to
        const inf = isArray(info) ? info[0].store_id : info.store_id
        await create_alert_msg({
          sender: q.abbrv,
          receiver: isArray(main) ? main[0].allocation_to : main.allocation_to,
          logger_type: 'Metering Allocation',
          refID: isArray(info) ? info[0].store_id : info.store_id,
          message: `You allocated some meters to ${ms}. Batch ID: ${inf}`,
          email: user.email,
        })
      }
    }
  } else {
    const parsed = {
      [q.name || 'carton_id']: q.hasId,
      allocation_status: 'In store',
      uploaded_by: q.abbrv,
      limit: q.limit,
    }
    return TryAndCatchUpdates(Metering, main, message, q.hasId, parsed)
  }

  return message
}

exports.ndpp = async (req, message) => {
  const { QUERIES: q, main, user } = req
  if (q.search === 'ALLOCATE') {
    const parsed = {
      [q.name || 'carton_id']: q.hasId,
      allocation_status: 'Allocated',
      map_allocation_to: q.abbrv,
      disco_allocation_to: 'undefined',
      disco_acknowledgement_by: q.abbrv,
      limit: q.limit,
    }

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
      const f74 = main.allocation_customer_id || {}
      const { data, ...exs } = await TryAndCatch(
        Form74,
        {
          disco: q.abbrv,
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
          disco_allocation_to: main.disco_allocation_to,
        })

        const rs = await Form74.UpdateDocument(data._id || data.customer_id, {
          has_allocation: true,
          meter_number: meter.meterNumber,
          meter_owner: meter.meterOwner,
          allocation_date: dateAndTime().currentDate,
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
      const ms = isArray(main)
        ? main[0].disco_allocation_to
        : main.disco_allocation_to
      const inf = isArray(info) ? info[0].store_id : info.store_id
      await create_alert_msg({
        sender: q.abbrv,
        receiver: isArray(main)
          ? main[0].disco_allocation_to
          : main.disco_allocation_to,
        logger_type: 'Metering Allocation',
        refID: isArray(info) ? info[0].store_id : info.store_id,
        message: `You allocated some meters to ${ms}. Batch ID: ${inf}`,
        email: user.email,
      })
    }
  } else {
    const parsed = {
      meter_number: q.hasId,
      allocation_status: 'Allocated',
      map_allocation_to: q.abbrv,
      disco_acknowledgement_by: q.abbrv,
    }
    return TryAndCatchUpdates(Metering, main, message, q.hasId, parsed)
  }

  return message
}
