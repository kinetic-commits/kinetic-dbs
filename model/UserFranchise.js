const CreateUserFranchiseAreas = {
  user_email: {
    type: String,
    rkey: 'references user_data (email)',
  },
  states: {
    type: String,
    empty: true,
    required: 'User franchise states are required',
  },
};

module.exports = CreateUserFranchiseAreas;
