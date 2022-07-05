const { dateAndTime } = require('../utils/dateTime');

const CreateOtherUserInfo = {
  user_email: {
    type: String,
    rkey: 'references user_data (email)',
  },
  role: { type: String, empty: true, required: 'User role is required' },
  abbrv: { type: String, empty: true, required: 'User Abbrv is required' },
  last_login_info: 'Date',
  create_at: {
    type: 'Date',
    default: dateAndTime().currentDate_time,
  },
  password: { type: String, required: 'User password is required' },
};

module.exports = CreateOtherUserInfo;