import * as THREE from "three";

const SATELLITE_API =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=STATIONS&FORMAT=JSON";

const STARLINK_API =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=STARLINK&FORMAT=JSON";

const LAUNCH_API =
  "https://ll.thespacedevs.com/2.3.0/launches/?limit=12&ordering=net";

const THREE_SCALE = 8;

let scene;
let camera;
let renderer;
let earth;
let moon;
let sun;
let satellites = [];
let satelliteData = [];
let selectedSatellite = null;
let followTarget = null;
let controlsTarget = new THREE.Vector3(0, 0, 0);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const $ = id => document.getElementById(id);

const state = {
  iss: null,
  starlink: [],
  lastSatelliteUpdate: null,
  lastMissionUpdate: null
};

function setLoad(progress, text) {
  $("loadProgress").style.width = progress + "%";
  $("loadText").textContent = text;
}

function toast(text) {
  const el = $("toast");
  el.textContent = text;
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 2500);
}

function init() {

  setLoad(15, "LOADING 3D ENGINE");

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x020409);

  camera = new THREE.PerspectiveCamera(
    45,
    innerWidth / innerHeight,
    .01,
    10000
  );

  camera.position.set(0, 1.8, 13);

  renderer = new THREE.WebGLRenderer({
    canvas: $("space"),
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  renderer.setSize(
    $("space").clientWidth,
    $("space").clientHeight,
    false
  );

  const ambient = new THREE.AmbientLight(0x667799, .45);
  scene.add(ambient);

  const sunlight = new THREE.PointLight(0xffffff, 3, 100);
  sunlight.position.set(8, 4, 7);
  scene.add(sunlight);

  createStars();
  createSun();
  createEarth();
  createMoon();

  setLoad(45, "BUILDING EARTH");

  window.addEventListener("resize", resize);

  $("space").addEventListener("pointerdown", onPointerDown);

  setupNavigation();
  setupControls();

  setLoad(65, "CONNECTING ORBITAL DATA");

  loadSatelliteData();

  loadMissions();

  setLoad(90, "STARTING MISSION CONTROL");

  setTimeout(() => {
    $("loading").style.opacity = "0";

    setTimeout(() => {
      $("loading").remove();
    }, 700);

  }, 900);

  updateClock();

  setInterval(updateClock, 1000);

  animate();
}

function createStars() {

  const count = 8000;

  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {

    const r = 60 + Math.random() * 180;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(
      2 * Math.random() - 1
    );

    positions[i] =
      r * Math.sin(phi) * Math.cos(theta);

    positions[i + 1] =
      r * Math.cos(phi);

    positions[i + 2] =
      r * Math.sin(phi) * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: .08,
    transparent: true,
    opacity: .8,
    sizeAttenuation: true
  });

  scene.add(
    new THREE.Points(geometry, material)
  );
}

function createSun() {

  const geometry = new THREE.SphereGeometry(
    2.2,
    48,
    48
  );

  const material = new THREE.MeshBasicMaterial({
    color: 0xffb52e
  });

  sun = new THREE.Mesh(
    geometry,
    material
  );

  sun.position.set(14, 3, -12);

  scene.add(sun);

  const glow = new THREE.PointLight(
    0xffaa44,
    4,
    100
  );

  glow.position.copy(sun.position);

  scene.add(glow);
}

function createEarth() {

  const geometry = new THREE.SphereGeometry(
    4,
    96,
    96
  );

  const material = new THREE.MeshStandardMaterial({
    color: 0x2458a6,
    roughness: .72,
    metalness: .02
  });

  earth = new THREE.Mesh(
    geometry,
    material
  );

  scene.add(earth);

  const atmosphereGeometry =
    new THREE.SphereGeometry(
      4.12,
      64,
      64
    );

  const atmosphereMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x299cff,
      transparent: true,
      opacity: .08,
      side: THREE.BackSide
    });

  earth.add(
    new THREE.Mesh(
      atmosphereGeometry,
      atmosphereMaterial
    )
  );

  addEarthLights();
}

function addEarthLights() {

  const canvas =
    document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#173e6f";
  ctx.fillRect(0, 0, 1024, 512);

  ctx.fillStyle = "#4f8fbd";

  for (let i = 0; i < 500; i++) {

    const x = Math.random() * 1024;
    const y = Math.random() * 512;

    const w = 2 + Math.random() * 12;
    const h = 1 + Math.random() * 7;

    ctx.fillRect(x, y, w, h);
  }

  const texture =
    new THREE.CanvasTexture(canvas);

  earth.material.map = texture;
  earth.material.needsUpdate = true;
}

