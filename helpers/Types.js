module.exports = {
  FIRSTCLASS: () => {
    const en = process.env.CLASSTAG.split(',');
    return [en[0], en[1], en[2]];
  },
  SECONDCLASS: () => process.env.CLASSTAG.split(',')[3],
  THIRDCLASS: () => process.env.CLASSTAG.split(',')[4],
  FOURTHCLASS: () => process.env.CLASSTAG.split(',')[5],
  FIFTHCLASS: () => process.env.CLASSTAG.split(',')[6],
  SIXCLASS: () => process.env.CLASSTAG.split(',')[7],
  NM: () => process.env.NM,
  ND: () => process.env.ND,
  CREATE_URL: '/api/v1/user',
  LOGIN_URL: '/api/v1/user/login',
  NM_URL: '/api/v1/map',
  NM_URL_CSV: '/api/v1/map/photo-upload',
  ND_URL: '/api/v1/disco',
  ND_URL_CSV: '/api/v1/disco/photo-upload',
  CS_URL: '/api/v1/form74',
  ISSUES: '/api/v1/order',
};
