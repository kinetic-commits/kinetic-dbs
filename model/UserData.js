const postgoose = require('../posgoose/Postgoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OutGoingForUser } = require('./in_&_outs/OutgoingData');
const CreateOtherUserInfo = require('./OtherUserInfo');
const CreateUserAddress = require('./UserAddress');
const CreateUserFranchiseAreas = require('./UserFranchise');
const { isArray } = require('../posgoose/tool');
const User = new postgoose();

User.Schema({
  email: {
    type: String,
    pkey: true,
    required: 'User email is required',
  },
  fname: { type: String, empty: true, required: 'User names are required' },
  lname: { type: String, empty: true, required: 'User names are required' },
  telephone: {
    type: String,
    empty: true,
    required: 'User contact info is required',
  },
  passport_url: String,
  identity_id: {
    type: String,
    empty: true,
    required: 'User Identity means is required',
  },
  identity_type: {
    type: String,
    empty: true,
    required: 'User identitiy means is required',
  },
});

User.getChildEntries([
  {
    ref: 'user_email',
    parentID: 'email',
    table: 'other_user_info',
    item: CreateOtherUserInfo,
  },
  {
    ref: 'user_email',
    parentID: 'email',
    table: 'user_address',
    item: CreateUserAddress,
  },
  {
    ref: 'user_email',
    parentID: 'email',
    table: 'franchisestates',
    item: CreateUserFranchiseAreas,
  },
]);

User.outGoings(undefined, OutGoingForUser);
User.pre(undefined, async (data_) => {
  const rs = [];
  if (isArray(data_)) {
    for (let i = 0; i < data_.length; i++) {
      const data = data_[i];
      const salt = await bcrypt.genSalt(10);
      const password_string = await bcrypt.hash(data.password, salt);
      data.password = password_string;
      data.states = data.franchiseStates
        ? data.franchiseStates.join()
        : undefined;
      rs.push(data);
    }
  }
  return rs;
});

User.method(async function matchPassword(data, option) {
  const _ = isArray(data) ? data[0] : data;
  const itMatched = await bcrypt.compare(option, _.password);
  return itMatched;
});

User.method(function userSignature(data) {
  const _ = isArray(data) ? data[0] : data;
  return jwt.sign(
    {
      _id: _.email,
    },
    process.env.QQ,
    { expiresIn: 336000 }
  );
});

User.model('user_data');

module.exports = User;