function createMoon() {

  const geometry =
    new THREE.SphereGeometry(
      .9,
      40,
      40
    );

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x9b9b9b,
      roughness: 1
    });

  moon = new THREE.Mesh(
    geometry,
    material
  );

  scene.add(moon);
}

function updateMoon(time) {

  const orbit =
    time * .00015;

  moon.position.set(
    Math.cos(orbit) * 6.5,
    Math.sin(orbit * .35) * .5,
    Math.sin(orbit) * 6.5
  );
}

async function loadSatelliteData() {

  try {

    const [stations, starlink] =
      await Promise.all([
        fetchJSON(SATELLITE_API),
        fetchJSON(STARLINK_API)
      ]);

    const iss =
      stations.find(
        x =>
          String(x.NORAD_CAT_ID) === "25544" ||
          String(x.OBJECT_NAME || "")
            .includes("ISS")
      );

    state.iss = iss || null;

    state.starlink =
      Array.isArray(starlink)
        ? starlink.slice(0, 500)
        : [];

    satelliteData = [];

    if (state.iss) {

      satelliteData.push({
        ...state.iss,
        type: "ISS"
      });
    }

    state.starlink.forEach(s => {

      satelliteData.push({
        ...s,
        type: "STARLINK"
      });
    });

    state.lastSatelliteUpdate = new Date();

    $("objectCount").textContent =
      satelliteData.length.toLocaleString();

    $("orbitStatus").textContent = "ONLINE";
    $("orbitStatus").className = "green";

    $("systemISS").textContent =
      state.iss ? "ONLINE" : "OFFLINE";

    $("systemISS").className =
      state.iss ? "green" : "";

    $("systemStarlink").textContent =
      state.starlink.length
        ? "ONLINE"
        : "OFFLINE";

    $("systemStarlink").className =
      state.starlink.length
        ? "green"
        : "";

    $("issStatus").textContent =
      state.iss ? "ONLINE" : "OFFLINE";

    buildSatelliteList();

    createSatelliteObjects();

    toast(
      `ORBIT DATA: ${satelliteData.length} objects loaded`
    );

  } catch (error) {

    console.error(error);

    $("orbitStatus").textContent = "OFFLINE";
    $("orbitStatus").className = "";

    $("issStatus").textContent = "OFFLINE";

    toast(
      "Nie udało się pobrać danych orbitalnych"
    );
  }
}

