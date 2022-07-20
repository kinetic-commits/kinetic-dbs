const { dateAndTime } = require('../utils/dateTime')
const CreateUserFranchiseAreas = {
  user_email: {
    type: String,
    rkey: 'references user_data (email)',
  },
  create_at: {
    type: 'Date',
    default: dateAndTime().currentDate_time,
  },
  states: {
    type: String,
    empty: true,
    required: 'User franchise states are required',
  },
}

module.exports = CreateUserFranchiseAreas
