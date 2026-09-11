import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { OrbitControls } from
    "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";
/* =========================
   SCENE
========================= */
const canvas = document.getElementById("space");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02030a);
/* CAMERA */
const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
camera.position.set(0, 30, 90);
/* RENDERER */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false,
    powerPreference: "high-performance"
});
renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);
renderer.setSize(
    window.innerWidth,
    window.innerHeight
);
renderer.outputColorSpace =
    THREE.SRGBColorSpace;
/* =========================
   CONTROLS
========================= */
const controls = new OrbitControls(
    camera,
    renderer.domElement
);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 8;
controls.maxDistance = 300;
controls.rotateSpeed = 0.4;
controls.zoomSpeed = 0.7;
controls.enablePan = true;
/* =========================
   LIGHT
========================= */
scene.add(
    new THREE.AmbientLight(
        0xffffff,
        0.12
    )
);
const sunLight = new THREE.PointLight(
    0xffffff,
    4,
    500
);
scene.add(sunLight);
/* =========================
   STARS
========================= */
const starGeometry =
    new THREE.BufferGeometry();
const STAR_COUNT = 3000;
const positions =
    new Float32Array(
        STAR_COUNT * 3
    );
for (let i = 0; i < STAR_COUNT; i++) {
    const radius =
        250 + Math.random() * 700;
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
        size: 0.8,
        transparent: true,
        opacity: 0.8
    });
const stars =
    new THREE.Points(
        starGeometry,
        starMaterial
    );
scene.add(stars);
/* =========================
   SUN
========================= */
const sun =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            10,
            32,
            32
        ),
        new THREE.MeshBasicMaterial({
            color: 0xffa31a
        })
    );
scene.add(sun);
/* SUN GLOW */
const glow =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            12.5,
            24,
            24
        ),
        new THREE.MeshBasicMaterial({
            color: 0xff7700,
            transparent: true,
            opacity: 0.12,
            side: THREE.BackSide
        })
    );
scene.add(glow);
/* =========================
   PLANET DATA
========================= */
const data = {
    Mercury: {
        radius: 1.4,
        distance: 18,
        speed: 0.018,
        color: 0x8b8178,
        type: "TERRESTRIAL",
        diameter: "4 879 km",
        year: "88 DAYS",
        description:
            "Najmniejsza planeta Układu Słonecznego."
    },
    Venus: {
        radius: 2.2,
        distance: 28,
        speed: 0.014,
        color: 0xd6a15d,
        type: "TERRESTRIAL",
        diameter: "12 104 km",
        year: "225 DAYS",
        description:
            "Gorąca planeta posiadająca bardzo gęstą atmosferę."
    },
    Earth: {
        radius: 2.6,
        distance: 40,
        speed: 0.01,
        color: 0x2674d8,
        type: "TERRESTRIAL",
        diameter: "12 742 km",
        year: "365 DAYS",
        description:
            "Nasza planeta i jedyne znane miejsce posiadające życie."
    },
    Mars: {
        radius: 2,
        distance: 53,
        speed: 0.008,
        color: 0xb84d32,
        type: "TERRESTRIAL",
        diameter: "6 779 km",
        year: "687 DAYS",
        description:
            "Czerwona planeta z ogromnymi wulkanami i kanionami."
    },
    Jupiter: {
        radius: 6.5,
        distance: 78,
        speed: 0.004,
        color: 0xc99765,
        type: "GAS GIANT",
        diameter: "139 820 km",
        year: "12 YEARS",
        description:
            "Największa planeta Układu Słonecznego."
    },
    Saturn: {
        radius: 5.7,
        distance: 110,
        speed: 0.003,
        color: 0xd2b486,
        type: "GAS GIANT",
        diameter: "116 460 km",
        year: "29 YEARS",
        description:
            "Gazowy olbrzym słynący z ogromnych pierścieni."
    },
    Uranus: {
        radius: 3.8,
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
        radius: 3.7,
        distance: 170,
        speed: 0.0015,
        color: 0x315fd3,
        type: "ICE GIANT",
        diameter: "49 244 km",
        year: "165 YEARS",
        description:
            "Najdalsza planeta Układu Słonecznego."
    }
};
/* =========================
   ORBITS
========================= */
function createOrbit(radius) {
    const points = [];
    for (let i = 0; i <= 128; i++) {
        const angle =
            (i / 128) *
            Math.PI *
            2;
        points.push(
            new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            )
        );
    }
    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(points);
    const material =
        new THREE.LineBasicMaterial({
            color: 0x34394a,
            transparent: true,
            opacity: 0.3
        });
    scene.add(
        new THREE.LineLoop(
            geometry,
            material
        )
    );
}
/* =========================
   CREATE PLANETS
========================= */
const planets = [];
Object.entries(data).forEach(
    ([name, info]) => {
        createOrbit(
            info.distance
        );
        const mesh =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    info.radius,
                    24,
                    24
                ),
                new THREE.MeshStandardMaterial({
                    color: info.color,
                    roughness: 0.9
                })
            );
        mesh.userData.name = name;
        mesh.userData.info = info;
        mesh.position.x =
            info.distance;
        scene.add(mesh);
        planets.push({
            mesh: mesh,
            info: info,
            angle: Math.random() * Math.PI * 2
        });
        /* SATURN RINGS */
        if (name === "Saturn") {
            const ring =
                new THREE.Mesh(
                    new THREE.RingGeometry(
                        info.radius * 1.35,
                        info.radius * 2,
                        48
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0xc4ad8b,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.65
                    })
                );
            ring.rotation.x =
                Math.PI / 2.3;
            mesh.add(ring);
        }
    }
);
/* =========================
   MOON
========================= */
const earth =
    planets.find(
        p => p.mesh.userData.name === "Earth"
    );