async function fetchJSON(url) {

  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

function createSatelliteObjects() {

  satellites.forEach(s =>
    scene.remove(s.mesh)
  );

  satellites = [];

  satelliteData.forEach((data, index) => {

    const isISS = data.type === "ISS";

    const geometry =
      new THREE.SphereGeometry(
        isISS ? .13 : .045,
        10,
        10
      );

    const material =
      new THREE.MeshBasicMaterial({
        color: isISS
          ? 0x43f59b
          : 0x45d7ff
      });

    const mesh =
      new THREE.Mesh(
        geometry,
        material
      );

    mesh.userData.index = index;

    scene.add(mesh);

    satellites.push({
      mesh,
      data,
      position: {
        lat: 0,
        lon: 0,
        alt: 0,
        speed: 0
      }
    });
  });
}

function calculateSatellitePosition(data) {

  if (
    !data ||
    !data.MEAN_MOTION ||
    !data.INCLINATION
  ) {
    return null;
  }

  /*
    This simplified propagation gives the UI a
    continuously changing position based on the
    current orbital elements.

    For production-grade SGP4 propagation,
    satellite.js can be plugged in here.
  */

  const epoch =
    data.EPOCH
      ? new Date(data.EPOCH).getTime()
      : Date.now();

  const now = Date.now();

  const minutes =
    (now - epoch) / 60000;

  const period =
    1440 / Number(data.MEAN_MOTION);

  const phase =
    (minutes / period) *
    Math.PI *
    2;

  const inclination =
    Number(data.INCLINATION) *
    Math.PI / 180;

  const eccentricity =
    Number(data.ECCENTRICITY || 0);

  const altitude =
    Number(data.PERIGEE || 550) +
    (
      Number(data.APOGEE || 550) -
      Number(data.PERIGEE || 550)
    ) * .5;

  const radius =
    4 +
    altitude / 6371 * 4;

  const x =
    Math.cos(phase) *
    radius;

  const z =
    Math.sin(phase) *
    radius *
    Math.cos(inclination);

  const y =
    Math.sin(phase) *
    radius *
    Math.sin(inclination);

  const lon =
    (
      phase * 180 / Math.PI
    ) % 360 - 180;

  const lat =
    Math.sin(phase) *
    Number(data.INCLINATION);

  const speed =
    2 *
    Math.PI *
    6371 /
    (period * 60);

  return {
    x,
    y,
    z,
    lat,
    lon,
    alt: altitude,
    speed
  };
}

function updateSatellites() {

  satellites.forEach(sat => {

    const pos =
      calculateSatellitePosition(
        sat.data
      );

    if (!pos) return;

    sat.position = pos;

    sat.mesh.position.set(
      pos.x,
      pos.y,
      pos.z
    );
  });

  if (state.iss) {

    const iss =
      satellites.find(
        s => s.data.type === "ISS"
      );

    if (iss) {

      $("issAltitude").textContent =
        iss.position.alt.toFixed(0);

      $("issSpeed").textContent =
        iss.position.speed.toFixed(2);

      $("issLat").textContent =
        iss.position.lat.toFixed(2);

      $("issLon").textContent =
        iss.position.lon.toFixed(2);
    }
  }

  updateSelectedSatellite();
}

function buildSatelliteList() {

  const container =
    $("satelliteList");

  container.innerHTML = "";

  satelliteData
    .slice(0, 160)
    .forEach((data, index) => {

      const item =
        document.createElement("div");

      item.className = "sat-item";

      item.dataset.index = index;

      item.innerHTML = `
        <strong>
          ${escapeHTML(
            data.OBJECT_NAME || "UNKNOWN"
          )}
        </strong>
        <span>
          ${data.type || "SATELLITE"}
          · NORAD ${data.NORAD_CAT_ID || "—"}
        </span>
      `;

      item.addEventListener(
        "click",
        () => selectSatellite(index)
      );

      container.appendChild(item);
    });
}

function selectSatellite(index) {

  selectedSatellite =
    satellites[index];

  if (!selectedSatellite) return;

  const data =
    selectedSatellite.data;

  $("selectedName").textContent =
    data.OBJECT_NAME || "UNKNOWN";

  $("selectedType").textContent =
    data.type || "SATELLITE";

  $("selectedNorad").textContent =
    data.NORAD_CAT_ID || "—";

  document
    .querySelectorAll(".sat-item")
    .forEach(x =>
      x.classList.remove("selected")
    );

  const selected =
    document.querySelector(
      `.sat-item[data-index="${index}"]`
    );

  if (selected)
    selected.classList.add("selected");

  followTarget = selectedSatellite.mesh;

  toast(
    `TRACKING ${data.OBJECT_NAME || "OBJECT"}`
  );

  updateSelectedSatellite();
}

function updateSelectedSatellite() {

  if (!selectedSatellite) return;

  const p =
    selectedSatellite.position;

  $("selectedLat").textContent =
    `${p.lat.toFixed(3)}°`;

  $("selectedLon").textContent =
    `${p.lon.toFixed(3)}°`;

  $("selectedAlt").textContent =
    `${p.alt.toFixed(1)} km`;

  $("selectedSpeed").textContent =
    `${p.speed.toFixed(2)} km/s`;
}

function setupControls() {

  $("focusISS").addEventListener(
    "click",
    () => {

      const index =
        satelliteData.findIndex(
          x => x.type === "ISS"
        );

      if (index >= 0)
        selectSatellite(index);
    }
  );

  $("resetCamera").addEventListener(
    "click",
    () => {

      camera.position.set(
        0,
        1.8,
        13
      );

      followTarget = null;

      toast("CAMERA RESET");
    }
  );

  $("trackSelected").addEventListener(
    "click",
    () => {

      if (!selectedSatellite) return;

      followTarget =
        selectedSatellite.mesh;

      toast("OBJECT TRACKING ENABLED");
    }
  );

  $("satelliteSearch")
    .addEventListener(
      "input",
      event => {

        const query =
          event.target.value
            .toLowerCase();

        document
          .querySelectorAll(".sat-item")
          .forEach(item => {

            item.style.display =
              item.textContent
                .toLowerCase()
                .includes(query)
                  ? ""
                  : "none";
          });
      }
    );
}

function setupNavigation() {

  document
    .querySelectorAll(".nav")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const section =
            button.dataset.section;

          document
            .querySelectorAll(".nav")
            .forEach(x =>
              x.classList.remove("active")
            );

          button.classList.add("active");

          document
            .querySelectorAll(".section")
            .forEach(x =>
              x.classList.remove("active")
            );

          $(
            section
          ).classList.add("active");
        }
      );
    });
}

