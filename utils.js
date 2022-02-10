//@ts-check
const { homedir, tmpdir } = require('os');
const { join, extname } = require('path');
const { existsSync, mkdirSync, readdirSync, readFileSync } = require('fs')

const socketDir = join(homedir(), '.backdrop');

/** @typedef {'TERM' | 'PROCLOG' | 'CLOSE'} DataOP */

const utils = {

	socketDir() {
		if (!existsSync(socketDir)) mkdirSync(socketDir)
		return socketDir
	},

	pipePath(pipeName) {
		return process.platform === 'win32' ? join('\\\\?\\pipe', pipeName) : join(tmpdir(), pipeName);
	},

	getServices() {
		const services = [];
		for (const file of readdirSync(utils.socketDir())) {
			if (extname(file) === '.bdrp') {
				try {
					services.push(JSON.parse(readFileSync(join(utils.socketDir(), file), 'utf-8')));
				} catch { }
			}
		}
		return services;
	},

	getService(name) {
		const foundServices = utils.getServices().filter(svc => svc.name === name);
		return foundServices.length > 0 ? (foundServices.length === 1 ? foundServices[0] : foundServices) : false;
	},

	/** @param {Buffer | string} data @param {DataOP} op */
	dataEncoder(op, data) {
		const hdr = Buffer.alloc(8);
		Buffer.from(op, 'utf-8').copy(hdr);
		return Buffer.concat([hdr, (Buffer.isBuffer(data) ? data : Buffer.from(data))]);
	},

	/** @param {Buffer} data @returns {[DataOP | string, Buffer]}*/
	dataParser(data) {
		const hdr = data.slice(0, 8);
		const payload = data.slice(8)
		return [hdr.slice(0, hdr.indexOf(0)).toString('utf-8'), payload];
	}

}

module.exports = utils;