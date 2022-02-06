import { Heap } from 'heap-js';

function _enforceType({jif, warnings, key, type })
{
	if (type != 'object' && type != 'array')
		throw `type ${type} not implemented`;

	const empty = type == 'object' ? {} : [];

	if (jif[key] === undefined)
		jif[key] = empty;

	if (!(
		typeof jif[key] == 'object'
		&& ((type == 'array') == Array.isArray(jif[key]))
	)) {
		warnings.push(`${key} is not an ${type}`);

		jif[key] = empty;
	}

	if (type == 'array') {
		for (let i = 0; i < jif[key].length; i++) {
			const val = jif[key][i];
			if (typeof val != 'object' || Array.isArray(val)) {
				warnings.push(`${key}[${i}] is not an object`);
				jif[key][i] = {};
			}
		}
	}
}

function _ensureEnoughLimbs({ jif, warnings })
{
	const minLimbs = Math.max(
		...jif.throws.map(t => t.from),
		...jif.throws.map(t => t.to)
	) + 1;

	if (jif.limbs.length < minLimbs) {
		if (jif.limbs.length)
			warnings.push(`not enough limbs specified - needing ${minLimbs}`);
		const missing = minLimbs - jif.limbs.length;
		for (let i = 0; i < missing; i++)
			jif.limbs.push({});
	}
}

/**
 * ensure juggler array is big enough
 * assumes two hands per juggler if no assignments given
 */
function _ensureEnoughJugglers({ jif, warnings })
{
	const maxJuggler = Math.max(...jif.limbs.map(l => l.juggler));
	const minJugglers = isNaN(maxJuggler) ? Math.ceil(jif.limbs.length / 2) : maxJuggler + 1;

	if (jif.jugglers.length < minJugglers) {
		if (jif.jugglers.length)
			warnings.push(`not enough jugglers specified - needing ${minJugglers}`);
		const missing = minJugglers - jif.jugglers.length;
		for (let i = 0; i < missing; i++)
			jif.jugglers.push({});
	}
}

/**
 * complete limb details
 * assumes two hands per juggler if no assignments given
 */
function _completeLimbDetails({ jif, warnings, nJugglers })
{
	jif.limbs.forEach((limb, index) => {
		if (typeof limb.juggler != 'number') {
			if (limb.juggler !== undefined)
				warnings.push(`limb[${index}].juggler is not a number`);
			limb.juggler = index % nJugglers;
		} else if (limb.juggler < 0) {
			warnings.push(`limb[${index}].juggler needs to be positive`);
			limb.juggler = index % nJugglers;
		}

		if (typeof limb.type != 'string') {
			if (limb.type !== undefined)
				warnings.push(`limb[${index}].type is not a string`);
			limb.type = (index < nJugglers ? "right" : "left") + " hand";
		}
	});
}

function _completeJugglerDetails({ jif, warnings, nJugglers })
{
	// excel column name as default name
	const defaultName = i => {
		i++;
		let name = '';
		do {
			let mod = (i - 1) %26;
			name = String.fromCharCode(65 + mod) + name;
			i = Math.floor((i - mod)/ 26);
		} while (i);
		return name;
	};

	jif.jugglers.forEach((juggler, index) => {
		// name
		if (typeof juggler.name != 'string') {
			if (juggler.name !== undefined)
				warnings.push(`jugglers[${index}].juggler is not a string`);

			juggler.name = defaultName(index);
		}

		// position
		const circleRadius = 1.2 + nJugglers * 0.2;
		const a = Math.PI * 2 * index / nJugglers;
		const round = x => Math.round(x * 1000) / 1000;
		const defaultPosition = nJugglers == 1 ? [0, 0, 0] : [round(circleRadius * Math.cos(a)), 0, round(circleRadius * Math.sin(a))];
		let pos = juggler.position;
		if (!Array.isArray(pos)) {
			if (pos !== undefined)
				warnings.push(`jugglers[${index}].position is not an array`);
			juggler.position = defaultPosition;
		} else if (!pos.every(v => typeof v == 'number')) {
			warnings.push(`jugglers[${index}].position should contain numbers only`);
			juggler.position = defaultPosition;
		} else if (pos.length < 2) {
			juggler.position = defaultPosition;
		} else if (pos.length == 2) {
			// only two coordinates are given, take them as x/z and put them on height zero
			pos[2] = pos[1];
			pos[1] = 0;
		}

		// lookAt
		const defaultLookAt = nJugglers == 1 ? [0, 0, 1] : [0, 0, 0];
		let lookAt = juggler.lookAt;
		if (!Array.isArray(lookAt)) {
			if (lookAt !== undefined)
				warnings.push(`jugglers[${index}].lookAt is not an array`);
			juggler.lookAt = defaultLookAt;
		} else if (!lookAt.every(v => typeof v == 'number')) {
			warnings.push(`jugglers[${index}].lookAt should contain numbers only`);
			juggler.lookAt = defaultLookAt;
		} else if (lookAt.length < 2) {
			juggler.lookAt = defaultLookAt;
		} else if (lookAt.length == 2) {
			// only two coordinates are given, take them as x/z and put them on height zero
			lookAt[2] = lookAt[1];
			lookAt[1] = 0;
		}
	});
}


