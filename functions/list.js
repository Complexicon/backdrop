//@ts-check

const { getServices } = require("../utils")

/** @type {CLIObject} */
module.exports = {
	alias: ['list', 'ls'],
	async handle(args, options, help) {

		console.log('list of services:\n');
		for(const service of getServices()) {
			console.log(` * [${service.pid}] '${service.name}' - started at ${new Date(service.time).toLocaleString('de-DE')}`);
		}
		console.log();

	}
}