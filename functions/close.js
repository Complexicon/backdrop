//@ts-check

const { getService, pipePath, dataParser, dataEncoder } = require("../utils");
const { connect } = require('net');

/** @type {CLIObject} */
module.exports = {
	alias: ['close', 'stop', 'exit', 'terminate'],
	async handle(args, options, help) {

		if (args[0]) {
			const service = getService(args[0]);
			if (service) {

				if (Array.isArray(service)) { /* TODO */ }

				connect(pipePath(service.pipe)).write(dataEncoder('CLOSE', ''));

			} else console.log('service not found!');
		} else help('no service specified!');

	}
}