function _completeRepetition({ jif, warnings })
{
	const rep = jif.repetition;

	const defaultLimbPermutation = [...Array(jif.limbs.length).keys()];

	if (typeof rep == 'object') {
		if (rep.period) {
			if (!Array.isArray(rep.limbPermutation)) {
				if (typeof rep.limbPermutation != 'undefined')
					warnings.push("repetition.limbPermutation has unexpected type, setting to identity");
				rep.limbPermutation = defaultLimbPermutation;
			} else if (rep.limbPermutation.length != jif.limbs.length) {
				rep.limbPermutation = defaultLimbPermutation;
				warnings.push("invalid size of repetition.limbPermutation, setting to identity");
			}
		}
	} else if (typeof rep != 'undefined') {
		delete jif.repetition;
		warnings.push("repetition is not an object, removing repetition");
	}

}

function _completeThrowDetails({ jif, warnings })
{
	const nLimbs = jif.limbs.length;

	// ensure types and ranges of important values
	const filtered = jif.throws.filter(t =>
		typeof t == 'object'
		&& typeof t.time     == 'number'
		&& typeof t.duration == 'number'
		&& typeof t.from     == 'number'
		&& typeof t.to       == 'number'
		&& t.time     >= 0
		&& t.duration >= 0
		&& t.from  >= 0
		&& t.to    >= 0
		&& t.from  < nLimbs
		&& t.to    < nLimbs
	);

	if (filtered.length < jif.throws.length) {
		jif.throws = filtered;
		warnings.push((jif.throws.length - filtered.length) + " throws non well-formed - skipped");
	}

	// sort by time (stable sort on modern browsers)
	jif.throws.sort((a, b) => a.time - b.time);


	jif.throws.forEach((t, index) => {
		if (typeof t.label != 'undefined' && typeof t.label != 'string') {
			delete t.label;
			warnings.push("throw @" + t.time + " has non-string label, deleted");
		}

		if (typeof t.prop != 'undefined' && !Number.isInteger(t.prop)) {
			delete t.prop;
			warnings.push("throw @" + t.time + " has non-integer prop, deleted");
		}
	});
}

function _ensureEnoughProps({ jif, warnings, nProps })
{
	if (jif.props.length < nProps) {
		if (jif.props.length)
			warnings.push(`not enough props specified - needing ${nProps}`);
		const missing = nProps - jif.props.length;
		for (let i = 0; i < missing; i++)
			jif.props.push({});
	}
}

function _completePropDetails({ jif, warnings, options })
{
	const propColors = [
		'#c0392b', // red
		'#0c0d5d', // blue
		'#f45d20', // orange
		'#ed4694', // pink
		'#6f5499', // violet
		'#00dc3c', // green
		'#ffd700', // yellow
		'#f2f2f2', // white
	];
	jif.props.forEach((prop, index) => {
		if (typeof prop.color != 'string') {
			if (prop.color !== undefined)
				warnings.push(`prop[${index}].color is not a string`);
			prop.color = propColors[index % propColors.length];
		}
		if (typeof prop.type != 'string') {
			if (prop.type !== undefined)
				warnings.push(`prop[${index}].type is not a string`);
			prop.type = options.propType;
		}
	});
}

function _lcmArray(array) {
	function gcd(a, b) { return !b ? a : gcd(b, a % b); }
	function lcm(a, b) { return (a * b) / gcd(a, b); }
	let multiple = 1;
	array.forEach(function(n) {
		multiple = lcm(multiple, n);
	});
	return multiple;
}

/**
 * complete orbits if not given
 */
