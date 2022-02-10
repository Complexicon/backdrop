//@ts-check

const { connect } = require("net");
const { getService, pipePath, dataParser } = require("../utils")

/** @type {CLIObject} */
module.exports = {
	alias: ['log', 'logs'],
	async handle(args, options, help) {
		if (args[0]) {
			const service = getService(args[0]);
			if (service) {

				if (Array.isArray(service)) { /* TODO */ }

				const socket = connect(pipePath(service.pipe));

				socket.once('data', d => {
					const [op, payload] = dataParser(d);

					if(op === 'PROCLOG') {
						process.stdout.write(payload);
						socket.destroy();
					}

				})

			} else console.log('service not found!');
		} else help('no service specified!');
	}
}