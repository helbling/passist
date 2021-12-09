<script context="module">
	export const ssr = false;
</script>

<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { defaults, baseUrl } from '$lib/passist.mjs';
	import Icon from '$lib/Icon.svelte';
	import InputField from '$lib/InputField.svelte';
	import { browser } from '$app/env';
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';


	export let jif;
	export let teaser = true;
	export let closeButton = false;
	export let enableSettings = false;
	export let initialFullscreen = false;
	export let valid = true;
	export let jugglingSpeed = defaults.jugglingSpeed;
	export let animationSpeed = defaults.animationSpeed;
	export let showOrbits = false;
	export let resolution = 'medium';

	//	let animation;
	let paused = false;
	let loaded = false;
	let canvas;
	let container;
	let dragging = false;
	let dragStart;
	let fps = '';
	let fpsInterval;
	let animationJif;
	let showSettings = false;
	let isFullscreen = false;
	let isMaximized = false;
	let isFull = false;
	let animationOptions = {};
	let width;
	let height;
	let pixelRatio = 1;

	const noop = () => {};
	const maximize = () => {
		isMaximized = true;
		return new Promise((resolve, reject) => {
			resolve()
		})
	};
	const unmaximize = () => { isMaximized = false;  };

	let requestFullscreen = maximize;
	let exitFullscreen = unmaximize;

	$: animationJif = JSON.parse(JSON.stringify(jif)); // deep clone
	$: pixelRatio = { low:0.5, medium:1, high:2 }[resolution];
	$: animationOptions = { valid, jugglingSpeed, animationSpeed, showOrbits };
	$: sizeOptions = { width, height, pixelRatio };

	const dispatch = createEventDispatcher();

	$: {
		isFull = isFullscreen || isMaximized;
		dispatch('fullscreenchange', isFull);
	}

	const onFullscreenChange = e => {
		isFullscreen = (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) === container;
	};
	onMount(async () => {
		//		const Animation = (await import('$lib/animation.mjs')).default; // dynamic import, only on browser

		//animation = new Animation(canvas, animationJif, animationOptions, sizeOptions);
		loaded = true;
		//fpsInterval = setInterval(() => fps = animation.fps, 1000);

		requestFullscreen = () => {
			const requestFS = (
				container.requestFullscreen ||
				container.mozRequestFullScreen ||
				container.webkitRequestFullscreen ||
				container.msRequestFullscreen ||
				maximize
			).bind(container);
			requestFS().catch(e => {
				maximize();
			});
		};

		exitFullscreen = () => {
			if (isMaximized) {
				unmaximize();
			} else {
				(
					document.exitFullscreen ||
					document.mozCancelFullScreen ||
					document.webkitExitFullscreen ||
					document.msExitFullscreen ||
					noop
				).bind(document)();
			}
		};

		document.addEventListener("fullscreenchange", onFullscreenChange);

		if (initialFullscreen)
			requestFullscreen();

		setTimeout(() => {
			const containerRect = container.getBoundingClientRect();
			if (containerRect.width != width || containerRect.height != height) {
				width = containerRect.width;
				height = containerRect.height;
			}
		}, 1);
	});

	onDestroy(() => {
		//		if (animation) {
		//	animation.destroy();
		//	animation = undefined;
		//}
		if (fpsInterval)
			clearInterval(fpsInterval);

		if (browser === true)
			document.removeEventListener("fullscreenchange", onFullscreenChange);
	});

	//	$: if (browser === true && animation) { animation.updateScene(animationJif, animationOptions); }
	//$: if (browser === true && animation) { animation.resize(sizeOptions); }
	$: if (browser === true) { document.body.style.overflow = isMaximized ? 'hidden' : 'auto'; }

	function togglePause() {
		//if (animation)
		//	paused = animation.togglePause();
	}

	function handleEvent(e) {
		return (isFull || !teaser) && e.target.tagName == "CANVAS";
	}
	function onDown(e) {
		if (!handleEvent(e))
			return;
		if (showSettings) {
			showSettings = false;
			return;
		}
		dragging = false;
		dragStart = [e.clientX, e.clientY];
	}
	function onMove(e) {
		if (!handleEvent(e))
			return;
		if (
			dragStart && (
				Math.abs(e.clientX - dragStart[0]) > 10 ||
				Math.abs(e.clientY - dragStart[1]) > 10
			))
				dragging = true;
	}
	function onUp(e) {
		dragStart = undefined;
		if (dragging || !handleEvent(e))
			return;
		togglePause();
	}
	function onKeyDown(e) {
		if (e.key == ' ')
			togglePause();
		if (isFull && e.key == 'Escape')
			exitFullscreen();
	}


	const hu = 0.21;
	const jugglerHeight  = 8    * hu;
	const shoudlerWidth  = 2    * hu;
	const shoulderHeight = 6.67 * hu;
	const crotchHeight   = 4    * hu;
	const upperArmLength = 1.7  * hu;
	const lowerArmLength = 1    * hu;
	const handLength     = 0.8  * hu;
	const footLength     = 1.5  * hu; // original: 1.14
	const footWidth      = 0.8  * hu; // original: 0.46
	const gravity = -9.8;

	const colors = {
		sky: '#24b59f',
		horizon: '#eff9b7',
		fog: '#ffffee',
		ground1: '#937a24',
		ground2: '#987d2e',
		meeseeks: '#5fcaf6',
	};
	const background = new THREE.Color().setHSL(0.6, 0, 1);
	const fog = new THREE.Fog(background, 50, 1000);
	fog.color.copy( new THREE.Color(colors.fog));

	const timer = {dt: 0};

	const clubGeometry = pirouetteGeometry();
	let bbox = new THREE.Box3(v3(0, 0, 0), v3(0, 0, 0));
	let jugglers = [];
	let props = [];