function _completeOrbits({ jif, warnings })
{
	// https://stackoverflow.com/a/17369245
	function countDecimals(x) {
		if (Math.floor(x) === x)
			return 0;

		var str = '' + x;
		if (str.indexOf(".") !== -1 && str.indexOf("-") !== -1) {
			return str.split("-")[1] || 0;
		} else if (str.indexOf(".") !== -1) {
			return str.split(".")[1].length || 0;
		}
		return str.split("-")[1] || 0;
	}

	const timePrecision = Math.max(
		0,
		...jif.throws.map(t => countDecimals(t.time)),
		...jif.throws.map(t => countDecimals(t.duration))
	);

	function getKey(thr0w, type) {
		let time = thr0w.time + (type == 'catch' ? thr0w.duration : 0);
		if (jif.repetition.period)
			time = time % jif.repetition.period;
		return time.toFixed(timePrecision) + '|' + thr0w[type == 'catch' ? 'to' : 'from'];
	}


	if (!Array.isArray(jif.orbits))
		jif.orbits = [];

	let warning;
	let seenThrowId = [];
	for (const orbit of jif.orbits) {
		for (const throwId of orbit) {
			if (!Number.isInteger(throwId)) {
				warning = `orbit throw id is not an integer: ${throwId}`;
				break;
			} else if (throwId < 0 || throwId >= jif.throws.length) {
				warning = `orbit throw id out of range: ${throwId}`;
				break;
			} else if (seenThrowId[throwId]) {
				warning = `throw id ${throwId} twice in orbits, overwriting all orbits`;
				break;
			}
			seenThrowId[throwId] = true;
		}

		// check correctness of orbit
		for (let i = 0; i < orbit.length; i++) {
			const currentThrow = jif.throws[orbit[i]];
			const nextThrow = jif.throws[orbit[(i + 1) % orbit.length]];
			if (getKey(currentThrow, 'catch') != getKey(nextThrow, 'throw')) {
				warning = `throws ${currentThrow} and ${nextThrow} cannot be after each other in the same orbit, overwriting all orbits`;
				break;
			}
		}

		if (warning)
			break;
	}
	if (warning) {
		jif.orbits = [];
		seenThrowId = [];
		warnings.push(warning);
	}


	// NOTE: we will use .toFixed(timePrecision) to avoid running into
	//       precision problems like 0.1 + 0.2 == 0.30000000000000004
	const time2events = {};
	for (const [throwId, thr0w] of jif.throws.entries()) {
		for (const type of ['throw', 'catch']) {
			const key = getKey(thr0w, type);

			if (!time2events.hasOwnProperty(key))
				time2events[key] = { throw:[], catch:[] };

			time2events[key][type].push(throwId);
		}
	}

	for (const [time, events] of Object.entries(time2events)) {
		if (events.throw.length != events.catch.length)
			throw `cannot calculate orbits - different number of throws and catches at time ${time}`;
	}

	for (const [throwId, thr0w] of jif.throws.entries()) {
		if (seenThrowId[throwId] || !jif.throws[throwId].duration)
			continue;
		const orbit = [];
		let current = throwId;
		let key;
		do {
			seenThrowId[current] = true;
			orbit.push(current);

			key = getKey(jif.throws[current], 'catch');
			current = time2events[key]['throw'].filter(id => !seenThrowId[id])[0];
		} while (typeof current != 'undefined');

		console.assert(key == getKey(jif.throws[throwId], 'throw')); // orbit should be a loop!

		jif.orbits.push(orbit);
	}
}

function _nProps(jif)
{
	if (jif.repetition)
		return jif.throws
			.map(t => t.duration)
			.reduce((a, b) => a + b, 0)
			/ jif.repetition.period;
	else
		return jif.orbits.length; // without repetition, every orbit is for exactly one prop
}

function _permutationLoopLengths(permutation) {
	const visited = [];
	const result = [];
	for (let i = 0; i < permutation.length; i++) {
		if (visited[i] == 0)
			continue;

		const orbit = [];
		for (let j = i; !visited[j]; j = permutation[j]) {
			orbit.push(j);
			visited[j] = true;
		}
		if (orbit.length)
			result.push(orbit.length);
	}

	return result;
}

function _orbitPeriod(orbit, jif) {
	return orbit
		.map(throwId => jif.throws[throwId].duration)
		.reduce((a, b) => a + b, 0)
		/ jif.repetition.period;
}

function _orbitPeriods(jif) {
	return jif.orbits.map(orbit => _orbitPeriod(orbit, jif));
}

