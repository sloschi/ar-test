// @ts-check

function showError(error) {
  document.getElementById("not-ok-version").style.display = "flex";
  document.getElementById("ok-version").style.display = "none";

  console.error("error", error);
  alert(JSON.stringify(error));
}

// see: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
function isMobile() {
  var check = false;
  var agent = navigator.userAgent || navigator.vendor || window.opera;

  return (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      agent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      agent.substr(0, 4)
    )
  );
}

var SNOW_COUNT = 250;

if (!Detector.webgl) {
  showError();
} else {
  document.getElementById("not-ok-version").style.display = "none";
  document.getElementById("ok-version").style.display = "flex";

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

    var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;

    // see: https://stackoverflow.com/questions/14948720/is-it-possible-to-detect-samsung-stock-browser
    var isSamsung = navigator.userAgent.match(
      /SAMSUNG|Samsung|SGH-[I|N|T]|GT-[I|N]|SM-[N|P|T|Z]|SHV-E|SCH-[I|J|R|S]|SPH-L/i
    );

    if (isMobile() && (isFirefox || isSamsung)) {
      document.getElementById("bad-browser").style.top = "0";
    }

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
  }, showError);
}

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
