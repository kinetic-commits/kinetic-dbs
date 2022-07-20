const { dateAndTime } = require('../utils/dateTime')

const CreateOtherUserInfo = {
  user_email: {
    type: String,
    rkey: 'references user_data (email)',
  },
  role: { type: String, empty: true, required: 'User role is required' },
  abbrv: { type: String, empty: true, required: 'User Abbrv is required' },
  shared_profile: {
    type: Boolean,
    default: false,
  },
  right_to_share_profile: {
    type: Boolean,
    default: false,
  },
  parent_user: String,
  parent_user_role: String,
  is_disabled: {
    type: Boolean,
    default: false,
  },
  user_key: String,
  email_verified: {
    type: Boolean,
    default: false,
  },
  last_login_info: 'Date',
}

module.exports = CreateOtherUserInfo
