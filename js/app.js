// @ts-check

var SNOW_COUNT = 250;

var arToolkitSource = new THREEx.ArToolkitSource({
  sourceType: "webcam"
});

arToolkitSource.init(function() {
  var renderer = new THREE.WebGLRenderer({
    alpha: true
  });

  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  document.body.appendChild(renderer.domElement);

  var onRenderFcts = [];

  var scene = new THREE.Scene();

  addLights(scene);

  var camera = new THREE.Camera();
  scene.add(camera);

  var arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: "assets/camera_para.dat",
    detectionMode: "color",
    maxDetectionRate: 30
  });

  arToolkitContext.init(function onCompleted() {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  function onResize() {
    arToolkitSource.onResize();
    arToolkitSource.copySizeTo(renderer.domElement);

    if (arToolkitContext.arController !== null) {
      arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
    }
  }

  window.addEventListener("resize", onResize);

  onResize();

  // add a torus knot
  var geometry = new THREE.CubeGeometry(1, 1, 1);
  var material = new THREE.MeshNormalMaterial({
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = geometry.parameters.height / 2;
  scene.add(mesh);

  // update artoolkit on every frame
  onRenderFcts.push(function() {
    if (!arToolkitSource.ready) return;

    arToolkitContext.update(arToolkitSource.domElement);

    scene.visible = camera.visible;
  });

  var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type: "pattern",
    patternUrl: "assets/webar.patt",
    changeMatrixMode: "cameraTransformMatrix"
  });

  scene.visible = false;

  onRenderFcts.push(function() {
    renderer.render(scene, camera);
  });

  var lastTimeMsec = null;

  requestAnimationFrame(function animate(nowMsec) {
    requestAnimationFrame(animate);

    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;

    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec = nowMsec;

    onRenderFcts.forEach(function(onRenderFct) {
      onRenderFct(deltaMsec / 1000, nowMsec / 1000);
    });
  });
});

function addLights(aScene) {
  var light1 = new THREE.DirectionalLight(0xffeedd);
  light1.position.set(0, 0, 1);
  aScene.add(light1);

  var light2 = new THREE.DirectionalLight(0xffeedd);
  light2.position.set(0, 5, -5);
  aScene.add(light2);

  var light3 = new THREE.AmbientLight(0x222222);
  aScene.add(light3);
}
