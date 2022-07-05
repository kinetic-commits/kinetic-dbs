const IssueLoggerSchema = require('../../model/IssueLogger');
const { _transformerID, _ide } = require('../../utils/idGen');

const create_alert_msg = async ({
  sender,
  receiver,
  logger_type,
  refID,
  message,
  comment,
  email,
}) => {
  const id = _transformerID();
  const data = {
    sender,
    receiver,
    logger_type,
    email,
  };

  if (!sender || !receiver || !logger_type || !email)
    throw new Error(`Order creation failed: ${JSON.stringify(data)}`);

  const rs = await IssueLoggerSchema.create({
    sender,
    receiver,
    logger_type: logger_type,
    user_email: email,
    unique_id: refID || id,
    message: message,
    uploaded_by: sender,
    comment,
    logger_id: _ide(),
  });

  console.log(rs);
};

module.exports = { create_alert_msg };
