import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { OrbitControls } from
    "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";
/* ==============================
   BASIC SETUP
============================== */
const canvas =
    document.getElementById("space");
const scene =
    new THREE.Scene();
scene.background =
    new THREE.Color(0x02030a);
/* CAMERA */
const camera =
    new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        3000
    );
camera.position.set(
    0,
    35,
    100
);
/* RENDERER */
const renderer =
    new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance"
    });
renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);
renderer.setSize(
    window.innerWidth,
    window.innerHeight
);
renderer.outputColorSpace =
    THREE.SRGBColorSpace;
/* ==============================
   CONTROLS
============================== */
const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.minDistance = 8;
controls.maxDistance = 350;
controls.enablePan = true;
controls.panSpeed = 0.3;
controls.rotateSpeed = 0.35;
/* ==============================
   LIGHTS
============================== */
const ambient =
    new THREE.AmbientLight(
        0xffffff,
        0.08
    );
scene.add(ambient);
const sunLight =
    new THREE.PointLight(
        0xffffff,
        4,
        600
    );
sunLight.position.set(
    0,
    0,
    0
);
scene.add(sunLight);
/* ==============================
   STAR FIELD
============================== */
const starGeometry =
    new THREE.BufferGeometry();
const starCount = 12000;
const positions =
    new Float32Array(
        starCount * 3
    );
for (
    let i = 0;
    i < starCount;
    i++
) {
    const radius =
        300 + Math.random() * 900;
    const theta =
        Math.random() * Math.PI * 2;
    const phi =
        Math.acos(
            2 * Math.random() - 1
        );
    positions[i * 3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);
    positions[i * 3 + 1] =
        radius *
        Math.cos(phi);
    positions[i * 3 + 2] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);
}
starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        positions,
        3
    )
);
const starMaterial =
    new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true
    });
const stars =
    new THREE.Points(
        starGeometry,
        starMaterial
    );
scene.add(stars);
/* ==============================
   PLANETS
============================== */
const planets = [];
const planetData = {
    Mercury: {
        radius: 1.5,
        distance: 18,
        speed: 0.018,
        color: 0x8d8175,
        type: "TERRESTRIAL",
        diameter: "4 879 km",
        year: "88 DAYS",
        description:
            "Najmniejsza planeta Układu Słonecznego i planeta znajdująca się najbliżej Słońca."
    },
    Venus: {
        radius: 2.4,
        distance: 28,
        speed: 0.014,
        color: 0xd7a25b,
        type: "TERRESTRIAL",
        diameter: "12 104 km",
        year: "225 DAYS",
        description:
            "Druga planeta od Słońca. Jej atmosfera jest niezwykle gęsta i gorąca."
    },
    Earth: {
        radius: 2.7,
        distance: 40,
        speed: 0.01,
        color: 0x2674d8,
        type: "TERRESTRIAL",
        diameter: "12 742 km",
        year: "365 DAYS",
        description:
            "Nasza planeta. Ziemia posiada ciekłą wodę na powierzchni i znane nam życie."
    },
    Mars: {
        radius: 2.1,
        distance: 53,
        speed: 0.008,
        color: 0xb84d32,
        type: "TERRESTRIAL",
        diameter: "6 779 km",
        year: "687 DAYS",
        description:
            "Czerwona planeta posiadająca ogromne wulkany, kaniony i ślady dawnej obecności wody."
    },
    Jupiter: {
        radius: 7,
        distance: 78,
        speed: 0.004,
        color: 0xc99765,
        type: "GAS GIANT",
        diameter: "139 820 km",
        year: "12 YEARS",
        description:
            "Największa planeta Układu Słonecznego. Jest gazowym olbrzymem z potężnymi burzami."
    },
    Saturn: {
        radius: 6,
        distance: 110,
        speed: 0.003,
        color: 0xd2b486,
        type: "GAS GIANT",
        diameter: "116 460 km",
        year: "29 YEARS",
        description:
            "Gazowy olbrzym słynący z niezwykłego systemu pierścieni."
    },
    Uranus: {
        radius: 4,
        distance: 140,
        speed: 0.002,
        color: 0x79cbd0,
        type: "ICE GIANT",
        diameter: "50 724 km",
        year: "84 YEARS",
        description:
            "Lodowy olbrzym obracający się niemal na boku."
    },
    Neptune: {
        radius: 3.9,
        distance: 170,
        speed: 0.0015,
        color: 0x315fd3,
        type: "ICE GIANT",
        diameter: "49 244 km",
        year: "165 YEARS",
        description:
            "Najdalsza planeta Układu Słonecznego. Występują na niej ekstremalnie silne wiatry."
    }
};
/* SUN */
const sunGeometry =
    new THREE.SphereGeometry(
        10,
        64,
        64
    );
const sunMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffa319
    });
const sun =
    new THREE.Mesh(
        sunGeometry,
        sunMaterial
    );
scene.add(sun);
/* SUN GLOW */
const glowGeometry =
    new THREE.SphereGeometry(
        13,
        32,
        32
    );
const glowMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xff7b00,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide
    });
const sunGlow =
    new THREE.Mesh(
        glowGeometry,
        glowMaterial
    );
scene.add(sunGlow);
/* ORBIT */
function createOrbit(radius) {
    const curve =
        new THREE.EllipseCurve(
            0,
            0,
            radius,
            radius,
            0,
            Math.PI * 2,
            false,
            0
        );
    const points =
        curve.getPoints(256);
    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                points.map(
                    p =>
                        new THREE.Vector3(
                            p.x,
                            0,
                            p.y
                        )
                )
            );
    const material =
        new THREE.LineBasicMaterial({
            color: 0x3b4050,
            transparent: true,
            opacity: 0.25
        });
    const line =
        new THREE.LineLoop(
            geometry,
            material
        );
    scene.add(line);
}
/* CREATE PLANETS */
Object.entries(
    planetData
).forEach(
    ([name, data]) => {
        createOrbit(
            data.distance
        );
        const geometry =
            new THREE.SphereGeometry(
                data.radius,
                48,
                48
            );
        const material =
            new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.85,
                metalness: 0
            });
        const mesh =
            new THREE.Mesh(
                geometry,
                material
            );
        mesh.position.x =
            data.distance;
        mesh.userData.name =
            name;
        mesh.userData.data =
            data;
        scene.add(mesh);
        /* SATURN RINGS */
        if (name === "Saturn") {
            const ringGeometry =
                new THREE.RingGeometry(
                    data.radius * 1.35,
                    data.radius * 2.1,
                    96
                );
            const ringMaterial =
                new THREE.MeshBasicMaterial({
                    color: 0xc4ad8b,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.7
                });
            const rings =
                new THREE.Mesh(
                    ringGeometry,
                    ringMaterial
                );
            rings.rotation.x =
                Math.PI / 2.4;
            mesh.add(rings);
        }
        planets.push({
            mesh,
            data,
            angle:
                Math.random() *
                Math.PI *
                2
        });
    }
);
/* ==============================
   MOON
============================== */
const earth =
    planets.find(
        p => p.mesh.userData.name === "Earth"
    );
const moonOrbit =
    new THREE.Object3D();
scene.add(moonOrbit);
const moonGeometry =
    new THREE.SphereGeometry(
        0.8,
        32,
        32
    );
const moonMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 1
    });
const moon =
    new THREE.Mesh(
        moonGeometry,
        moonMaterial
    );
moon.position.x = 6;
moonOrbit.add(moon);
/* ==============================
   RAYCASTING
============================== */
const raycaster =
    new THREE.Raycaster();
const pointer =
    new THREE.Vector2();
let selectedPlanet = null;
const panel =
    document.getElementById(
        "planetPanel"
    );
const panelName =
    document.getElementById(
        "panelName"
    );
const panelDescription =
    document.getElementById(
        "panelDescription"
    );
const panelType =
    document.getElementById(
        "panelType"
    );
const panelDiameter =
    document.getElementById(
        "panelDiameter"
    );
const panelYear =
    document.getElementById(
        "panelYear"
    );
