#! /usr/bin/env node
//@ts-check

const functions = require('./functions');

const { args, options } = require('./argparser')({ test: true });

function help(hint) {
	console.log(hint);
	console.log()
	console.log('[defaults]');
}

if (args.length > 0 && functions[args[0]])
	functions[args[0]](args.slice(1), options, help);
else help('command not found');