$: {
		jugglers = [];
		for (const juggler of animationJif.jugglers) {
			const j = new Juggler(resourceUrl(valid ? '/images/face_texture.png' : '/images/panic_face_texture.png'));
			j.position.set(...juggler.position);
			j.lookAt(...juggler.lookAt);
			if (!valid) {
				// j.lookAt(camera.position.clone().setY(0)); // TODO: need to have access to the camera object..
				j.panic();
			}

			jugglers.push(j);
			bbox.expandByObject(j);
		}
	}

$: {
	props = [];
	for (const prop of animationJif.props) {
		const type = prop.type || "club";
		const color = propColor(prop, animationJif)

		const mesh = type == 'ball' ?
			new THREE.Mesh(
				new THREE.SphereBufferGeometry( 0.04, 10, 10 ),
				new THREE.MeshToonMaterial({color: color} )
			)
			: new THREE.Mesh(
				clubGeometry,
				new THREE.MeshToonMaterial({
					map: clubTexture({body: color})
				})
			);
		props.push({
			mesh: mesh,
			throws: []
		});
	}
	for (const t of animationJif.throws)
		if (t.duration > 0 && t.prop !== undefined)
			props[t.prop].throws.push(t);
}

	SC.onFrame(() => {
		const t = performance.now(); // web page time [ms]
		// TODO: animate
	});

	function propColor(prop, jif)
	{
		return prop.color || (jif.defaults && jif.defaults.prop && jif.defaults.prop.color) || "white";
	}

	function sideFactor(side)
	{
		// 0: right/positive, 1: left/negative
		return side ? 1 : -1;
	}

	function v3(x, y, z)
	{
		return new THREE.Vector3(x, y, z);
	}

	function pirouetteGeometry()
	{
		const c = [
			-0.50625,-0.39822,-0.74566,-0.8929,-0.87587,-1.8098,
			-0.0986,-0.69398,-0.73198,-3.46444,-1.4076,-6.15658,
			-1.16772,-4.65299,-1.22766,-5.07124,-1.21338,-8.46666,
			0.0135,-3.221474,0.18572,-4.506304,1.75504,-13.096884,
			1.92503,-10.53774,1.87475,-9.93831,2.57469,-30.69166,
			0.38738,-11.48576,0.35211,-14.93884,-0.15836,-15.50291,
			-0.69207,-0.76472,-0.77874,-2.3899,-0.16771,-3.1445,
			0.44666,-0.55159,0.75445,-0.64878,2.07704,-0.65584,
			1.99561,-0.0106,2.91938,0.25496,3.28905,0.94569,
			0.3975,0.74274,0.10051,2.16618,-0.64055,3.07008,
			-0.59264,0.72286,-0.59962,0.80978,-0.40963,5.10102,
			0.1063,2.40109,0.26813,9.18765,0.35962,15.08125,
			0.0915,5.89359,0.28645,12.14437,0.43324,13.89062,
			0.15121,1.79881,1.02204,6.95952,2.00909,11.90625,
			2.48978,12.47795,2.50286,14.030914,0.19489,23.133044,
			-0.64322,2.53671,-1.16949,4.80791,-1.16949,5.04711,
			0,0.23919,-0.30709,0.72355,-0.68243,1.07634,
			-0.59338,0.55773,-0.98179,0.65317,-2.97669,0.73143,
			//-2.00164,0.0785,-2.38313,0.0201,-2.99095,-0.458
		];

		const path = new THREE.Path();
		for (let i = 0; i < c.length / 6; i++) {
			const a = path.currentPoint;
			path.bezierCurveTo(
				a.x + c[i*6 + 0] - 0.2, a.y + c[i*6 + 1],
				a.x + c[i*6 + 2] - 0.2, a.y + c[i*6 + 3],
				a.x + c[i*6 + 4] - 0.2, a.y + c[i*6 + 5]
			);
		}

		const samples = 100;
		let points = [];
		for (let i = 0; i < samples; i++)
			points.push(path.getPoint(i / (samples - 1)));

		const factor = 0.52 / 79.97; // 79.97 units, 0.52m irl
		return new THREE.LatheBufferGeometry(points)
			.scale(factor, factor, factor)
			.center();
	}

	function clubTexture(clubColors = {})
	{
		const darkgray = 0x2c3e50;
		clubColors = Object.assign({
			top:    darkgray,
			body:   colors.meeseeks,
			tape:   darkgray,
			handle: 0xf2f2f2,
			knob:   darkgray,
		}, clubColors);

		const canvas = document.createElement('canvas');
		canvas.width  = 1;
		canvas.height = 100;
		const ctx = canvas.getContext("2d");

		const stops = [
			[3,  clubColors.top    ],
			[25, clubColors.body   ],
			[27, clubColors.tape   ],
			[47, clubColors.handle ],
			[99, clubColors.knob   ],
		];

		let y0 = 0;
		for (const stop of stops) {
			const y1 = stop[0];
			ctx.fillStyle = '#' + (new THREE.Color(stop[1])).getHexString();
			ctx.fillRect(0, y0, 1, y1 - y0);
			y0 = y1;
		}

		const tex = new THREE.CanvasTexture(canvas);
		tex.encoding = THREE.sRGBEncoding;
		tex.magFilter = THREE.NearestFilter;
		tex.minFilter = THREE.NearestFilter;
		return tex;
	}

	function resourceUrl(url)
	{
		return baseUrl + url;
	}

	class Juggler extends THREE.Group
	{

	constructor(faceTexture)
	{
		super();
		const pirouette = pirouetteGeometry();

		const bodyMaterial = new THREE.MeshToonMaterial({
			color: new THREE.Color(colors.meeseeks),
		});
		const headMaterial = bodyMaterial.clone();
		this.headMaterial = headMaterial;
		(new THREE.TextureLoader()).load(
			faceTexture,
			function( texture ) {
				texture.anisotropy = 8;
				texture.encoding = THREE.sRGBEncoding;
				headMaterial.map = texture;
				headMaterial.color = undefined;
				headMaterial.needsUpdate = true;
			}
		);
		(new THREE.TextureLoader()).load(
			resourceUrl('/images/meeseeks_blue.png'),
			function( texture ) {
				texture.encoding = THREE.sRGBEncoding;
				bodyMaterial.map = texture;
				bodyMaterial.color = undefined;
				bodyMaterial.needsUpdate = true;
			}
		);

		const pirouetteSize = new THREE.Vector3();
		pirouette.computeBoundingBox();
		pirouette.boundingBox.getSize(pirouetteSize);

		const head = new THREE.Mesh(
			pirouette
				.clone()
				.scale(
					1 * hu / pirouetteSize.x,
					3 * hu / pirouetteSize.y,
					1 * hu / pirouetteSize.z)
				.rotateY(Math.PI)
				.center()
				.translate(0, shoulderHeight + 0.5 * hu, 0),
			headMaterial
		);
		this.add(head);

		const torso = new THREE.Mesh(
			new THREE.TubeBufferGeometry(
				new THREE.LineCurve3(
					v3(0, shoulderHeight, 0),
					v3(0, crotchHeight, 0)
				), 2, hu, 16, false
			),
			bodyMaterial
		);
		torso.scale.z = 0.6;
		this.add(torso);

		const sphere = new THREE.SphereBufferGeometry(0.5, 16, 10);

		const upperArmGeometry = new THREE.TubeBufferGeometry(
			new THREE.LineCurve3(
				v3(0, 0, 0),
				v3(0, 0, upperArmLength)
			), 2, 0.3 * hu, 16, false
		);
		const lowerArmGeometry = new THREE.TubeBufferGeometry(
			new THREE.LineCurve3(
				v3(0, 0, 0),
				v3(0, 0, lowerArmLength)
			), 2, 0.3 * hu, 16, false
		);
		this.shoulders = [];
		this.upperArms = [];
		this.lowerArms = [];
		for (let side = 0; side < 2; side++) {
			const shoulder = new THREE.Object3D().rotateX(Math.PI / 2).rotateY(sideFactor(side) * Math.PI / 20);
			shoulder.position.set(sideFactor(side) * hu, shoulderHeight, 0);
			this.shoulders.push(shoulder);
			this.add(shoulder);
			const upperArm = new THREE.Mesh(upperArmGeometry, bodyMaterial);
			this.upperArms.push(upperArm);
			shoulder.add(upperArm);

			const elbow = new THREE.Object3D();
			elbow.position.z = upperArmLength;
			upperArm.add(elbow);

			elbow.add(new THREE.Mesh(
				sphere.clone().scale(0.6 * hu, 0.6 * hu, 0.6 * hu),
				bodyMaterial
			));

			const lowerArm = new THREE.Mesh(lowerArmGeometry, bodyMaterial);
			this.lowerArms.push(lowerArm);
			elbow.add(lowerArm);

			lowerArm.add(new THREE.Mesh(
				sphere.clone().scale(0.6 * hu, 0.6 * hu, 0.6 * hu).translate(0, 0, lowerArmLength),
				bodyMaterial
			));

			// hand
			lowerArm.add(new THREE.Mesh(
				sphere.clone().scale(0.4 * hu, 0.5 * hu, handLength).rotateZ(-sideFactor(side) * Math.PI / 4).translate(0, 0, lowerArmLength + handLength / 2),
				bodyMaterial
			));
		}

		const rightLeg = new THREE.Mesh(
			new THREE.TubeBufferGeometry(
				new THREE.LineCurve3(
					v3(- hu / 2, crotchHeight, 0),
					v3(- hu, 0, 0)
				), 2, 0.4 * hu, 16, false),
			bodyMaterial
		);
		const leftLeg = rightLeg.clone();
		leftLeg.scale.x *= -1;
		this.add(rightLeg);
		this.add(leftLeg);

		let shoulder = new THREE.Mesh(
			sphere.clone().scale(1.4 * shoudlerWidth, 0.4 * shoudlerWidth, 0.6 * shoudlerWidth).translate(0, shoulderHeight, 0),
			bodyMaterial
		);
		this.add(shoulder);
		let crotch = new THREE.Mesh(
			sphere.clone().scale(shoudlerWidth, 0.2 * shoudlerWidth, 0.5 * shoudlerWidth).translate(0, crotchHeight, 0),
			bodyMaterial
		);
		this.add(crotch);

		let rightFoot = new THREE.Mesh(
			sphere.clone().scale(footWidth, footWidth / 2, footLength).translate(- hu, 0, 0.2 * footLength),
			bodyMaterial
		);
		let leftFoot = rightFoot.clone();
		leftFoot.scale.x *= -1;
		this.add(rightFoot);
		this.add(leftFoot);
	}

	get facing()
	{
		return v3(0, 0, 1).applyQuaternion(this.quaternion);
	}

	throwCatchBasePosition(side)
	{
		const forwardDistance = lowerArmLength + handLength;
		const sideDistance = shoudlerWidth / 2;

		return this.position.clone().add(
			this.facing.clone()
			.multiplyScalar(forwardDistance)
		).add(
			this.facing.clone()
			.cross(v3(0, -sideFactor(side), 0))
			.multiplyScalar(sideDistance)
		);
	}

	throwPosition(side)
	{
		return this.throwCatchBasePosition(side)
			.add(
				v3(0, shoulderHeight - 2 * hu, 0)
			).add(
				this.facing.clone()
				.cross(v3(0, sideFactor(side), 0))
				.multiplyScalar(0.1)
			);
	}

	catchPosition(side)
	{
		return this.throwCatchBasePosition(side)
			.add(
				v3(0, shoulderHeight, 0)
			).add(
				this.facing.clone()
				.cross(v3(0, -sideFactor(side), 0))
				.multiplyScalar(0.1)
			);
	}

	setHandPosition(side, handPos)
	{
		// calculate elbow
		// s: shoulder
		// e: ellbow
		// h: hand
		// b: base point
		//
		// s--b--h
		//  \ | /
		//   \|/
		//    e

		const shoulder = this.shoulders[side];
		const shoulderPos = new THREE.Vector3();
		shoulder.getWorldPosition(shoulderPos);

		const sh = handPos.distanceTo(shoulderPos);
		const se = upperArmLength;
		const eh = lowerArmLength + handLength;
		const obtuseAtS = Math.pow(eh, 2) > Math.pow(sh, 2) + Math.pow(se, 2);

		if (sh <= se + eh) {
			// calculate radius (height of triangle)
			// area = 1/2 * sh * be   (area formula)
			// area = sqrt(s * (s - sh) * (s - se) * (s - eh)) (herons formula)
			const s = (sh + se + eh) / 2;
			const be = 2 * Math.sqrt(s * (s - sh) * (s - se) * (s - eh)) / sh; // TODO: handle case sh == 0
			const sb = Math.sqrt(Math.pow(se, 2) - Math.pow(be, 2));

			const sToh = handPos.clone().sub(shoulderPos).normalize();
			const basePosRel = sToh.clone().multiplyScalar((obtuseAtS ? -1 : 1) * sb);
			const basePosWorld = shoulderPos.clone().add(basePosRel);

			const jugglerQuaternion = this.quaternion; // already in reference to world
			const elbowPos = basePosWorld.clone().add(
				sToh.clone()
				.cross(
					v3(-1, 0.3 * -sideFactor(side), 0).normalize()
					.applyQuaternion(jugglerQuaternion)
				).multiplyScalar(be)
			);
			this.upperArms[side].lookAt(elbowPos);
			this.lowerArms[side].lookAt(handPos);
		} else {
			// prop not reachable, reach as far as we can
			this.upperArms[side].lookAt(handPos);
			this.lowerArms[side].lookAt(handPos);
		}
	}

	panic()
	{
		for (let side = 0; side < 2; side++) {
			this.upperArms[side].lookAt(
				this.position.clone().add(
					this.facing.clone()
					.cross(v3(0, -sideFactor(side), 0))
					.multiplyScalar(2 * hu)
				).add(v3(0, jugglerHeight, 0))
			);
			this.lowerArms[side].lookAt(
				this.position.clone().add(
					v3(0, jugglerHeight + 0.5 * hu, 0)
				)
			);
		}
	}


	} // end Juggler


	class ThrowCurve extends THREE.Curve
	{

	constructor(p)
	{
		super();
		this.type = 'ThrowCurve';
		for (const [k, v] of Object.entries(p))
			this[k] = v;

		this.v0 = p.catchPos.clone()
			.sub(p.throwPos)
			.divideScalar(this.duration)
			.setY((p.catchPos.y - p.throwPos.y - gravity * Math.pow(p.duration, 2) / 2) / p.duration);

		this.v1 = this.v0.clone().setY(this.v0.y + gravity * p.duration);

		this.rotationSpeed = (this.catchAngle - this.throwAngle + this.nSpins * 2 * Math.PI) / this.duration;
	}

	getPoint(t, optionalTarget)
	{
		const dt = t * this.duration;

		const point = optionalTarget || new THREE.Vector3();
		point.set(
			(1 - t) * this.throwPos.x + t * this.catchPos.x,
			this.throwPos.y + this.v0.y * dt + gravity * Math.pow(dt, 2) / 2,
			(1 - t) * this.throwPos.z + t * this.catchPos.z
		);
		return point;
	}

	getRotation(t, optionalTarget)
	{
		const target = optionalTarget || new THREE.Quaternion();
		if (this.spinAxis && this.throwAngle && this.catchAngle)
			return target.setFromAxisAngle(
				this.spinAxis,
				this.throwAngle + t * (this.catchAngle - this.throwAngle + this.nSpins * 2 * Math.PI)
			);
		return undefined;
	}

	} // end class ThrowCurve


	class DwellCurve extends THREE.CubicBezierCurve3
	{

	constructor(p)
	{
		const dCatch = p.vCatch.clone().multiplyScalar( p.duration);
		const dThrow = p.vThrow.clone().multiplyScalar(-p.duration);

		// limit dwell path to be within arms length
		// approximate solution by damping to some maximal distances to the control points
		const maxDist = upperArmLength + lowerArmLength - 0.4 * hu;
		const dCatchFactor = DwellCurve.damping(dCatch.length() / maxDist) * maxDist;
		const dThrowFactor = DwellCurve.damping(dThrow.length() / maxDist) * maxDist;

		super(
			p.catchPos.clone(),
			p.catchPos.clone().add(dCatch.clone().normalize().multiplyScalar(dCatchFactor)),
			p.throwPos.clone().add(dThrow.clone().normalize().multiplyScalar(dThrowFactor)),
			p.throwPos.clone(),
		);
		this.type = 'DwellCurve';
		if (p.catchAxis && p.throwAxis && ('throwAngle' in p) && ('catchAngle' in p) && ('throwRotationSpeed' in p)) {
			const maxRotationDelta = Math.PI;
			this.rotationCurve = new THREE.CubicBezierCurve3(
				new THREE.Vector3( p.catchAngle, 0 , 0),
				new THREE.Vector3( p.catchAngle, 0 , 0),
				new THREE.Vector3( p.throwAngle - DwellCurve.damping(p.throwRotationSpeed * p.duration / maxRotationDelta) * maxRotationDelta, 0, 0 ),
				new THREE.Vector3( p.throwAngle, 0, 0 )
			);
		}

		for (const [k, v] of Object.entries(p))
			this[k] = v;
	}

	getRotation(t, optionalTarget)
	{
		const target = optionalTarget || new THREE.Quaternion();
		if (this.rotationCurve) {
			return target.setFromAxisAngle(
				this.catchAxis.clone().multiplyScalar(1 - t)
					.add(this.throwAxis.clone().multiplyScalar(t)),
				this.rotationCurve.getPoint(t).x
			);
		}
		return undefined;
	}

	// damps input to a maximum of 1, from 0 to 0.5 linear
	static damping(x)
	{
		return x <= 0.5 ? x : 1 - Math.pow(Math.E, Math.log(0.5) + 1 - 2 * x);
	}

	} // end class DwellCurve

	class LinearCurve extends THREE.Curve
	{

	constructor(p)
	{
		super();
		this.type = 'LinearCurve';
		for (const [k, v] of Object.entries(p))
			this[k] = v;
	}

	getPoint(t, optionalTarget)
	{
		const target = optionalTarget || new THREE.Vector3();
		return target.copy(
			this.fromPoint.clone().multiplyScalar(1 - t)
				.add(this.toPoint.clone().multiplyScalar(t))
		);
	}

	} // end class LinearCurve

	/*
	 * this class represents the movement of a prop position and rotation/orientation
	 */
	class Movement
	{

	constructor(p)
	{
		this.periodSeconds = p.periodSeconds;
		this.positionCurves = p.positionCurves;
		this.positionCurves.sort((a, b) => a.start - b.start);
		this.nCurves = this.positionCurves.length;
		this.lastIndex = 0;
	}

	getCurveAndFraction(t)
	{
		for (let i = 0; i < this.nCurves; i++) {
			const index = (this.lastIndex + i) % this.nCurves;
			this.lastIndex = index;
			const c = this.positionCurves[index];
			const end = c.start + c.duration;
			if (c.start <= t && t < end)
				return {
					curve: c,
					fraction: (t - c.start) / c.duration,
				};
			else if (end > this.periodSeconds && t < (end % this.periodSeconds)) // wrap around period
				return {
					curve: c,
					fraction: (t - c.start + this.periodSeconds) / c.duration,
				};
		}
		return undefined;
	}

	getPosition(t, optionalTarget)
	{
		const cf = this.getCurveAndFraction(t);
		if (cf)
			return cf.curve.getPoint(cf.fraction, optionalTarget);
		return undefined;
	}

	getRotation(t, optionalTarget)
	{
		const cf = this.getCurveAndFraction(t);
		if (cf && cf.curve.getRotation)
			return cf.curve.getRotation(cf.fraction, optionalTarget);
		return undefined;
	}

	} // end class Movement


	/**
	 * code mostly extracted from https://github.com/supermedium/aframe-environment-component
	 * many thanks to the A-Frame guys!
	 */
	function createGrassTileMesh()
	{
		const numSquares = 32;
		const groundStretch = 10;
		const groundRepeat = 20;
		const groundRand = function(x) {
			return parseFloat('0.' + Math.sin(4 * 9999 * x).toString().substr(7));
		}
		const canvas = document.createElement('canvas');
		canvas.width  = numSquares;
		canvas.height = numSquares;
		const ctx = canvas.getContext("2d");
		const col1 = new THREE.Color(colors.ground1);
		const col2 = new THREE.Color(colors.ground2);
		for (let i = 0; i < numSquares * numSquares; i++) {
			const col = groundRand(i + 3) > 0.5 ? col1.clone() : col2.clone();
			col.addScalar(groundRand(i + 3) * 0.1 - 0.05);
			ctx.fillStyle = '#' + col.getHexString();
			ctx.fillRect((i % numSquares), Math.floor(i / numSquares), 1, 1);
		}
		const tex = new THREE.CanvasTexture(canvas);
		tex.wrapT = THREE.RepeatWrapping
		tex.wrapS = THREE.RepeatWrapping
		tex.repeat.set(groundRepeat, groundRepeat)
		tex.magFilter = THREE.NearestFilter;
		tex.minFilter = THREE.NearestFilter;
		tex.encoding = THREE.sRGBEncoding;
		return new THREE.Mesh(
			new THREE.CircleBufferGeometry(groundStretch * groundRepeat, 32).rotateX(-Math.PI / 2),
			new THREE.MeshToonMaterial({map:tex}),
		);
	}

	function createSkyMesh()
	{
		return new THREE.Mesh(
			new THREE.SphereBufferGeometry( 4000, 32, 15 ),
			new THREE.ShaderMaterial({
				uniforms: {
					"topColor":    { value: new THREE.Color(colors.sky) },
					"bottomColor": { value: new THREE.Color(colors.fog) },
					"offset":      { value: 33 },
					"exponent":    { value: 0.6 }
				},
				vertexShader: `
					varying vec3 vWorldPosition;
					void main() {
						vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
						vWorldPosition = worldPosition.xyz;
						gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
					}
				`,
				fragmentShader: `
					uniform vec3 topColor;
					uniform vec3 bottomColor;
					uniform float offset;
					uniform float exponent;
					varying vec3 vWorldPosition;
					void main() {
						float h = normalize( vWorldPosition + offset ).y;
						gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
					}
				`,
				side: THREE.BackSide
			})
		);
	}

