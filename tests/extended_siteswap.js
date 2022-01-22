import { test } from 'uvu';
import * as assert from 'uvu/assert';
import ExtendedSiteswap from '../src/lib/extended_siteswap.mjs';
import * as fs from 'fs';

function testName(input) {
	return (typeof input) + ' ' + (typeof input == 'string' ? input : JSON.stringify(input));
}

function patternValid(input, options, jif, warnings = []) {
	test(testName(input) + ' expecting valid', () => {
		const e = new ExtendedSiteswap(input);
		assert.ok(e.isValid());
	});
}

function read(path) {
	return fs.readFileSync(path, 'utf8').split("\n");
}

for (const pattern of read('tests/jugglinglab_patterns.txt')) {
	if (pattern[0] == '#' || pattern.match(/[A-Z]|^\s*$/))
		continue; // ignore comments and patterns with bounces

	patternValid(pattern);
}

test.run();
