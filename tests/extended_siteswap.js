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


const patternTests = [
	['534',            { }],
	['543',            { valid: false }],
	['(6x,4)*',        { notation:'(6x,4)*'}],
	[['(4,2x)*'],      { creationOptions: { individualPatterns:true }, notation:'(4,2x)*'}],
	[['3p33', '234p'], { creationOptions: { individualPatterns:true }, notation: '<3p33|234p>'}],
	['<3p|3p>',        { }],
	['<3p|3p><3|3>',   { notation: '<3p3|3p3>'}],
	['<3p|3p><3|3|3>', { valid: false  }],
	['<(4x,4px)|(4x,4px)>', { notation: '<(4x,4px)|(4x,4px)>' }],
	['<(4x,4px)|(4x,4px)>*', { notation: '<(4x,4px)|(4x,4px)>*' }],
	[['(4x,4px)*', '(4x,4px)(4px,4x)'], { creationOptions: { individualPatterns:true }, notation: '<(4x,4px)(4px,4x)|(4x,4px)(4px,4x)>' }],
	['<(3p,3p)!|(0,0)!><(0,0)!|(3p,3p)!>', { notation:'<(3p,3p)!(0,0)!|(0,0)!(3p,3p)!>' }],
	['<(4x,4px)|(4x,4px)>*', {}],
	[['(4,2)(2x,[44x])'], { creationOptions: { individualPatterns:true }, urlSuffix: '(4,2)(2x,[44x])'}],
];

for (const patternTest of patternTests) {
	const [input, testOptions] = patternTest;
	const inputStr = JSON.stringify(input);

	const extendedSiteswap = new ExtendedSiteswap(input, testOptions.creationOptions ?? {});

	const shouldBeValid = testOptions.valid ?? true;
	test(inputStr + ' validity', () => {
		assert.is(extendedSiteswap.isValid(), shouldBeValid);
	});

	if (!shouldBeValid)
		continue;

	const notation = testOptions.notation ? testOptions.notation : input;
	if (typeof notation === 'string')
		test(inputStr + ' notation', () => {
			assert.is(extendedSiteswap.notation, notation);
		});
	if (testOptions.urlSuffix)
		test(inputStr + ' urlSuffix', () => {
			assert.is(extendedSiteswap.toUrlSuffix(), testOptions.urlSuffix);
		});
}

test.run();
