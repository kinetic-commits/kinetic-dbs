const postgoose = require('../posgoose/Postgoose');
const { dateAndTime } = require('../utils/dateTime');
const { _ide } = require('../utils/idGen');
const { loggerTableOutgoing } = require('./in_&_outs/OutgoingData');

const IssueLoggerSchema = new postgoose();

IssueLoggerSchema.Schema({
  sender: {
    type: String,
    required: 'Sender ID is required',
  },
  receiver: {
    type: String,
    required: 'Receiver ID is required',
  },
  logger_id: {
    type: String,
    pkey: true,
  },
  stage_status: {
    type: String,
    default: 'Registered',
  },
  logger_type: String,
  user_email: String,
  unique_id: {
    type: String,
    required: 'Unique ID is required',
  },
  message: String,
  uploaded_by: {
    type: String,
    required: 'Document owner email is required',
  },
  is_read: {
    type: Boolean,
    default: false,
  },
  create_at: {
    type: 'Date',
    default: dateAndTime().currentDate_time,
  },
  comment: String,
});

IssueLoggerSchema.outGoings(undefined, loggerTableOutgoing);
IssueLoggerSchema.model('issue_logger');

module.exports = IssueLoggerSchema;
