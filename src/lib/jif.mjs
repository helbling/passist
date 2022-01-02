export default class Jif
{
	static parse(jif) {
		if (typeof jif == 'string')
			jif = JSON.parse(jif);

		if (typeof jif != 'object')
			throw 'failed to parse jif, unexpected type: ' + typeof jif;

		if (Array.isArray(jif))
			throw 'failed to parse jif, should be an object, not an array';

		return jif;
	}

	static _enforceType(obj, warnings, key, type, subtype) {
		if (type != 'object' && type != 'array')
			throw `type ${type} not implemented`;

		const empty = type == 'object' ? {} : [];

		if (obj[key] === undefined)
			obj[key] = empty;

		if (!(
			typeof obj[key] == 'object'
			&& ((type == 'array') == Array.isArray(obj[key]))
		)) {
			warnings.push(`${key} is not an ${type}`);

			obj[key] = empty;
		}

		if (type == 'array') {
			for (let i = 0; i < obj[key].length; i++) {
				const val = obj[key][i];
				if (typeof val != 'object' || Array.isArray(val)) {
					warnings.push(`${key}[${i}] is not an object`);
					obj[key][i] = {};
				}
			}
		}
	}

	/**
	 * - fills in defaults
	 * - calculates props
	 *
	 * returns:
	 *  jif: completed jif
	 *  warnings: array of warnings
	 */
	static complete(jif) {
		const warnings = [];
		jif = Jif.parse(jif);

		// enforce basic types
		Jif._enforceType(jif, warnings, 'meta',        'object');
		Jif._enforceType(jif, warnings, 'jugglers',    'array');
		Jif._enforceType(jif, warnings, 'limbs',       'array');
		Jif._enforceType(jif, warnings, 'props',       'array');
		Jif._enforceType(jif, warnings, 'throws',      'array');
		Jif._enforceType(jif, warnings, 'repetitions', 'array');

		// ensure enough limbs
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

		// ensure enough jugglers
		const maxJuggler = Math.max(...jif.limbs.map(l => l.juggler));
		const minJugglers = isNaN(maxJuggler) ? Math.ceil(jif.limbs.length / 2) : maxJuggler + 1;

		if (jif.jugglers.length < minJugglers) {
			if (jif.jugglers.length)
				warnings.push(`not enough jugglers specified - needing ${minJugglers}`);
			const missing = minJugglers - jif.jugglers.length;
			for (let i = 0; i < missing; i++)
				jif.jugglers.push({});
		}

		const nJugglers = jif.jugglers.length;

		// complete limbs details
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


		// complete jugglers details
		
		// excel column as default name
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


		// TODO: check throws, add prop if needed


		const durationSum = jif.throws.map(t => t.duration).reduce((a, b) => a + b, 0);
		const maxProp = Math.max(...jif.throws.map(t => t.prop));
		const nProps = isNaN(maxProp) ? durationSum / jif.period : maxProp + 1;

		// TODO: handle non-periodic patterns
		if (nProps === Infinity)
			throw "period missing";

		if (jif.props.length < nProps) {
			if (jif.props.length)
				warnings.push(`not enough props specified - needing ${nProps}`);
			const missing = nProps - jif.props.length;
			for (let i = 0; i < missing; i++)
				jif.props.push({});
		}

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
				prop.type = 'club';
			}
		});

		// TODO: ensure every prop referred in throws is defined!

		return { jif, warnings };
	}

	// TODO: repetitions
}
