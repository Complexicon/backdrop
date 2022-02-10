//@ts-check

/** @type {{[key: string]: CLIHandler}} */
const lookup = {};

/** @param {CLIObject} obj */
const populate = obj => obj.alias.forEach(a => lookup[a] = obj.handle);

populate({alias: ['help', 'h'], handle: (_0,_1,help) => help('you wanted some help!') })
populate(require('./create'));
populate(require('./list'));
populate(require('./log'));
populate(require('./close'));

module.exports = lookup;