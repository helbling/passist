import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { encodeThrowStyles, decodeThrowStyles} from '../src/lib/utils.mjs';
const throwStyles = [{"what":"spins","value":"3"},{"jugglers":"1","what":"spins","value":"1","label":"3p","ordinal":2},{"jugglers":"-1","what":"dwell","value":"0.5","label":"2"}];
const throwStylesEncoded = '~~~spins~3|3p~2~1~spins~1|2~~-1~dwell~0.5';

test('encodeThrowStyles', () => {
	assert.equal(
	  encodeThrowStyles(throwStyles),
	  throwStylesEncoded,
	);
});

test('decodeThrowStyles', () => {
	assert.equal(
	  decodeThrowStyles(throwStylesEncoded),
	  throwStyles,
	);
});

test.run();
