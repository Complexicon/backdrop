//@ts-check

/**
 * @template T
 * @param {T} defaultOptions 
 * @returns {{args: string[], options: T & { [key: string]: any; }}}
 */
module.exports = function parser(defaultOptions){

	const actualArgs = process.argv.slice(2);

	for(const arg of actualArgs) {
		if(arg.startsWith('--')) {

            actualArgs.splice(actualArgs.indexOf(arg), 1);

			const fullArg = arg.substring(2);
			if(fullArg.length < 1) continue;

			if(fullArg.includes('=')) {

				const [key, value] = fullArg.split('=');

				if(key && value) defaultOptions[key] = value;
				else console.log(`invalid arg "--${key}=${value}"`);
				
				continue;

			}

			defaultOptions[fullArg] = true;

		}
	}

	return { options: defaultOptions, args: actualArgs };

}