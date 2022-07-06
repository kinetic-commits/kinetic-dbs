const { ND, NM } = require('../../../helpers/Types')
const Metering = require('../../../model/Meter_Data')
const User = require('../../../model/UserData')
const { GetUniques } = require('../../essentials/usables')
const { _gp } = require('./aggregation_tools')
const map_dashboard_config = require('./map_dashboard')

const exception_anomally = async (req) => {
  const { skip } = req.QUERIES
  if (skip === 'MAP' || skip === 'DISCO') {
    const users = await User.find({ role: skip })
    const rs =
      users.length > 0
        ? users.map((d) => {
            const name = `${d.fname} ${d.lname !== 'undefined' ? d.lname : ''}`
            return { fullName: name, ...d }
          })
        : []

    return rs
  }
}

module.exports = exception_anomally
