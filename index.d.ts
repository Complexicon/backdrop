/**
 * creates a new backdrop
 * @async
 * @param {string[]} args args for create function
 * @param {{}} options command line options
 * @param {(hint?: string) => void} helpCallback show help with optional hint 
 */
type CLIHandler = (args: string[], options: any, helpCallback: (hint?: string) => void) => Promise<void> | void;

type CLIObject = {alias: string[], handle: CLIHandler};