function selectPlanet(
    planet
) {
    selectedPlanet = planet;
    const data =
        planet.mesh.userData.data;
    panelName.textContent =
        planet.mesh.userData.name
            .toUpperCase();
    panelDescription.textContent =
        data.description;
    panelType.textContent =
        data.type;
    panelDiameter.textContent =
        data.diameter;
    panelYear.textContent =
        data.year;
    panel.classList.add(
        "active"
    );
    document.getElementById(
        "objectName"
    ).innerHTML =
        planet.mesh.userData.name
            .toUpperCase();
    document.getElementById(
        "objectDescription"
    ).textContent =
        data.description;
}
function checkIntersection(
    event
) {
    const rect =
        renderer.domElement
            .getBoundingClientRect();
    pointer.x =
        ((event.clientX - rect.left)
        / rect.width) * 2 - 1;
    pointer.y =
        -((event.clientY - rect.top)
        / rect.height) * 2 + 1;
    raycaster.setFromCamera(
        pointer,
        camera
    );
    const objects =
        planets.map(
            p => p.mesh
        );
    const hits =
        raycaster.intersectObjects(
            objects
        );
    if (hits.length > 0) {
        const found =
            planets.find(
                p =>
                    p.mesh ===
                    hits[0].object
            );
        if (found) {
            selectPlanet(found);
        }
    }
}
renderer.domElement.addEventListener(
    "click",
    checkIntersection
);
/* ==============================
   PANEL BUTTONS
============================== */
document
    .getElementById("closePanel")
    .addEventListener(
        "click",
        () => {
            panel.classList.remove(
                "active"
            );
            resetMainInfo();
        }
    );
document
    .getElementById("focusButton")
    .addEventListener(
        "click",
        () => {
            if (!selectedPlanet)
                return;
            const target =
                selectedPlanet.mesh
                    .position;
            const direction =
                new THREE.Vector3()
                    .subVectors(
                        camera.position,
                        target
                    )
                    .normalize();
            const newPosition =
                target.clone()
                    .add(
                        direction.multiplyScalar(
                            selectedPlanet.data.radius * 5
                        )
                    );
            camera.position.copy(
                newPosition
            );
            controls.target.copy(
                target
            );
        }
    );
document
    .getElementById("exploreButton")
    .addEventListener(
        "click",
        () => {
            camera.position.set(
                0,
                35,
                100
            );
            controls.target.set(
                0,
                0,
                0
            );
            panel.classList.remove(
                "active"
            );
            resetMainInfo();
        }
    );
function resetMainInfo() {
    document.getElementById(
        "objectName"
    ).innerHTML =
        "UKŁAD<br><span>SŁONECZNY</span>";
    document.getElementById(
        "objectDescription"
    ).textContent =
        "Przemierzaj Układ Słoneczny w pełnym 3D. Obracaj widok, przybliżaj i wybieraj planety.";
}
/* ==============================
   COORDINATES
============================== */
function updateCoordinates() {
    document.getElementById(
        "coordX"
    ).textContent =
        Math.round(camera.position.x)
            .toString()
            .padStart(3, "0");
    document.getElementById(
        "coordY"
    ).textContent =
        Math.round(camera.position.y)
            .toString()
            .padStart(3, "0");
    document.getElementById(
        "coordZ"
    ).textContent =
        Math.round(camera.position.z)
            .toString()
            .padStart(3, "0");
}
/* ==============================
   ANIMATION
============================== */
const clock =
    new THREE.Clock();
function animate() {
    requestAnimationFrame(
        animate
    );
    const delta =
        clock.getDelta();
    /* SUN */
    sun.rotation.y +=
        delta * 0.08;
    sunGlow.scale.x =
        1 +
        Math.sin(
            performance.now() * 0.001
        ) * 0.015;
    /* PLANETS */
    planets.forEach(
        planet => {
            planet.angle +=
                planet.data.speed;
            planet.mesh.position.x =
                Math.cos(
                    planet.angle
                ) *
                planet.data.distance;
            planet.mesh.position.z =
                Math.sin(
                    planet.angle
                ) *
                planet.data.distance;
            planet.mesh.rotation.y +=
                delta * 0.15;
        }
    );
    /* MOON */
    if (earth) {
        moonOrbit.position.copy(
            earth.mesh.position
        );
        moonOrbit.rotation.y +=
            delta * 0.7;
    }
    /* STARS */
    stars.rotation.y +=
        delta * 0.0008;
    controls.update();
    updateCoordinates();
    renderer.render(
        scene,
        camera
    );
}
/* ==============================
   RESIZE
============================== */
window.addEventListener(
    "resize",
    () => {
        camera.aspect =
            window.innerWidth /
            window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );
    }
);
/* ==============================
   START
============================== */
animate();
setTimeout(
    () => {
        document
            .getElementById("loading")
            .classList.add("hidden");
        document
            .getElementById("app")
            .classList.add("loaded");
    },
    1200
);