</script>

<style>
	.container    { position:relative; margin:0; padding:0; width:100%; height:100%; display:inline-block; overflow:hidden }
	.isFullscreen { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #fff; }
	.isMaximized  { position:fixed; top:0; right:0; bottom:0; left:0 }
	canvas { position:absolute; top:0; right:0; bottom:0; left:0; z-index:10; cursor:grab }
	canvas.dragging { cursor:grabbing }
	.background {  position:absolute; z-index:0; top:0; right:0; bottom:0; left:0; background-color:#c9ede7 }
	.controls { position:absolute; z-index:20 }
	.position-top    { top:1ex }
	.position-left   { left:1ex }
	.position-right  { right:1ex }
	.settings { position:absolute; z-index:20; top:5ex; left:1ex; max-width:calc(100% - 2ex); max-height:calc(100% - 7ex); overflow:auto; display:flex; flex-direction:column; align-items:flex-start; background-color:rgba(0,0,0,0.2); padding:1em; border-radius:0.5em; margin-top:1ex }
	.teaserForeground   { position:absolute; top:0; bottom:0; left:0; right:0; z-index:21; cursor:pointer }
	.message { color:white; background-color:rgba(0,0,0,0.2); pointer-events:none; position:absolute; bottom:2ex; left:50%; transform:translateX(-50%); padding:0 1ex; border-radius:1ex; z-index:21  }
	label.pure-button { margin:0 }
	.fps { margin-left:1.5ex }
</style>

<svelte:window
	on:pointerdown|capture={onDown}
	on:pointermove|capture={onMove}
	on:pointerup|capture={onUp}
	on:keydown={onKeyDown}
/>

<div bind:this={container} class=container class:isFullscreen class:isMaximized bind:clientWidth={width} bind:clientHeight={height} >
	<div class=background />

	<!-- TODO: aspect ratio is wrong on load! -->
	<SC.Canvas
		antialias
		background={background}
		fog={new THREE.FogExp2('papayawhip', 0.1)}
	>
		<!-- TODO:
			this.controls.enableKeys = false;

			this.renderer.setClearColor(new THREE.Color(0xffffff));
			this.renderer.outputEncoding = THREE.GammaEncoding;
			this.renderer.gammaFactor = 2.2;
		-->
		<SC.PerspectiveCamera
			fov={45}
			near={0.1}
			far={10000}
			position={[0, 2, 10]}
			target={[0, 2, 0]}
		/>
		<SC.OrbitControls
			maxDistance={100}
		/>

		<SC.DirectionalLight
			color={0xffe6e5}
			intensity={1}
			position={[15, 50, 30]}
		/>
		<SC.AmbientLight intensity={0.6} />

		<SC.HemisphereLight
			color={colors.sky}
			groundColor={colors.horizon}
			intensity={1}
		/> <!-- position={0, 50, 0} -->

		<SC.Primitive object={createGrassTileMesh()} />
		<SC.Primitive object={createSkyMesh()} />

		{#each jugglers as juggler}
			<SC.Primitive object={juggler} />
		{/each}

		{#each props as prop}
			<SC.Primitive object={prop.mesh} />
		{/each}

	</SC.Canvas>

	<!--
	<canvas
		:this={canvas}
		class:dragging={dragStart}
	/>
	-->
	<div class="controls position-top position-right">
		{#if isFull}
		<Icon type=fullscreen_exit on:click={e => {showSettings = false; exitFullscreen()}}/>
		{:else}
		<Icon type=fullscreen on:click={requestFullscreen}/>
		{/if}
	</div>

	{#if isFull || !teaser}

	{#if enableSettings}
		<div class="controls position-top position-left">
			<Icon type=settings on:click={e => showSettings = !showSettings}/>
		</div>
		{#if showSettings}
		<div class="settings pure-form form-inline">
			<slot></slot>

			<div class=fps>
				FPS: {fps}
			</div>
			<InputField
				id=resolution
				type=custom
				label="Resolution"
			>
				<label class="pure-button" class:pure-button-active={resolution == 'low'}>
					<input type="radio" bind:group={resolution} value="low" autocomplete="off"> low
				</label>
				<label class="pure-button" class:pure-button-active={resolution == 'medium'}>
					<input type="radio" bind:group={resolution} value="medium" autocomplete="off"> medium
				</label>
				<label class="pure-button" class:pure-button-active={resolution == 'high'}>
					<input type="radio" bind:group={resolution} value="high" autocomplete="off"> high
				</label>
			</InputField>
		</div>

		{/if}
	{/if}
	{/if}
	{#if valid}
		{#if teaser && !isFull}
			<div class=teaserForeground on:click={requestFullscreen}>
				{#if closeButton}
				<div class="controls position-top position-left" on:click|stopPropagation={dispatch('close', !isFull)}>
					<Icon type=close/>
				</div>
				{/if}
				{#if loaded}
				<div class=message>Click to interact in fullscreen</div>
				{/if}
			</div>
		{/if}
		{#if (isFull || !teaser) && paused}
			<div class=message>Paused - Click to continue</div>
		{/if}
	{:else}
		<div class=message>Invalid Pattern</div>
	{/if}
</div>
