import colors from 'ansi-colors';
import fs from 'fs';
import path from 'path';

// Load our own version
import { version } from '../package.json';

console.log(colors.greenBright.bold.underline(`\nuserbot v${version}\n`));

console.log('Environment check:\n');
// First, check if .env is set properly
function printSuccessEnv(text: string) {
    console.log(colors.greenBright('✓ ') + text);
}
function printErrorEnv(text: string) {
    console.log(colors.redBright('✗ ') + text);
}

if (!process.env.TOKEN) {
    printErrorEnv('No TOKEN provided');
} else {
    printSuccessEnv('TOKEN provided');
}

if (!process.env.SUPER_PROPERTIES) {
    printErrorEnv('No SUPER_PROPERTIES provided');
} else {
    printSuccessEnv('SUPER_PROPERTIES provided');
}

if (!process.env.COOKIE) {
    printErrorEnv('No COOKIE provided');
} else {
    printSuccessEnv('COOKIE provided');
}

if (!process.env.TOKEN || !process.env.SUPER_PROPERTIES || !process.env.COOKIE) {
    console.log(`\nPlease set up the environment variables, you can find instructions in the ${colors.cyan('README.md')} file.\n`);
    process.exit(1);
} else {
    console.log('\nEnvironment check passed, you are ready to run the examples.\n');
}

const examples = fs.readdirSync(import.meta.dir).filter((f) => {
    // make sure it's a directory
    return fs.lstatSync(path.join(import.meta.dir, f)).isDirectory();
});

console.log('Available examples:\n');
examples.forEach((example, i) => {
    console.log(`${i + 1}. ${colors.cyan(example)}`);
});

console.log(`\nRun an example with ${colors.gray(`\`bun run examples/${colors.cyan('<example>')}\``)}.\n`);