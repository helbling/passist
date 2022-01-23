import { test } from 'uvu';
import * as assert from 'uvu/assert';
import ExtendedSiteswap from '../src/lib/extended_siteswap.mjs';
import * as fs from 'fs';

function patternValid(extendedSiteswap, options, jif, warnings = []) {
	test(extendedSiteswap.input + ' expecting valid', () => {
		assert.ok(extendedSiteswap.isValid());
	});
}

function read(path) {
	return fs.readFileSync(path, 'utf8').split("\n");
}


const longVanilla = [];
for (const pattern of read('tests/jugglinglab_patterns.txt')) {
	if (pattern[0] == '#' || pattern.match(/[A-Z]|^\s*$/))
		continue; // ignore comments and patterns with bounces

	const extendedSiteswap = new ExtendedSiteswap(pattern);

	patternValid(extendedSiteswap);

	if (pattern.length > 10 && extendedSiteswap.isVanillaSiteswap)
		longVanilla.push(pattern);
}

test('vanilla siteswap test', () => {
	assert.equal(longVanilla, [
		'666677477466774667747746666774',
		'9669669969929962',
		'aaaaaab9aaaab9ab9aaaab9a',
		'b9aab939abb6a69',
		'bbbcc933aaac993',
		'fk00g0jl00el00',
		'j00hc000mg00c0e0'
	]);
});

test.run();
