'use strict';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
	sky: 0x24b59f,
	horizon: 0xeff9b7,
	fog: 0xffffee,
	ground1: 0x937a24,
	ground2: 0x987d2e,
	meeseeks: 0x5fcaf6,
	props: [
		0xc0392b, // red
		0x0c0d5d, // blue
		0xf45d20, // orange
		0xed4694, // pink
		0x6f5499, // violet
		0x00dc3c, // green
		0xffd700, // yellow
		0xf2f2f2, // white
	],
};
function propColor(propId)
{
	return colors.props[propId % colors.props.length];
}

function sideFactor(side)
{
	// 0: right/positive, 1: left/negative
	return side ? -1 : 1;
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
		'/images/meeseeks_blue.png',
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
		const shoulder = new THREE.Object3D();
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
	this.period = p.period;
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
		else if (end > this.period && t < (end % this.period)) // wrap around period
			return {
				curve: c,
				fraction: (t - c.start + this.period) / c.duration,
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


export default class Animation {

constructor(canvas, jif, valid, width, height)
{
	this.renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		antialias:true,
	});
	this.renderer.setClearColor(new THREE.Color(0xffffff));
	this.renderer.outputEncoding = THREE.GammaEncoding;
	this.renderer.gammaFactor = 2.2;

	this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
	this.camera.position.set(0, 2, 10);
	this.camera.lookAt(v3(0, 2, 0));

	this.resize(width, height);

	this.controls = new OrbitControls( this.camera, this.renderer.domElement );
	this.controls.enableKeys = false;
	this.controls.maxDistance = 100;

	this.timer = {dt: 0};
	this.paused = false;

	this.grassTileMesh = Animation.createGrassTileMesh();
	this.skyMesh = Animation.createSkyMesh();
	this.clubGeometry = pirouetteGeometry();

	this.updateScene(jif, valid);
	this.animate();
}

resize(width, height)
{
	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize(width, height);
	this.positionCamera();
}

/**
 * position camera so that the whole scene is visible
 */
positionCamera()
{
	if (!this.bbox || !this.camera)
		return;

	const center = new THREE.Vector3();
	const size = new THREE.Vector3();
	this.bbox.getCenter(center);
	this.bbox.getSize(size);

	const fov = this.camera.fov * (Math.PI / 180);
	const slack = 0.5;
	const a = 2 * Math.tan(fov / 2);
	const dzWidth  = (size.x + slack) / (a * this.camera.aspect);
	const dzHeight = (size.y + slack) / a;

	this.camera.position.set(
		center.x,
		center.y,
		center.z + this.bbox.max.z + Math.max(dzHeight, dzWidth)
	);
	this.camera.lookAt(center);

	this.controls.target = center;
	this.controls.saveState();
}

/**
 * code mostly extracted from https://github.com/supermedium/aframe-environment-component
 * many thanks to the A-Frame guys!
 */
static createGrassTileMesh()
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

static createSkyMesh()
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

static clubTexture(clubColors = {})
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

updateScene(jif, valid)
{
	this.jif = jif;
	this.beatsPerSecond = jif.jugglingSpeed * jif.timeStretchFactor;

	this.cleanup();
	this.scene = new THREE.Scene();

	this.scene.background = new THREE.Color().setHSL(0.6, 0, 1);
	this.scene.fog = new THREE.Fog(this.scene.background, 50, 1000);
	this.scene.fog.color.copy( new THREE.Color(colors.fog));

	const hemiLight = new THREE.HemisphereLight(colors.sky, colors.horizon, 1);
	hemiLight.position.set(0, 50, 0);
	this.scene.add(hemiLight);

	const dirLight = new THREE.DirectionalLight(0xffe6e5, 1);
	dirLight.position.set(15, 50, 30);
	this.scene.add( dirLight );

	this.scene.add( this.skyMesh );
	this.scene.add( this.grassTileMesh);

	this.bbox = new THREE.Box3(v3(0, 0, 0), v3(0, 0, 0));

	this.jugglers = [];
	const circleRadius = 1.2 + jif.nJugglers * 0.2;
	for (let i = 0; i < jif.nJugglers; i++) {
		const j = new Juggler(valid ? '/images/face_texture.png' : '/images/panic_face_texture.png');
		if (jif.nJugglers == 1) {
			j.position.set(0, 0, 0);
			j.lookAt(0, 0, 1);
		} else {
			const a = Math.PI * 2 * i / jif.nJugglers;
			j.position.set(circleRadius * Math.cos(a), 0, circleRadius * Math.sin(a));
			j.lookAt(0, 0, 0);
		}
		this.jugglers.push(j);
		this.scene.add(j);
		this.bbox.expandByObject(j);
	}

	if (!valid) {
		for (const j of this.jugglers) {
			j.lookAt(this.camera.position.clone().setY(0));
			j.panic();
		}
		this.positionCamera();
		return;
	}
	if (jif.nProps < 1) {
		this.positionCamera();
		return;
	}

	this.props = [];
	for (let i = 0; i < jif.nProps; i++) {
		const prop = jif.propType == 'ball' ?
			new THREE.Mesh(
				new THREE.SphereBufferGeometry( 0.04, 10, 10 ),
				new THREE.MeshToonMaterial({color: propColor(i)} )
			)
			: new THREE.Mesh(
				this.clubGeometry,
				new THREE.MeshToonMaterial({
					map: Animation.clubTexture({body: propColor(i)})
				})
			);
		this.props.push({
			mesh: prop,
			throws: []
		});
		this.scene.add(prop);
	}
	for (let i in jif.events) {
		const e = jif.events[i];
		if (e.type == 'throw' && e.prop !== undefined)
			this.props[e.prop].throws.push(e);
	}

	this.hands = [];

	this.throwPositions = [];
	this.catchPositions = [];
	this.zipCatchPositions = [];
	for (let i = 0; i < jif.nHands; i++) {
		let hand = jif.limbs[i];
		let j = hand.juggler;
		let side = hand.hand == 'right' ? 0 : 1;
		let sf = sideFactor(side);

		let forwardDistance = lowerArmLength + handLength;
		let sideDistance = shoudlerWidth / 2;
		let throwCatchOffset = 0.1;
		let jugglerPos = this.jugglers[j].position;

		const facing = this.jugglers[j].facing;

		let basePos = jugglerPos.clone().add(
			facing.clone()
			.multiplyScalar(forwardDistance)
		).add(
			facing.clone()
			.cross(v3(0, -sf, 0))
			.multiplyScalar(sideDistance)
		);
		const throwPosition = basePos.clone()
			.add(
				v3(0, shoulderHeight - 2 * hu, 0)
			).add(
				facing.clone()
				.cross(v3(0, sf, 0))
				.multiplyScalar(throwCatchOffset)
			);
		const catchPosition = basePos.clone()
			.add(
				v3(0, shoulderHeight, 0)
			).add(
				facing.clone()
				.cross(v3(0, -sf, 0))
				.multiplyScalar(throwCatchOffset)
			);
		this.catchPositions.push(catchPosition);
		this.throwPositions.push(throwPosition);
		this.zipCatchPositions.push(
			basePos.clone()
				.add(
					v3(0, shoulderHeight - 2 * hu, 0)
				).add(
					facing.clone()
					.cross(v3(0, sf, 0))
					.multiplyScalar(throwCatchOffset * 2)
				)
		);
		this.jugglers[j].setHandPosition(side, throwPosition);

		this.hands.push({
			juggler: this.jugglers[j],
			positionCurves: [],
			side: side,
		});
	}

	const propThrows = Array.from(Array(jif.nProps), () => new Array());

	// calculate prop movements
	for (const e of jif.events) {
		if (e.type == 'throw') {
			const soloHeight = e.duration / jif.nJugglers;
			e.dwell = (soloHeight > 2 ? 1 : (soloHeight < 1 ? 0 : 0.5)) * jif.nJugglers;
			if (!('spins' in e))
				e.spins = Math.max(0, Math.floor(soloHeight - 2));

			const jugglerFrom = jif.limbs[e.from].juggler;
			const jugglerTo = jif.limbs[e.to].juggler;
			const up = v3(0, 1, 0);
			e.throwPos = this.throwPositions[e.from];
			e.catchPos = this.catchPositions[e.to];
			e.throwAngle = 1.5 * Math.PI; // TODO: make this dependent on throw (type, duration, where its supposed to go)
			if (jugglerFrom == jugglerTo) { // self - TODO: improve angle for crossing selfs
				e.axis = this.jugglers[jugglerFrom].facing.cross(up);
				e.catchAngle = 1.5 * Math.PI;

				// zip like
				if (soloHeight < 2.5 && e.from != e.to)
					e.catchPos = this.zipCatchPositions[e.to];
			} else { // pass
				e.axis = e.catchPos.clone().sub(e.throwPos).normalize().cross(up);
				e.catchAngle = 2 * Math.PI;
			}
			e.throwCurve = new ThrowCurve({
				throwPos: e.throwPos,
				catchPos: e.catchPos,
				start:    e.time / this.beatsPerSecond,
				duration: (e.duration - e.dwell) / this.beatsPerSecond,
				from: e.from,
				to:   e.to,
				nSpins:   e.spins,
				spinAxis: e.axis,
				throwAngle: e.throwAngle,
				catchAngle: e.catchAngle,
				isSelf:   jugglerFrom == jugglerTo,
			});
			propThrows[e.prop].push(e.throwCurve);

			for (const p of e.throwCurve.getPoints(11))
				this.bbox.expandByPoint(p);

			if (this.jif.showOrbits) {
				this.scene.add(new THREE.Mesh(
					new THREE.TubeBufferGeometry(e.throwCurve, 32, 0.01, 16, false),
					new THREE.MeshToonMaterial({ color:propColor(e.prop) }),
				));
			}
		}
	}

	const period = jif.timePeriod / this.beatsPerSecond;

	// calculate prop movements during dwell
	propThrows.forEach((throwCurves, prop) => {

		const positionCurves = [];
		let last = throwCurves[throwCurves.length - 1];
		for (const curve of throwCurves) {
			if (last.to != curve.from) {
				console.log('prop teleportation detected - should not happen!');
				continue;
			}
			const start = (last.start + last.duration) % period;
			const end = curve.start;
			const dwellDuration = end - start + (end >= start - 1e-10 ? 0 : period);

			if (dwellDuration > 0) {
				const dwellCurve = new DwellCurve({
					catchPos: last.catchPos,
					throwPos: curve.throwPos,
					vCatch: last.v1.clone(),
					vThrow: curve.v0.clone(),
					start: start,
					duration: dwellDuration,
					hand: curve.from,
					catchAxis: last.spinAxis.clone().multiplyScalar(last.isSelf ? 1 : -1),
					catchAngle: last.catchAngle,
					catchRotationSpeed: -last.rotationSpeed,
					throwAxis: curve.spinAxis,
					throwAngle: curve.throwAngle,
					throwRotationSpeed: curve.rotationSpeed,
				});
				this.hands[dwellCurve.hand].positionCurves.push(dwellCurve);
				if (jif.showOrbits)
					this.scene.add(new THREE.Mesh(
						new THREE.TubeBufferGeometry(dwellCurve, 32, 0.01, 16, false),
						new THREE.MeshToonMaterial({ color:propColor(prop) }),
					));
				positionCurves.push(dwellCurve);
			}
			positionCurves.push(curve);
			last = curve;
		}

		this.props[prop].movement = new Movement({
			positionCurves: positionCurves,
			period: period,
		});
	});

	// calculate hand movements between dwells (return to catch position)
	for (const hand of this.hands) {
		const pc = [];
		hand.positionCurves.sort((a, b) => a.start - b.start);
		let last = hand.positionCurves[hand.positionCurves.length - 1];
		for (const curve of hand.positionCurves) {
			const start = last.start + last.duration
			const end = curve.start;
			pc.push(new LinearCurve({
				fromPoint: last.throwPos,
				toPoint: curve.catchPos,
				start: start,
				duration: end - start + (end > start ? 0 : period),
			}));
			pc.push(curve);
			last = curve;
		}
		hand.movement = new Movement({
			positionCurves: pc,
			period: period,
		});
	}

	this.positionCamera();

	this.setPositions(0);
}

animate()
{
	const jif = this.jif;

	const t = performance.now();
	let time = 0;
	if (t !== undefined) {
		if (this.paused) {
			time = this.timer.dt;
		} else {
			if (this.timer.starttime === undefined)
				this.timer.starttime = t - this.timer.dt;
			time = t - this.timer.starttime;
			this.timer.dt =  time;
		}
		if (this.prevTime !== undefined)
			this.fps = Math.round(1000 / (t - this.prevTime));
		this.prevTime = t;
	}

	this.animationFrameRequestId = requestAnimationFrame(this.animate.bind(this));
	this.controls.update();

	if (jif && this.props && !this.paused)
		this.setPositions(((time * jif.nHands / 1000 * jif.animationSpeed) % jif.timePeriod) / this.beatsPerSecond);

	this.renderer.render(this.scene, this.camera);
}

setPositions(t)
{
	for (const p of this.props) {
		let visible = false;
		if (p.movement.getPosition(t, p.mesh.position))
			visible = true;

		let quaternion = p.movement.getRotation(t);
		if (quaternion)
			p.mesh.setRotationFromQuaternion(quaternion);

		p.mesh.visible = visible;
	}

	for (const hand of this.hands) {
		const handPos = hand.movement.getPosition(t);
		if (handPos)
			hand.juggler.setHandPosition(hand.side, handPos);
	}
}

togglePause()
{
	if (this.paused)
		this.timer.starttime = undefined;
	return this.paused = !this.paused;
}

cleanup()
{
	if (this.scene) {
		this.scene.remove.apply(this.scene, this.scene.children);
		this.renderer.renderLists.dispose();
	}
}

destroy()
{
	this.cleanup();
	if (this.animationFrameRequestId)
		cancelAnimationFrame(this.animationFrameRequestId);
}

} // end class Animation
