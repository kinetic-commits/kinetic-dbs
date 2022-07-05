const EventEmitter = require('events');
const QUERIES = require('../../helpers/Queries');
const magic_string = require('./Types');

const callEvent = new EventEmitter();
callEvent.on(magic_string.QUERIES, (req) => QUERIES(req));

module.exports = callEvent;
