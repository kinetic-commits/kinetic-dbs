const IssueLoggerSchema = require('../../../model/IssueLogger')
const Metering = require('../../../model/Meter_Data')
const { create_alert_msg } = require('../../_task/alert_msg')
const { TryAndCatch } = require('../../_task/_task_tools')

const re_mmpp = async (req, message) => {
  const { QUERIES: q, main, user } = req
  const parsed = {
    meter_number: q.hasId,
    uploaded_by: q.abbrv,
  }

  const { success } = await TryAndCatch(Metering, parsed, message, 'findOne')

  if (!success) return message

  const rs = await Metering.UpdateDocument(q.hasId, {
    replace_with_id: main.replace_with_id,
  })

  const fai = rs.startsWith('Document UPDATE with keyID')
  if (!fai) {
    message.error = 'REPORT FAIL: 500'
    message.success = false
    return message
  }

  message.code = 200
  message.success = true
  message.data = rs

  if (message.success) {
    const rs = await IssueLoggerSchema.findOne({ unique_id: q.hasId })
    rs &&
      (await IssueLoggerSchema.UpdateDocument(rs.logger_id, {
        stage_status: 'Being Processed',
      }))
    return message
  }

  return message
}

const re_ndpp = async (req, message) => {
  const { QUERIES: q, main, user } = req
  if (q.search === 'FAULT') {
    const parsed = {
      meter_number: q.hasId,
      map_allocation_to: q.abbrv,
      disco_acknowledgement_by: q.abbrv,
    }

    const { success } = await TryAndCatch(Metering, parsed, message, 'findOne')

    if (!success) return message

    const rs = await Metering.UpdateDocument(q.hasId, {
      needs_replacement: true,
      replacement_reason: main.replacement_reason,
    })

    const fai = rs.startsWith('Document UPDATE with keyID')
    if (!fai) {
      message.error = 'REPORT FAIL: 500'
      message.success = false
      return message
    }

    message.code = 200
    message.success = true
    message.data = rs

    if (message.success) {
      await create_alert_msg({
        sender: q.abbrv,
        refID: q.hasId,
        receiver: main.receiver,
        logger_type: main.logger_type,
        message:
          main.message ||
          main.replacement_reason ||
          `This is to notify you that ${q.abbrv} has reported this meter faulty for replacement`,
        comment: main.replacement_reason,
        email: user.email,
      })
      return message
    }
  } else if (q.search === 'FAULT-ACKNOWLEDGE') {
    const vv = await Metering.UpdateDocument(q.hasId, {
      replace_acknowledged: true,
    })
    if (vv) {
      const rs = await IssueLoggerSchema.findOne({ unique_id: q.hasId })
      rs &&
        (await IssueLoggerSchema.UpdateDocument(rs.logger_id, {
          stage_status: 'Resolved',
        }))
    }
  }

  return message
}

const FIELD_ACTIVITIES = async (req, message) => {
  const { QUERIES: q } = req

  if (q.search === 'FAULT') return await re_ndpp(req, message)
  if (q.search === 'REPLACEMENT') return await re_mmpp(req, message)
  else return message
}

module.exports = FIELD_ACTIVITIES
