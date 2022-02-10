//@ts-check

const { fork } = require('child_process');
const { randomBytes } = require('crypto');
const { join, resolve } = require('path');
const { writeFile, readdir, readFile } = require('fs/promises');
const { rmSync, write } = require('fs');
const { tmpdir } = require('os');
const pty = require('node-pty');
const net = require('net');

const { socketDir, pipePath, dataEncoder, dataParser } = require('../utils');

/** @type {CLIObject} */
module.exports = {
	alias: ['create', 'c', 'start'],
	async handle(args, options, help) {

		/** @type {string} */
		let serviceName;
		/** @type {string} */
		let commandLine;

		try {
			if (options.config) {
				const config = JSON.parse(await readFile(resolve(options.config), 'utf-8'));
				serviceName = config.name.length && config.name;
				commandLine = config.cmd.length && config.cmd;
			}
		} catch {
			return help('invalid config file!');
		}

		if (args[0]) serviceName = args[0];
		if (args[1]) commandLine = args[1];

		if (!serviceName) return help('no name for service!');
		if (!commandLine) return help('no command line for service!');

		if (process.env.SERVICE) {

			const pipe = require('crypto').randomBytes(20).toString('hex');
			const serviceFile = join(socketDir(), `${process.pid}.bdrp`);

			const cmdLine = commandLine.split(' ');

			/** @type {net.Socket[]} */
			const subscribers = [];
			const dataBuffer = [];
			function writeBuffer(data) {
				subscribers.forEach(socket => socket.write(dataEncoder('TERM', data)))
				dataBuffer.push(data);
				while (dataBuffer.length > 10000) dataBuffer.shift();
			}

			const service = pty.spawn('sh', ['-c', commandLine], { name: 'xterm-256color' });

			service.onExit(e => process.exit(e.exitCode));
			service.onData(writeBuffer);

			net.createServer(function (socket) {
				subscribers.push(socket);

				socket.write(dataEncoder('PROCLOG', dataBuffer.join('')));

				/** @param {Buffer} buffer */
				function onData(buffer) {
					const [op, payload] = dataParser(buffer);
					switch(op) {
						case 'TERM':
							service.write(payload.toString('utf-8'));
							break;
						case 'CLOSE':
							service.kill();
							process.exit();
						default:
							break;
					}
				}

				socket.on('data', onData);
				socket.on('close', () => subscribers.splice(subscribers.indexOf(socket), 1));

			}).listen(pipePath(pipe));

			process.title = `[${serviceName}] backdrop-service`;

			await writeFile(serviceFile, JSON.stringify({ pid: process.pid, pipe, name: serviceName, time: Date.now() }));
			process.on('exit', () => {
				service.kill();
				rmSync(serviceFile);
			});

		} else {
			const child = fork(require.main.filename, process.argv.slice(2), { detached: true, stdio: 'ignore', env: { ...process.env, SERVICE: 'yes' } });
			const pid = child.pid;
			child.disconnect();
			child.unref();

			const serviceFile = await (async function () {
				let waitForService = 0;

				while (waitForService < 50) {
					for (const file of await readdir(socketDir())) {
						if (file.startsWith(pid.toString()))
							return file;
					}
					await new Promise(r => setTimeout(() => r(), 100));
					waitForService++;
				}
				return false;
			})();

			if (serviceFile) {
				console.log(serviceFile);
			} else {
				console.log('process didnt start');
			}

		}
	}
}