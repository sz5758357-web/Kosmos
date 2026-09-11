const canvas = document.getElementById("space");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x010208);


/* =========================
   CAMERA
========================= */

const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

camera.position.set(0, 35, 100);


/* =========================
   RENDERER
========================= */

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


/* =========================
   LIGHT
========================= */

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        0.2
    )
);

const sunLight =
    new THREE.PointLight(
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

const starPositions =
    [];

for (let i = 0; i < 3500; i++) {

    starPositions.push(
        (Math.random() - 0.5) * 1500,
        (Math.random() - 0.5) * 1500,
        (Math.random() - 0.5) * 1500
    );
}

starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
        starPositions,
        3
    )
);

const starMaterial =
    new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1
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
            24,
            24
        ),
        new THREE.MeshBasicMaterial({
            color: 0xffa52b
        })
    );

scene.add(sun);


/* =========================
   PLANETS
========================= */

const planets = [];

const planetData = [
    ["Merkury", 1.4, 18, 0x99918b, 0.018],
    ["Wenus", 2.2, 28, 0xd89b5c, 0.014],
    ["Ziemia", 2.6, 40, 0x2878d8, 0.010],
    ["Mars", 2, 53, 0xb84d32, 0.008],
    ["Jowisz", 6.5, 78, 0xc99b70, 0.004],
    ["Saturn", 5.7, 110, 0xd4b98d, 0.003],
    ["Uran", 3.8, 140, 0x76cbd1, 0.002],
    ["Neptun", 3.7, 170, 0x315fd3, 0.0015]
];


function createOrbit(radius) {

    const points = [];

    for (let i = 0; i <= 100; i++) {

        const a =
            i / 100 * Math.PI * 2;

        points.push(
            new THREE.Vector3(
                Math.cos(a) * radius,
                0,
                Math.sin(a) * radius
            )
        );
    }

    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(points);

    const material =
        new THREE.LineBasicMaterial({
            color: 0x34384a,
            transparent: true,
            opacity: 0.35
        });

    const orbit =
        new THREE.LineLoop(
            geometry,
            material
        );

    scene.add(orbit);
}


planetData.forEach(
    (data, index) => {

        const name = data[0];
        const radius = data[1];
        const distance = data[2];
        const color = data[3];
        const speed = data[4];

        createOrbit(distance);

        const planet =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    radius,
                    20,
                    20
                ),
                new THREE.MeshStandardMaterial({
                    color: color,
                    roughness: 0.9
                })
            );

        planet.userData = {
            name: name,
            distance: distance,
            speed: speed
        };

        planet.position.x =
            distance;

        scene.add(planet);

        planets.push({
            mesh: planet,
            angle: Math.random() * 6.28
        });


        if (name === "Saturn") {

            const ring =
                new THREE.Mesh(
                    new THREE.RingGeometry(
                        radius * 1.35,
                        radius * 2,
                        40
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0xc5b08e,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.6
                    })
                );

            ring.rotation.x =
                Math.PI / 2;

            planet.add(ring);
        }
    }
);


/* =========================
   MOUSE / TOUCH ROTATION
========================= */

let dragging = false;

let lastX = 0;
let lastY = 0;

let rotationX = 0;
let rotationY = 0;

canvas.addEventListener(
    "pointerdown",
    event => {

        dragging = true;

        lastX = event.clientX;
        lastY = event.clientY;
    }
);

canvas.addEventListener(
    "pointerup",
    () => {
        dragging = false;
    }
);

canvas.addEventListener(
    "pointermove",
    event => {

        if (!dragging)
            return;

        const dx =
            event.clientX - lastX;

        const dy =
            event.clientY - lastY;

        rotationY += dx * 0.004;
        rotationX += dy * 0.004;

        rotationX =
            Math.max(
                -1.2,
                Math.min(
                    1.2,
                    rotationX
                )
            );

        lastX = event.clientX;
        lastY = event.clientY;
    }
);


/* =========================
   ZOOM
========================= */

canvas.addEventListener(
    "wheel",
    event => {

        camera.position.z +=
            event.deltaY * 0.05;

        camera.position.z =
            Math.max(
                20,
                Math.min(
                    400,
                    camera.position.z
                )
            );
    },
    { passive: true }
);


/* =========================
   CLICK PLANET
========================= */

const raycaster =
    new THREE.Raycaster();

const pointer =
    new THREE.Vector2();


canvas.addEventListener(
    "click",
    event => {

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

        if (!hits.length)
            return;

        const planet =
            hits[0].object;

        openPlanet(planet);
    }
);


/* =========================
   PLANET INFO
========================= */

const card =
    document.getElementById(
        "planetCard"
    );

let selectedPlanet = null;


function openPlanet(planet) {

    selectedPlanet = planet;

    document.getElementById(
        "cardName"
    ).textContent =
        planet.userData.name
            .toUpperCase();

    document.getElementById(
        "planetName"
    ).textContent =
        planet.userData.name
            .toUpperCase();

    document.getElementById(
        "cardDescription"
    ).textContent =
        "Obiekt Układu Słonecznego znajdujący się w odległości około "
        +
        planet.userData.distance
        +
        " jednostek od Słońca.";

    document.getElementById(
        "diameter"
    ).textContent =
        "—";

    document.getElementById(
        "year"
    ).textContent =
        "—";

    card.classList.add(
        "active"
    );
}


/* =========================
   CLOSE
========================= */

document
    .getElementById("close")
    .onclick = () => {

        card.classList.remove(
            "active"
        );

        selectedPlanet = null;
    };


/* =========================
   FOCUS
========================= */

document
    .getElementById("focus")
    .onclick = () => {

        if (!selectedPlanet)
            return;

        camera.position.set(
            selectedPlanet.position.x,
            10,
            selectedPlanet.position.z + 25
        );
    };


/* =========================
   ANIMATION
========================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    /* Planets */

    planets.forEach(
        planet => {

            planet.angle +=
                planet.mesh.userData.speed;

            planet.mesh.position.x =
                Math.cos(
                    planet.angle
                ) *
                planet.mesh.userData.distance;

            planet.mesh.position.z =
                Math.sin(
                    planet.angle
                ) *
                planet.mesh.userData.distance;

            planet.mesh.rotation.y +=
                0.003;
        }
    );


    /* Camera rotation */

    camera.position.x =
        Math.sin(rotationY) *
        100;

    camera.position.y =
        35 +
        rotationX * 30;

    camera.lookAt(
        0,
        0,
        0
    );


    /* Stars */

    stars.rotation.y +=
        0.0002;


    /* Sun */

    sun.rotation.y +=
        0.002;


    /* Coordinates */

    document.getElementById(
        "coordinates"
    ).textContent =
        "X " +
        Math.round(camera.position.x) +
        "  Y " +
        Math.round(camera.position.y) +
        "  Z " +
        Math.round(camera.position.z);


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
    }
);


/* =========================
   START
========================= */

animate();


/* =========================
   REMOVE LOADING SCREEN
========================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(
            () => {

                document
                    .getElementById("loading")
                    .classList.add("hide");

            },
            700
        );
    }
);
