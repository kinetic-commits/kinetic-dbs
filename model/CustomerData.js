const postgoose = require('../posgoose/Postgoose')
const CreateForm74Address = require('./CustomerAddress')
const CreatePropertyDesc = require('./CustomerPropertyDesc')
const {
  OutGoingForUser,
  OutGoingForCustomer,
} = require('./in_&_outs/OutgoingData')
const CreateCustomerInfo = require('./OtherCustomerInfo')
const Form74 = new postgoose()

Form74.Schema({
  user_email: {
    type: String,
    rkey: 'references user_data (email)',
  },
  _id: {
    type: String,
    pkey: true,
  },
  fname: {
    type: String,
    empty: true,
    required: 'Customer names are required',
  },
  lname: {
    type: String,
    empty: true,
    required: 'Customer names are required',
  },
  telephone: {
    type: String,
    empty: true,
    required: 'Customer contact info is required',
  },
  passport_url: String,
  identity_id: {
    type: String,
    empty: true,
    required: 'Customer Identity means is required',
  },
  identity_type: {
    type: String,
    empty: true,
    required: 'Customer identitiy means is required',
  },
  email: String,
})

Form74.getChildEntries([
  {
    parentID: '_id',
    ref: 'customer_id',
    table: 'customer_address',
    item: CreateForm74Address,
  },
  {
    parentID: '_id',
    ref: 'customer_id',
    table: 'customer_property_desc',
    item: CreatePropertyDesc,
  },
  {
    parentID: '_id',
    ref: 'customer_id',
    table: 'other_customer_info',
    item: CreateCustomerInfo,
  },
])

Form74.outGoings(undefined, OutGoingForCustomer)
Form74.model('customer_data')

module.exports = Form74
