const callEvent = require('../context/events/EmitEvent');
const magic_string = require('../context/events/Types');

const logger = (req, res, next) => {
  callEvent.emit(magic_string.QUERIES, req);
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
      .bold + `  status: ${res.statusCode}`.green.bold
  );

  next();
};

module.exports = logger;
