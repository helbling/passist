import { test } from 'uvu';
import * as assert from 'uvu/assert';
import Jif from '../src/lib/jif.mjs';
import * as fs from 'fs';

function testName(input) {
	return (typeof input) + ' ' + (typeof input == 'string' ? input : JSON.stringify(input));
}

function completeSuccess(input, jif, warnings = []) {
	test(testName(input) + ' expecting success', () => {
		assert.equal(
			Jif.complete(input),
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
	repetitions:  [],
};

completeSuccess('{}', emptyJif);
completeSuccess({},   emptyJif);
completeSuccess({
	meta: 'invalid',
	jugglers: 'invalid',
}, emptyJif, [
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
	read('tests/jif/holygrail_out.jif'),
	[],
);

test.run();
