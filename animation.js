var container = document.getElementById("animation");
var width  =  window.innerWidth - 80;
var height  = window.innerHeight;

// var renderer = new THREE.WebGLRenderer({ canvas: canvas });
var renderer = new THREE.WebGLRenderer();
renderer.setSize( width, height );
renderer.setClearColor(new THREE.Color(0xffffff));
container.appendChild(renderer.domElement);

var scene = new THREE.Scene();
var gridHelper = new THREE.GridHelper( 10, 10);
scene.add( gridHelper );
var scene_width = 6;

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var camera_height = 3;
camera.position.z = 5;
camera.position.y = camera_height;

// var controls = new THREE.OrbitControls( camera, canvas );
var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enableKeys = false;
controls.target = new THREE.Vector3(0, camera_height, 0);
controls.update();

var animate = function (time) {
	requestAnimationFrame( animate );
	controls.update();

	var gravity = -1.5;

	var props = window.props;
	if (jif && props) {
		t = (time / 500) % jif.time_period;

		var throw_pos = [];
		var catch_pos = [];
		for (var i = 0; i < jif.n_hands; i++) {
			var base_pos = i * scene_width / (jif.n_hands - 1) - scene_width / 2;
			var hand_offset = 0.6 / (jif.n_hands - 1);
			throw_pos.push(base_pos + (i % 2 == 0 ? 1 : -1) * hand_offset);
			catch_pos.push(base_pos + (i % 2 == 0 ? -1 : 1) * hand_offset);
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
					var f = dt / th.duration;
					var v0 = -gravity * Math.pow(th.duration, 2) / (2 * th.duration);

// 					v = v0 + a * t;
//
// 					s = s0 + v0t + ½ * a * t^2
// 					v = ds / dt;
//
					// v0 * duration + gravity * Math.pow(duration, 2) / 2 = 0;
					// v0 * duration = -gravity * Math.pow(duration, 2) / 2;
					// v0 = (-gravity * Math.pow(duration, 2) / 2) / duration;
// 					p.mesh.position.x = (th.from_hand * (1 - f) + th.to_hand * f - (jif.n_hands - 1) / 2) * 10 / jif.n_hands;
					p.mesh.position.x = throw_pos[th.from_hand] * (1 - f) + catch_pos[th.to_hand] * f;
					p.mesh.position.y = 1 + v0 * dt + gravity * Math.pow(dt, 2) / 2;
					break;
				}
			}
			if (!visible)
				console.log('object not visible, should not happen in siteswap:', p, t, tt, jif.time_period);
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
	console.log('update scene', window.props);
}
if (jif)
	updateScene();
