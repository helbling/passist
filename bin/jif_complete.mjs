#!/usr/bin/env node

import Jif from '../src/lib/jif.mjs';
import * as fs from 'fs';

const filename = process.argv[2]
if (!filename) {
	console.log("usage: jif_complete.mjs filename");
	process.exit(1)
}

const jif = JSON.parse(fs.readFileSync(filename, 'utf8'))

const result = Jif.complete(jif);
console.log(JSON.stringify(result.jif, null, 2));
for (const warning of result.warnings)
	console.error(warning);