const moonOrbit =
    new THREE.Object3D();
scene.add(moonOrbit);
const moon =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            0.75,
            16,
            16
        ),
        new THREE.MeshStandardMaterial({
            color: 0x999999,
            roughness: 1
        })
    );
moon.position.x = 6;
moonOrbit.add(moon);
/* =========================
   UI
========================= */
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
let selectedPlanet = null;
/* =========================
   RAYCASTER
========================= */
const raycaster =
    new THREE.Raycaster();
const pointer =
    new THREE.Vector2();
function selectPlanet(planet) {
    selectedPlanet = planet;
    const info =
        planet.mesh.userData.info;
    panelName.textContent =
        planet.mesh.userData.name
            .toUpperCase();
    panelDescription.textContent =
        info.description;
    panelType.textContent =
        info.type;
    panelDiameter.textContent =
        info.diameter;
    panelYear.textContent =
        info.year;
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
        info.description;
}
function pointerClick(event) {
    const rect =
        canvas.getBoundingClientRect();
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
    const hits =
        raycaster.intersectObjects(
            planets.map(
                p => p.mesh
            )
        );
    if (hits.length) {
        const planet =
            planets.find(
                p =>
                    p.mesh ===
                    hits[0].object
            );
        if (planet) {
            selectPlanet(planet);
        }
    }
}
canvas.addEventListener(
    "click",
    pointerClick
);
/* =========================
   CLOSE PANEL
========================= */
document
    .getElementById("closePanel")
    .onclick = () => {
        panel.classList.remove(
            "active"
        );
        resetInfo();
    };
function resetInfo() {
    document.getElementById(
        "objectName"
    ).innerHTML =
        "UKŁAD<br><span>SŁONECZNY</span>";
    document.getElementById(
        "objectDescription"
    ).textContent =
        "Przemierzaj Układ Słoneczny w pełnym 3D. Obracaj widok, przybliżaj i wybieraj planety.";
}
/* =========================
   FOCUS PLANET
========================= */
document
    .getElementById("focusButton")
    .onclick = () => {
        if (!selectedPlanet)
            return;
        const target =
            selectedPlanet.mesh.position;
        const direction =
            new THREE.Vector3()
                .subVectors(
                    camera.position,
                    target
                )
                .normalize();
        camera.position.copy(
            target.clone().add(
                direction.multiplyScalar(
                    selectedPlanet.info.radius * 5
                )
            )
        );
        controls.target.copy(
            target
        );
    };
/* =========================
   EXPLORE BUTTON
========================= */
document
    .getElementById("exploreButton")
    .onclick = () => {
        camera.position.set(
            0,
            30,
            90
        );
        controls.target.set(
            0,
            0,
            0
        );
        panel.classList.remove(
            "active"
        );
        resetInfo();
    };
/* =========================
   COORDINATES
========================= */
function updateCoordinates() {
    document.getElementById(
        "coordX"
    ).textContent =
        Math.round(
            camera.position.x
        )
        .toString()
        .padStart(3, "0");
    document.getElementById(
        "coordY"
    ).textContent =
        Math.round(
            camera.position.y
        )
        .toString()
        .padStart(3, "0");
    document.getElementById(
        "coordZ"
    ).textContent =
        Math.round(
            camera.position.z
        )
        .toString()
        .padStart(3, "0");
}
/* =========================
   ANIMATION
========================= */
const clock =
    new THREE.Clock();
function animate() {
    requestAnimationFrame(
        animate
    );
    const delta =
        clock.getDelta();
    /* PLANETS */
    planets.forEach(
        planet => {
            planet.angle +=
                planet.info.speed;
            planet.mesh.position.x =
                Math.cos(
                    planet.angle
                ) *
                planet.info.distance;
            planet.mesh.position.z =
                Math.sin(
                    planet.angle
                ) *
                planet.info.distance;
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
            delta * 0.5;
    }
    /* SUN */
    sun.rotation.y +=
        delta * 0.05;
    /* STARS */
    stars.rotation.y +=
        delta * 0.0005;
    controls.update();
    updateCoordinates();
    renderer.render(
        scene,
        camera
    );
}
/* =========================
   RESIZE
========================= */
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
                1.5
            )
        );
    }
);
/* =========================
   START
========================= */
animate();
/*
   Ukrywamy loader dopiero,
   gdy scena faktycznie wystartowała.
*/
requestAnimationFrame(() => {
    const loading =
        document.getElementById(
            "loading"
        );
    const app =
        document.getElementById(
            "app"
        );
    loading.classList.add(
        "hidden"
    );
    app.classList.add(
        "loaded"
    );
});
