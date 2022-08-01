const Metering = require('../../../model/Meter_Data')
const { dateAndTime } = require('../../../utils/dateTime')
const { isArray } = require('../../essentials/usables')
const { create_alert_msg } = require('../../_task/alert_msg')
const { TryAndCatch } = require('../../_task/_task_tools')

exports.mmps = async (req, message) => {
  const { QUERIES: q, main, user } = req

  const rs = await TryAndCatch(Metering, main, message)
  if (message.success) {
    await create_alert_msg({
      sender: q.abbrv,
      receiver: q.abbrv,
      logger_type: 'Meter Uploaded to Virtual Store',
      refID: isArray(main) ? main[0].store_id : main.store_id,
      message: `Metering upload of ${
        isArray(main) ? main.length : 1
      } was successful`,
      email: user.email,
    })
  }
  return rs
}

exports.ndps = async (req, message) => {
  const { QUERIES: q, main, user } = req

  let response = []
  const info = isArray(main) ? main : [main]

  for (let i = 0; i < info.length; i++) {
    const mt = info[i]
    const meter = await Metering.findOne({
      map_allocation_to: q.abbrv,
      meter_number: mt.meter_number,
      disco_acknowledgement: false,
      carton_id: mt.carton_id,
      phase: mt.phase,
    })

    if (meter) {
      await Metering.UpdateDocument(meter.meterNumber, {
        disco_acknowledgement: true,
        disco_acknowledgement_by: q.abbrv,
        acknowledged_date: dateAndTime().currentDate,
      })
      response.push(`${mt.meter_number} moved to store successfully...`)
    }
  }
  const rsf =
    response.length > 0
      ? `${response.length} saved to store successfully...`
      : 'Error: Perharp the meters were not allocated to you'

  message.code = response.length > 0 ? 200 : 400
  message.success = response.length > 0 ? true : false
  message.data = rsf
  message.error = rsf.startsWith('Error: Perharp') ? rsf : message.error

  if (message.success) {
    await create_alert_msg({
      sender: q.abbrv,
      receiver: q.abbrv,
      logger_type: 'Meter Uploaded to Virtual Store',
      message: `Metering upload of ${
        isArray(main) ? main.length : 1
      } was successful`,
      email: user.email,
    })
  }

  return message
}
