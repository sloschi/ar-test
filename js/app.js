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

  var loader = new THREE.GLTFLoader();

  createWonderland(scene, loader, function(snow, snowman, tree, logo) {
    onRenderFcts.push(function(deltaG) {
      updateSnow(snow, deltaG);
    });

    onRenderFcts.push(function(deltaG) {
      updateSnowman(snowman, deltaG);
    });

    onRenderFcts.push(function(deltaG) {
      updateTree(tree, deltaG);
    });

    onRenderFcts.push(function(deltaG) {
      updateLogo(logo, deltaG);
    });

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

function addIsland(aScene, aLoader, onDone) {
  aLoader.load("./assets/wonderland.glb", function(data) {
    var gltf = data;
    var island = gltf.scene;

    island.scale.copy(new THREE.Vector3(2, 2, 2));
    island.rotateY(-90);

    var snowman = island.getObjectByName("snowman_rotation");
    var tree = island.getObjectByName("tree");
    var logo = island.getObjectByName("Logo");

    aScene.add(island);
    onDone(snowman, tree, logo);
  });
}

function addSnow(aCount, aScene, aLoader, onDone) {
  aLoader.load("./assets/logo.glb", function(data) {
    var snowFlake = data.scene;
    var material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });

    snowFlake.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    var snow = new THREE.Group();
    for (var i = 0; i < SNOW_COUNT; i++) {
      var flake = snowFlake.clone();
      flake.rotation.x = Math.random() * 6;
      flake.rotation.y = Math.random() * 6;
      flake.rotation.z = Math.random() * 6;
      flake.position.copy(
        new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (0.5 + Math.random() - 0.5) * 3.5,
          (Math.random() - 0.5) * 3
        )
      );
      snow.add(flake);
    }

    aScene.add(snow);
    onDone(snow);
  });
}

function createWonderland(aScene, aLoader, onDone) {
  addIsland(aScene, aLoader, function(snowman, tree, logo) {
    addSnow(SNOW_COUNT, aScene, aLoader, function(snow) {
      addLights(aScene);
      onDone(snow, snowman, tree, logo);
    });
  });
}

function updateSnow(snow, deltaG) {
  snow.children.forEach(function(flake) {
    flake.rotateX(deltaG);
    flake.rotateY(deltaG);
    flake.rotateZ(deltaG);
    flake.position.y -= 0.2 * deltaG;

    if (flake.position.y < 0) {
      flake.position.copy(
        new THREE.Vector3(flake.position.x, 2, flake.position.z)
      );
    }
  });
}

function updateSnowman(snowman, deltaG) {
  var limit = Math.PI / 8;

  snowman.rotation.x = Math.sin(Date.now() * 0.005) * limit;
}

function updateTree(tree, deltaG) {
  var limit = Math.PI / 20;

  tree.rotation.x = Math.sin(Date.now() * 0.002) * limit;
  tree.rotation.y += deltaG;
}

function updateLogo(logo, deltaG) {
  logo.rotation.y += deltaG;
}