export default class Jif
{
	/**
	 * parse jif from string or object
	 * returns deep clone in case of object
	 */
	static parse(jif) {
		if (typeof jif == 'string')
			jif = JSON.parse(jif);
		else if (typeof jif == 'object')
			jif = JSON.parse(JSON.stringify(jif)); // deep clone
		else
			throw 'failed to parse jif, unexpected type: ' + typeof jif;

		if (Array.isArray(jif))
			throw 'failed to parse jif, should be an object, not an array';

		return jif;
	}

	/**
	 * - fills in defaults
	 * - calculates props
	 *
	 * returns:
	 *  jif:          completed jif
	 *  warnings:     array of warnings
	 *
	 * throws exception in case of errors
	 *
	 */
	static complete(jif, options = {}) {
		options = Object.assign({
			propType: 'club',
			expand: false,
			props: true,
		}, options);

		const warnings = [];
		jif = Jif.parse(jif);

		_enforceType({ jif, warnings, key: 'meta',       type: 'object' });
		_enforceType({ jif, warnings, key: 'jugglers',   type: 'array'  });
		_enforceType({ jif, warnings, key: 'limbs',      type: 'array'  });
		_enforceType({ jif, warnings, key: 'props',      type: 'array'  });
		_enforceType({ jif, warnings, key: 'throws',     type: 'array'  });
		_enforceType({ jif, warnings, key: 'repetition', type: 'object' });

		if (typeof jif.timeStretchFactor != 'number')
			jif.timeStretchFactor = 1;

		_ensureEnoughLimbs({      jif, warnings });
		_ensureEnoughJugglers({   jif, warnings });

		const nJugglers = jif.jugglers.length;
		_completeLimbDetails({    jif, warnings, nJugglers });
		_completeJugglerDetails({ jif, warnings, nJugglers });
		_completeRepetition({     jif, warnings });
		_completeThrowDetails({   jif, warnings });

		if ((options.expand || options.props) && jif.repetition) {
			if (jif.repetition.limbPermutation) {
				const periodCount = _lcmArray(
					_permutationLoopLengths(jif.repetition.limbPermutation)
				);
				jif.throws = Array.from(Jif.generateThrows({ jif, periodCount }));
				jif.repetition.period *= periodCount;
				jif.repetition.limbPermutation = [...Array(jif.limbs.length).keys()];
			}


			if (options.props) {
				_completeOrbits({ jif, warnings })
				const nProps = _nProps(jif);
				_ensureEnoughProps({   jif, warnings, nProps });
				_completePropDetails({ jif, warnings, options });

				if (options.expand) {
					const periodCount = _lcmArray(
						_orbitPeriods(jif)
					);
					jif.throws = Array.from(Jif.generateThrows({ jif, periodCount }));
					jif.repetition.period *= periodCount;

					// NOCOMMIT we should instead set the correct full orbits, to make sure a second complete/expand call does not modify anything!
					delete jif.orbits;
				}
			}
		}
		// TODO: handle options.props in no repetition case

		return { jif, warnings };
	}

	static * generateThrows({jif, periodCount = 0}) {
		const period = jif.repetition && jif.repetition.period;
		let limbPermutation = [...Array(jif.limbs.length).keys()];
		let iteration = 0;
		let baseTime = 0;

		// TODO: prop assignment without repetition

		const orbits = jif.orbits ? jif.orbits : [];
		const iteration2prop = [];
		let prop = 0;
		for (const orbit of orbits) {
			const orbitPeriod = _orbitPeriod(orbit, jif);
			let time = jif.throws[orbit[0]].time;
			for (const throwId of orbit) {
				iteration2prop[throwId] = ((time, prop) => (
					_iteration => prop + ((Math.floor(time / period) - _iteration + orbitPeriod) % orbitPeriod)
				))(time, prop);
				time += jif.throws[throwId].duration;
			}
			prop += orbitPeriod;
		}

		while (true) {
			for (let throwId = 0; throwId < jif.throws.length; throwId++) {
				const thr0w = jif.throws[throwId];

				const overwrite = {
					time: baseTime + thr0w.time,
					to:   limbPermutation[thr0w.to],
					from: limbPermutation[thr0w.from],
					iteration,
				};
				if (iteration2prop[throwId])
					overwrite.prop = iteration2prop[throwId](iteration);
				yield Object.assign({}, thr0w, overwrite);
			}
			if (!period)
				break;
			baseTime += period;
			limbPermutation = limbPermutation.map(v => jif.repetition.limbPermutation[v]);
			iteration++;

			if (periodCount && iteration >= periodCount)
				break;
		}
	}
}
