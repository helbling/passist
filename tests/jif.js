import { test } from 'uvu';
import * as assert from 'uvu/assert';
import Jif from '../src/lib/jif.mjs';
import * as fs from 'fs';

function testName(input) {
	return (typeof input) + ' ' + (typeof input == 'string' ? input : JSON.stringify(input));
}

function completeSuccess(input, options, jif, warnings = []) {
	test(testName(input) + ' expecting success', () => {
		const res = Jif.complete(input, options);
		assert.equal(
			{ jif: res.jif, warnings: res.warnings },
			{ jif, warnings }
		);
	});
}

function completeFail(input, expects) {
	test(testName(input) + ' expecting exception', () => {
		assert.throws(
			() => Jif.complete(input),
			expects
		);
	});
}

function read(path) {
	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const emptyJif = {
	meta: {},
	jugglers: [],
	limbs:  [],
	props:  [],
	throws: [],
	repetition:  {},
	"timeStretchFactor": 1
};

completeSuccess('{}', {}, emptyJif);
completeSuccess({},   {}, emptyJif);
completeSuccess({
	meta: 'invalid',
	jugglers: 'invalid',
}, {}, emptyJif, [
	"meta is not an object",
	"jugglers is not an array"
]);

completeFail('{'); // Unexpected end of JSON input
completeFail('"foo"');
completeFail('[]');
completeFail([]);
completeFail(null);

completeSuccess(
	read('tests/jif/holygrail_in.jif'),
	{},
	read('tests/jif/holygrail_out.jif'),
	[],
);

completeSuccess(
	read('tests/jif/holygrail_in.jif'),
	{ "expand": 1 },
	read('tests/jif/holygrail_expanded.jif'),
	[],
);

completeSuccess(
	read('tests/jif/6x4_in.jif'),
	{},
	read('tests/jif/6x4_out.jif'),
	[],
);

completeSuccess(
	read('tests/jif/swinging_door_in.jif'),
	{},
	read('tests/jif/swinging_door_out.jif'),
	[],
);

completeSuccess(
	read('tests/jif/4px_in.jif'),
	{},
	read('tests/jif/4px_out.jif'),
	[],
);

completeSuccess(
	read('tests/jif/5ball_split_multiplex_in.jif'),
	{ propType: 'ball' },
	read('tests/jif/5ball_split_multiplex_out.jif'),
	[],
);

test.run();
