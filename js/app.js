var renderer = new THREE.WebGLRenderer({
  alpha: true
});

renderer.setClearColor(new THREE.Color("lightgrey"), 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0px";
renderer.domElement.style.left = "0px";
document.body.appendChild(renderer.domElement);

var onRenderFcts = [];

var scene = new THREE.Scene();

var camera = new THREE.Camera();
scene.add(camera);

var arToolkitSource = new THREEx.ArToolkitSource({
  sourceType: "webcam"
});

arToolkitSource.init(function onReady() {
  onResize();
});

window.addEventListener("resize", function() {
  onResize();
});

function onResize() {
  arToolkitSource.onResize();
  arToolkitSource.copySizeTo(renderer.domElement);
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
  }
}

var arToolkitContext = new THREEx.ArToolkitContext({
  cameraParametersUrl: "assets/camera_para.dat",
  detectionMode: "color",
  maxDetectionRate: 30
});

arToolkitContext.init(function onCompleted() {
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

onRenderFcts.push(function() {
  if (arToolkitSource.ready === false) return;
  arToolkitContext.update(arToolkitSource.domElement);
});

var artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, camera, {
  type: "pattern",
  patternUrl: "assets/webar.patt",
  changeMatrixMode: "cameraTransformMatrix"
});

var geometry = new THREE.CubeGeometry(1, 1, 1);
var material = new THREE.MeshNormalMaterial({
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide
});
var mesh = new THREE.Mesh(geometry, material);
mesh.position.y = geometry.parameters.height / 2;
scene.add(mesh);

var geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
var material = new THREE.MeshNormalMaterial();
var mesh = new THREE.Mesh(geometry, material);
mesh.position.y = 0.5;
scene.add(mesh);

onRenderFcts.push(function() {
  mesh.rotation.x += 0.1;
});

// render the scene
onRenderFcts.push(function() {
  renderer.render(scene, camera);
});

// run the rendering loop
var lastTimeMsec = null;
requestAnimationFrame(function animate(nowMsec) {
  // keep looping
  requestAnimationFrame(animate);
  // measure time
  lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
  var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
  lastTimeMsec = nowMsec;
  // call each update function
  onRenderFcts.forEach(function(onRenderFct) {
    onRenderFct(deltaMsec / 1000, nowMsec / 1000);
  });
});
