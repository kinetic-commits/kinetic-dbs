const { OutGoingForUser } = require('../../../model/in_&_outs/OutgoingData');
const CreateUserData = require('../../../model/UserData');
const CreateForm74 = require('../../../model/CustomerData');
const { strip } = require('../../essential');
const QUERIES = require('../../Queries');
const { NM, ND } = require('../../Types');

const parseUserFetch = async ({ req }) => {
  const { body, role, who, abbrv } = await QUERIES(req);
  const who_s_visting = NM() === (role || who) ? true : false;

  if (who_s_visting) {
    const sp = { ...body };
    delete sp['states'];

    const str = strip(body.states);
    const rs = await CreateUserData.find(
      `where other_user_info.role = 'DISCO' and user_address.province in ${str}`
    );
    const b = [...new Set(rs.map((d) => d.abbrv))];

    const vs = b.map((v) => {
      const vl = rs.filter((p) => p.abbrv === v)[0];
      return { abbrv: vl.abbrv };
    });
    return { success: true, msg: vs };
  } else if (who === ND()) {
    const sp = { ...body };
    delete sp['states'];
    const str = strip(body.states);

    const rs0 = OutGoingForUser(
      await CreateUserData.find(
        `where other_user_info.role = 'INSTALLER' and franchisestates.states in ${str}`
      )
    );

    return { success: true, msg: { main: [], installer: rs0 } };
  }
};

module.exports = { parseUserFetch };