async function loadMissions() {

  try {

    const data =
      await fetchJSON(
        LAUNCH_API
      );

    const launches =
      data.results || [];

    state.lastMissionUpdate =
      new Date();

    const container =
      $("missionList");

    container.innerHTML = "";

    launches.forEach(launch => {

      const date =
        launch.net
          ? new Date(
              launch.net
            )
          : null;

      const article =
        document.createElement("article");

      article.className = "mission";

      article.innerHTML = `
        <div class="mission-date">
          ${
            date
              ? date.toISOString()
                  .slice(0,16)
                  .replace("T"," ")
              : "TBD"
          }
          UTC
        </div>

        <div>
          <h3>
            ${escapeHTML(
              launch.name || "Unnamed mission"
            )}
          </h3>

          <p>
            ${
              escapeHTML(
                launch.mission?.description ||
                launch.pad?.location?.name ||
                "Mission information"
              )
            }
          </p>
        </div>

        <div class="mission-company">
          ${
            escapeHTML(
              launch.launch_service_provider?.name ||
              "Unknown provider"
            )
          }
        </div>
      `;

      container.appendChild(article);
    });

  } catch (error) {

    console.error(error);

    $("missionList").innerHTML = `
      <div class="empty">
        Mission API unavailable.
      </div>
    `;
  }
}

function buildPlanets() {

  const planets = [
    ["Mercury", "INNER PLANET", "MESSENGER"],
    ["Venus", "TERRESTRIAL", "VENUS"],
    ["Earth", "HOME WORLD", "EARTH"],
    ["Mars", "TERRESTRIAL", "MARS"],
    ["Jupiter", "GAS GIANT", "JUPITER"],
    ["Saturn", "GAS GIANT", "SATURN"],
    ["Uranus", "ICE GIANT", "URANUS"],
    ["Neptune", "ICE GIANT", "NEPTUNE"]
  ];

  const container =
    $("planetGrid");

  planets.forEach(
    ([name, type, code]) => {

      const div =
        document.createElement("div");

      div.className = "planet";

      div.innerHTML = `
        <div class="orb"></div>
        <span>${type}</span>
        <h3>${name}</h3>
        <span>${code}</span>
      `;

      container.appendChild(div);
    }
  );
}

function onPointerDown(event) {

  const rect =
    $("space").getBoundingClientRect();

  mouse.x =
    ((event.clientX - rect.left) /
      rect.width) * 2 - 1;

  mouse.y =
    -((event.clientY - rect.top) /
      rect.height) * 2 + 1;

  raycaster.setFromCamera(
    mouse,
    camera
  );

  const hits =
    raycaster.intersectObjects(
      satellites.map(s => s.mesh)
    );

  if (!hits.length) return;

  const index =
    hits[0].object.userData.index;

  selectSatellite(index);
}

function resize() {

  const canvas = $("space");

  camera.aspect =
    canvas.clientWidth /
    canvas.clientHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    canvas.clientWidth,
    canvas.clientHeight,
    false
  );
}

function updateClock() {

  const now =
    new Date();

  const time =
    now.toISOString()
      .slice(11, 19);

  $("utcClock").textContent =
    time;

  $("bigTime").textContent =
    time;

  if (state.lastSatelliteUpdate) {

    const age =
      Math.floor(
        (Date.now() -
          state.lastSatelliteUpdate.getTime()) /
        1000
      );

    $("dataAge").textContent =
      age + "s";
  }
}

function animate() {

  requestAnimationFrame(
    animate
  );

  const time =
    performance.now();

  earth.rotation.y += .00018;

  sun.rotation.y += .0001;

  updateMoon(time);

  updateSatellites();

  if (followTarget) {

    const target =
      followTarget.position;

    const desired =
      target.clone()
        .normalize()
        .multiplyScalar(8);

    camera.position.lerp(
      desired,
      .025
    );

    camera.lookAt(
      controlsTarget
    );
  } else {

    camera.lookAt(
      controlsTarget
    );
  }

  renderer.render(
    scene,
    camera
  );
}

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

buildPlanets();
init();
