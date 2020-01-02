var container = document.getElementById("animation");
var width  =  window.innerWidth - 80;
var height  = window.innerHeight;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( width, height );
renderer.setClearColor(new THREE.Color(0xffffff));
container.appendChild(renderer.domElement);

var scene = new THREE.Scene();
var gridHelper = new THREE.GridHelper( 10, 10);
scene.add( gridHelper );
var scene_width = 6;

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var camera_height = 6;
camera.position.z = 15;
camera.position.y = camera_height;

// var controls = new THREE.OrbitControls( camera, canvas );
var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enableKeys = false;
controls.target = new THREE.Vector3(0, camera_height, 0);
controls.update();

var loader = new THREE.GLTFLoader();
loader.load( 'mr_meeseeks.gltf', function ( gltf ) {
	window.mr_meeseeks = gltf.scene;
	updateScene();
}, undefined, function ( error ) {
	console.error( error );
});

// var frametimes = [];
var animate = function (time) {
// 	while (frametimes.length > 0 && frametimes[0] + 1000 < time)
// 		frametimes.shift();
// 	if (time)
// 		frametimes.push(time);
// 	console.log('fps', frametimes.length);

	var base_height = 5;

	requestAnimationFrame( animate );
	controls.update();

	var gravity = -2.5;

	var props = window.props;
	if (jif && props) {
		t = (time / 500) % jif.time_period;

		var throw_positions = [];
		var catch_positions = [];
		for (var i = 0; i < jif.n_hands; i++) {
			var base_pos = i * scene_width / (jif.n_hands - 1) - scene_width / 2;
			var hand_offset = 0.6 / (jif.n_hands - 1);
			throw_positions.push(base_pos + (i % 2 == 0 ? 1 : -1) * hand_offset);
			catch_positions.push(base_pos + (i % 2 == 0 ? -1 : 1) * hand_offset);
		}

		for (var i in props) {
			var p = props[i];
			var visible = false;
			for (var j in p.throws) {
				var th = p.throws[j];
				var tt = t + jif.time_period;
				var wrapped = th.time <= tt && tt <= th.time + th.duration;
				if (th.duration > 0 && (th.time <= t && t <= th.time + th.duration || wrapped)) { // TODO: handle wrap around period
					visible = true;
					var dt = (wrapped ? tt : t) - th.time;

					var dwell = th.dwell === undefined ? 0 : th.dwell
					var throw_duration = th.duration - dwell;

					var v0 = [(throw_positions[th.from_hand] - catch_positions[th.to_hand] ) / throw_duration , -gravity * Math.pow(throw_duration, 2) / (2 * throw_duration)];
// 					var v1 = [v0[0], v0[1] + gravity * throw_duration];

					if (dt <= throw_duration) {
						var f = dt / throw_duration;
// 						v = v0 + a * t;
// 						s = s0 + v0t + ½ * a * t^2
// 						v = ds / dt;
// 						v0 * duration + gravity * Math.pow(duration, 2) / 2 = 0;
// 						v0 * duration = -gravity * Math.pow(duration, 2) / 2;
// 						v0 = (-gravity * Math.pow(duration, 2) / 2) / duration;

						p.mesh.position.x = throw_positions[th.from_hand] * (1 - f) + catch_positions[th.to_hand] * f;
						p.mesh.position.y = base_height + v0[1] * dt + gravity * Math.pow(dt, 2) / 2;
					} else {
						var f = (dt - throw_duration) / dwell;

						// linear interpolation
// 						p.mesh.position.y = base_height;
// 						p.mesh.position.x = catch_positions[th.to_hand] * (1 - f) + throw_positions[th.to_hand] * f;

						// find v0 of next throw to calculate dwell bezier curve
						var v0_next = [0, 0]; // some default if we don't find a next throw
						var th2time = (th.time + th.duration) % jif.time_period;
						for (var k in p.throws) {
							var th2 = p.throws[k];
							if (th2.time == th2time) {
								var throw_duration2 = th2.duration - th2.dwell;
								v0_next = [(throw_positions[th2.from_hand] - catch_positions[th2.to_hand] ) / throw_duration2 , -gravity * Math.pow(throw_duration2, 2) / (2 * throw_duration2)];
								break;
							}
						}

						var catch_pos = new THREE.Vector3(catch_positions[th.to_hand], base_height, 0);
						var throw_pos = new THREE.Vector3(throw_positions[th.to_hand], base_height, 0);

						// bezier curve
						var damping = 0.5;
						var curve = new THREE.CubicBezierCurve3(
							catch_pos,
							new THREE.Vector3( catch_pos.x - v0[0] * dwell * damping, catch_pos.y - v0[1] * dwell * damping, 0 ), // NOTE: -v0 only works when catching happens on the same height!
							new THREE.Vector3( throw_pos.x   + v0_next[0] * dwell * damping,   throw_pos.y - v0_next[1] * dwell * damping, 0 ),
							throw_pos
						);
						curve.getPoint(f, p.mesh.position);
					}
					break;
				}
			}
// 			if (!visible)
// 				console.log('object not visible, should not happen in siteswap:', p, t, tt, jif.time_period);

			p.mesh.visible = visible;
		}
	}

	renderer.render( scene, camera );
};

animate();

window.addEventListener( 'resize', function() {
	var width  =  window.innerWidth - 80;
	var height  = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );
}, false );

function updateScene()
{
	scene.remove.apply(scene, scene.children);

	var gridHelper = new THREE.GridHelper( 10, 10);
	scene.add(new THREE.GridHelper( 10, 10));

	var colors = [
		0x16A085,
		0xFFC300,
		0xFF5733,
		0xC70039,
		0x900C3F
	];
	window.props = [];
	for (var i = 0; i < jif.n_props; i++) {
		var geometry = new THREE.SphereGeometry( 0.2, 50, 50 );
		var material = new THREE.MeshBasicMaterial( { color: i < colors.length ? colors[i] : 0x16a085 } );
		var ball = new THREE.Mesh( geometry, material );
		window.props.push({
			mesh: ball,
			throws: []
		});
		scene.add( ball );
	}
	for (var i in jif.events) {
		var e = jif.events[i];
		if (e.type == 'throw' && e.prop !== undefined)
			window.props[e.prop].throws.push(e);
	}

	if ('mr_meeseeks' in window) {
		var juggler = mr_meeseeks;
		juggler.position.z = -1;
		scene.add( juggler );
	}

	console.log('update scene', window.props);
}
if (jif)
	updateScene();
