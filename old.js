const net = require('net');

if (process.argv.includes('--detached')) {

	const pty = require('node-pty');

	let buffer = '';

	const subscribers = [];

	const nodePty = pty.spawn('node', []);

	nodePty.onData(function (data) {
		buffer += data;
		for (const socket of subscribers) {
			socket.write(data);
		}
	});

	nodePty.onExit(e => process.exit(e.exitCode));

	net.createServer(function (socket) {
		subscribers.push(socket);
		socket.write(buffer);
		socket.on('data', data => {
			nodePty.write(data.toString('utf8'));
		})

		socket.on('close', () => {
			subscribers = subscribers.filter(v => v !== socket)
		});

	}).listen('.backdrop.sock');
} else {

	try {
		require('fs').accessSync('.backdrop.sock')
	} catch {
		const fork = require('child_process').fork(__filename, ['--detached'], { detached: true, stdio: 'ignore' });

		fork.disconnect();
		fork.unref();

		while (true) {
			try {
				require('fs').accessSync('.backdrop.sock')
				break;
			} catch { }
		}
	}

	const readline = require('readline');
	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);

	const connection = net.connect('.backdrop.sock');

	connection.on('data', data => process.stdout.write(data));

	process.stdin.on('keypress', (_, key) => {
		if (key && key.shift) {
			if (key.name === 'x') process.exit(0);
		}
	})
	process.stdin.pipe(connection);

}