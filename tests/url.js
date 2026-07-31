import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { encodeThrowStyles, decodeThrowStyles} from '../src/lib/utils.mjs';
const throwStyles = [{"what":"spins","value":3},{"limbs":[1,3],"what":"spins","value":1,"label":"3p","ordinal":2},{"what":"dwell","value":0.5,"label":"2"},{"limbs":[0],"label":"3","what":"spins","value":4}];
const throwStylesEncoded = 'spins-3|label-3p~nth-2~limbs-1_3~spins-1|label-2~dwell-0.5|label-3~limbs-0~spins-4';

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
