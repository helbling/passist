import { test } from 'uvu';
import * as assert from 'uvu/assert';
import Siteswap from '../src/lib/siteswap.mjs';

function gen(params, expected) {
	const result = Array.from(
		Siteswap.generate(params)
	).filter((s) => s !== undefined);

	test(JSON.stringify(params), () => {
		assert.equal(result, expected);
	});
}
const params = {
	minThrow:  2,
	maxThrow:  10,
	include:   "",
	exclude:   "3",
	nJugglers: 2,
}



// pss aka french 3 count compatible
params.cloze = new Siteswap('8_7_6_');

// 1.5 additional props
gen(Object.assign({}, params, { nProps: 5 }), [
	"857262" // 522
]);

// 2.5 additional props
gen(Object.assign({}, params, { nProps: 6 }), [
	"847467", // 744
	"847962", // 942 glass elevator
	"857268", // 825
	"857466", // 654 killer bunny
	"857862", // 852
	"867267", // 726 coconut laden swallow
]);

// 2.5 additional props - now two flips
gen(Object.assign({}, params, { nProps:6, exclude:"3 4.4" }), [
	"847962", // 942 glass elevator
	"857268", // 825
	"857466", // 654 killer bunny
	"857862", // 852
	"867267", // 726 coconut laden swallow
]);

// 3.5 additional props
gen(Object.assign({}, params, { nProps:7 }), [
	"847968", // 948
	"847a67", // a47
	"857868", // 885
	"857a66", // a56
	"867867", // 867 french 3 count
	"867966", // 966 7 club three count
	"8a7467", // a74
	"8a7962", // a29
]);

// 4.5 additional props
gen(Object.assign({}, params, { nProps:8 }), [
	"8a7968", // a89
	"8a7a67", // aa7
]);




// pspss aka why not compatibles
params.cloze = new Siteswap('7_6_7_8_2_');

// 2 additional props
gen(Object.assign({}, params, { nProps:5 }), [
	"7262748527", // 74252
	"7262778227", // 77222 inverted parsnip
	"7562748524", // 55244
	"7562778224", // 75224
]);

// 3 additional props
gen(Object.assign({}, params, { nProps:6 }), [
	"726277892a", // a7292
	"7266778827", // 86772 not why
	"7266778926", // 96672 not likely
	"72667a8527", // a2567
	"7269748827", // 97428 The One to Concentrate
	"7269748926", // 99642
	"72697a8227", // a2297
	"7466778627", // 77466 Jim's 2 count (async)
	"7466778924", // 96474 <-- two flips after eachother
	"7466788527", // 84567
	"7469748627", // 97446
	"7469748924", // 99444 <-- two flips after eachother
	"7469788227", // 97842
	"746a748527", // a7445
	"746a778227", // a7742
	"756277862a", // a7562
	"756278852a", // a8552
	"7566778626", // 75666
	"7566778824", // 86475
	"7566788526", // 85566
	"75667a8524", // a5564
	"7569748626", // 96456
	"7569748824", // 94458
	"7569788226", // 96852
	"75697a8224", // a5294
	"756a748526", // a6455
	"756a778226", // a6752
	"7862778627", // 86277 why not
	"7862778924", // 92478
	"7862788527", // 88527
]);

// 3 additional props no 44
gen(Object.assign({}, params, { nProps:6, exclude:"3 4.4" }), [
	"726277892a", // a7292
	"7266778827", // 86772 not why
	"7266778926", // 96672 not likely
	"72667a8527", // a2567
	"7269748827", // 97428 The One to Concentrate
	"7269748926", // 99642
	"72697a8227", // a2297
	"7466778627", // 77466 Jim's 2 count (async)
	"7466788527", // 84567
	"7469748627", // 97446
	"7469788227", // 97842
	"746a748527", // a7445
	"746a778227", // a7742
	"756277862a", // a7562
	"756278852a", // a8552
	"7566778626", // 75666
	"7566778824", // 86475
	"7566788526", // 85566
	"75667a8524", // a5564
	"7569748626", // 96456
	"7569748824", // 94458
	"7569788226", // 96852
	"75697a8224", // a5294
	"756a748526", // a6455
	"756a778226", // a6752
	"7862778627", // 86277 why not
	"7862778924", // 92478
	"7862788527", // 88527
]);


// 4 additional props
gen(Object.assign({}, params, { nProps:7 }), [
	"72697a892a", // aa299
	"746978892a", // a8499
	"746a77892a", // aa749
	"756978882a", // a8589
	"75697a862a", // aa569
	"756a77882a", // aa758
	"756a7a852a", // aaa55
	"7869788827", // 97888
	"7869788926", // 99688
	"78697a8627", // a8697
	"78697a8924", // a8994
	"786a778827", // a7788
	"786a778926", // a6789
	"786a7a8527", // a85a7
]);


// avoid dupes
gen(Object.assign({}, params, {
	cloze: new Siteswap('7_7_'),
	nProps: 7
}), [
	"7579",
	"7777",
]);

gen(Object.assign({}, params, {
	cloze: new Siteswap('7_7_7_7_'),
	nProps: 7
}), [
	"75777779",
	"75797579",
	"77777777",
]);


test.run();

