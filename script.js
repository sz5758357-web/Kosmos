/* =====================================================
   COSMOS 1.0
   SPACE OPERATIONS CENTER
===================================================== */


/* =========================
   BASIC SETUP
========================= */

const canvas =
    document.getElementById("space");

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x010208);


/* =========================
   CAMERA
========================= */

const camera =
    new THREE.PerspectiveCamera(
        50,
        window.innerWidth /
        window.innerHeight,
        0.1,
        3000
    );

camera.position.set(
    0,
    35,
    110
);


/* =========================
   RENDERER
========================= */

const renderer =
    new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        powerPreference:
            "high-performance"
    });

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1.5
    )
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
        0.08
    )
);

const sunLight =
    new THREE.PointLight(
        0xffffff,
        3.5,
        1000
    );

scene.add(
    sunLight
);


/* =========================
   LOADING
========================= */

const loading =
    document.getElementById(
        "loading"
    );

const loadingProgress =
    document.getElementById(
        "loadingProgress"
    );

const loadingText =
    document.getElementById(
        "loadingText"
    );

const app =
    document.getElementById(
        "app"
    );


let loadPercent = 0;


function loadingStep(
    text,
    percent
) {

    loadingText.textContent =
        text;

    loadingProgress.style.width =
        percent + "%";
}


/* =========================
   STARS
========================= */

loadingStep(
    "BUILDING STAR FIELD...",
    15
);

const starGeometry =
    new THREE.BufferGeometry();

const starPositions = [];

const STAR_COUNT = 5000;

for (
    let i = 0;
    i < STAR_COUNT;
    i++
) {

    const radius =
        500 +
        Math.random() * 1000;

    const theta =
        Math.random() *
        Math.PI *
        2;

    const phi =
        Math.acos(
            2 *
            Math.random() -
            1
        );

    starPositions.push(
        radius *
        Math.sin(phi) *
        Math.cos(theta),

        radius *
        Math.cos(phi),

        radius *
        Math.sin(phi) *
        Math.sin(theta)
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
        size: 1.1,
        transparent: true,
        opacity: .85
    });

const stars =
    new THREE.Points(
        starGeometry,
        starMaterial
    );

scene.add(stars);


/* =========================
   TEXTURE LOADER
========================= */

const textureLoader =
    new THREE.TextureLoader();


const TEXTURES =
    "https://threejs.org/examples/textures/planets/";


function texture(
    filename
) {

    return textureLoader.load(
        TEXTURES + filename
    );
}


/* =========================
   SUN
========================= */

loadingStep(
    "INITIALIZING STAR...",
    25
);

const sun =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            9,
            32,
            32
        ),
        new THREE.MeshBasicMaterial({
            map: texture(
                "sun.jpg"
            )
        })
    );

scene.add(sun);


/* SUN GLOW */

const sunGlow =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            11,
            24,
            24
        ),
        new THREE.MeshBasicMaterial({
            color: 0xff9b22,
            transparent: true,
            opacity: .12,
            side:
                THREE.BackSide
        })
    );

scene.add(sunGlow);


/* =========================
   PLANET CONFIG
========================= */

const planetsData = [

    {
        name: "Mercury",
        radius: 1.4,
        distance: 18,
        speed: .018,
        texture: "mercury_1k.jpg",
        type: "TERRESTRIAL",
        velocity: "47.4 km/s"
    },

    {
        name: "Venus",
        radius: 2.2,
        distance: 28,
        speed: .014,
        texture: "venus_surface_1k.jpg",
        type: "TERRESTRIAL",
        velocity: "35.0 km/s"
    },

    {
        name: "Earth",
        radius: 2.7,
        distance: 40,
        speed: .010,
        texture: "earth_atmos_2048.jpg",
        type: "TERRESTRIAL",
        velocity: "29.8 km/s"
    },

    {
        name: "Mars",
        radius: 2,
        distance: 53,
        speed: .008,
        texture: "mars_1k_color.jpg",
        type: "TERRESTRIAL",
        velocity: "24.1 km/s"
    },

    {
        name: "Jupiter",
        radius: 6.5,
        distance: 78,
        speed: .004,
        texture: "jupiter_1k.jpg",
        type: "GAS GIANT",
        velocity: "13.1 km/s"
    },

    {
        name: "Saturn",
        radius: 5.7,
        distance: 110,
        speed: .003,
        texture: "saturn_1k.jpg",
        type: "GAS GIANT",
        velocity: "9.7 km/s"
    },

    {
        name: "Uranus",
        radius: 3.8,
        distance: 140,
        speed: .002,
        texture: "uranus_1k.jpg",
        type: "ICE GIANT",
        velocity: "6.8 km/s"
    },

    {
        name: "Neptune",
        radius: 3.7,
        distance: 170,
        speed: .0015,
        texture: "neptune_1k.jpg",
        type: "ICE GIANT",
        velocity: "5.4 km/s"
    }

];


const planets = [];


/* =========================
   ORBIT
========================= */

function createOrbit(
    radius
) {

    const points = [];

    for (
        let i = 0;
        i <= 160;
        i++
    ) {

        const angle =
            i /
            160 *
            Math.PI *
            2;

        points.push(
            new THREE.Vector3(
                Math.cos(angle) *
                radius,

                0,

                Math.sin(angle) *
                radius
            )
        );
    }

    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                points
            );

    const material =
        new THREE.LineBasicMaterial({
            color: 0x34405a,
            transparent: true,
            opacity: .28
        });

    const orbit =
        new THREE.LineLoop(
            geometry,
            material
        );

    scene.add(orbit);
}


/* =========================
   PLANETS
========================= */

loadingStep(
    "LOADING PLANETARY SYSTEM...",
    40
);


planetsData.forEach(
    data => {

        createOrbit(
            data.distance
        );


        const material =
            new THREE.MeshStandardMaterial({
                map: texture(
                    data.texture
                ),

                roughness: .9
            });


        const planet =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    data.radius,
                    32,
                    32
                ),

                material
            );


        planet.userData = {
            ...data,
            objectType: "planet"
        };


        planet.position.x =
            data.distance;


        scene.add(
            planet
        );


        planets.push({
            mesh: planet,
            angle:
                Math.random() *
                Math.PI *
                2
        });


        /* SATURN */

        if (
            data.name ===
            "Saturn"
        ) {

            const ring =
                new THREE.Mesh(
                    new THREE.RingGeometry(
                        data.radius *
                        1.35,

                        data.radius *
                        2,

                        64
                    ),

                    new THREE.MeshBasicMaterial({
                        color:
                            0xb9a788,

                        side:
                            THREE.DoubleSide,

                        transparent:
                            true,

                        opacity:
                            .65
                    })
                );

            ring.rotation.x =
                Math.PI / 2;

            planet.add(
                ring
            );
        }
    }
);


/* =========================
   EARTH ATMOSPHERE
========================= */

const earth =
    planets.find(
        p =>
            p.mesh.userData.name ===
            "Earth"
    );


if (earth) {

    const atmosphere =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2.85,
                32,
                32
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0x4fa8ff,

                transparent:
                    true,

                opacity:
                    .09,

                side:
                    THREE.BackSide
            })
        );

    earth.mesh.add(
        atmosphere
    );
}


/* =========================
   MOON
========================= */

loadingStep(
    "CALCULATING LUNAR ORBIT...",
    55
);


let moonOrbit;

if (earth) {

    moonOrbit =
        new THREE.Object3D();

    scene.add(
        moonOrbit
    );


    const moon =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .75,
                24,
                24
            ),

            new THREE.MeshStandardMaterial({
                map:
                    texture(
                        "moon_1024.jpg"
                    ),

                roughness:
                    1
            })
        );


    moon.position.x =
        6;


    moon.userData = {
        name: "Moon",
        objectType: "moon",
        type: "NATURAL SATELLITE",
        velocity: "1.02 km/s"
    };


    moonOrbit.add(
        moon
    );
}


/* =========================
   STARLINK
========================= */

loadingStep(
    "DEPLOYING SATELLITE NETWORK...",
    65
);


const starlinks = [];

const starlinkGroup =
    new THREE.Group();

scene.add(
    starlinkGroup
);


function createStarlink(
    index
) {

    const satellite =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .25,
                .08,
                .08
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0xdde8ff
            })
        );


    satellite.userData = {

        name:
            "STARLINK-" +
            String(
                index + 1
            ).padStart(
                4,
                "0"
            ),

        objectType:
            "starlink",

        type:
            "COMMUNICATION SATELLITE",

        velocity:
            "≈ 7.6 km/s",

        distance:
            "≈ 550 km"

    };


    satellite.userData.orbit =
        2.9 +
        Math.random() *
        .5;

    satellite.userData.angle =
        Math.random() *
        Math.PI *
        2;

    satellite.userData.inclination =
        (Math.random() -
        .5) *
        .9;


    starlinkGroup.add(
        satellite
    );

    starlinks.push(
        satellite
    );
}


for (
    let i = 0;
    i < 70;
    i++
) {

    createStarlink(i);
}


/* =========================
   POINTER
========================= */

const pointer =
    new THREE.Vector2();

const raycaster =
    new THREE.Raycaster();


function getPointer(
    event
) {

    const rect =
        canvas.getBoundingClientRect();

    pointer.x =
        (
            event.clientX -
            rect.left
        ) /
        rect.width *
        2 -
        1;

    pointer.y =
        -(
            (
                event.clientY -
                rect.top
            ) /
            rect.height
        ) *
        2 +
        1;
}


/* =========================
   INFO
========================= */

let selectedObject =
    earth ?
    earth.mesh :
    null;


function showObject(
    object
) {

    selectedObject =
        object;


    const data =
        object.userData;


    document.getElementById(
        "infoName"
    ).textContent =
        data.name
            .toUpperCase();


    document.getElementById(
        "objectTitle"
    ).textContent =
        data.name
            .toUpperCase();


    document.getElementById(
        "infoType"
    ).textContent =
        data.type ||
        "OBJECT";


    document.getElementById(
        "infoVelocity"
    ).textContent =
        data.velocity ||
        "—";


    document.getElementById(
        "infoDistance"
    ).textContent =
        data.distance ||
        "—";


    document.getElementById(
        "infoStatus"
    ).textContent =
        data.objectType ===
        "starlink"
            ? "ORBITING"
            : "ACTIVE";


    document.getElementById(
        "infoDescription"
    ).textContent =
        getDescription(
            data
        );


    document.getElementById(
        "objectDescription"
    ).textContent =
        getDescription(
            data
        );


    document.getElementById(
        "infoCard"
    ).classList.add(
        "visible"
    );
}


function getDescription(
    data
) {

    if (
        data.objectType ===
        "starlink"
    ) {

        return (
            "Satelita komunikacyjny " +
            "poruszający się po orbicie " +
            "okołoziemskiej. Wersja " +
            "COSMOS wykorzystuje tutaj " +
            "symulowany ruch konstelacji."
        );
    }


    if (
        data.name ===
        "Earth"
    ) {

        return (
            "Ziemia — trzecia planeta " +
            "od Słońca. Jedyny znany " +
            "świat posiadający życie."
        );
    }


    if (
        data.name ===
        "Moon"
    ) {

        return (
            "Naturalny satelita Ziemi " +
            "okrążający ją w czasie około " +
            "27,3 dnia."
        );
    }


    return (
        data.name +
        " — obiekt Układu " +
        "Słonecznego obserwowany " +
        "przez centrum COSMOS."
    );
}


/* =========================
   CLICK
========================= */

canvas.addEventListener(
    "pointerdown",
    event => {

        getPointer(
            event
        );

        raycaster.setFromCamera(
            pointer,
            camera
        );


        const objects = [
            ...planets.map(
                p =>
                    p.mesh
            ),

            ...starlinks
        ];


        const hits =
            raycaster.intersectObjects(
                objects
            );


        if (
            hits.length
        ) {

            showObject(
                hits[0].object
            );

            focusTarget(
                hits[0].object
            );
        }
    }
);


/* =========================
   CAMERA CONTROL
========================= */

let dragging =
    false;

let previousX =
    0;

let previousY =
    0;

let cameraAngle =
    0;

let cameraHeight =
    35;

let cameraDistance =
    110;


canvas.addEventListener(
    "pointerdown",
    event => {

        dragging = true;

        previousX =
            event.clientX;

        previousY =
            event.clientY;
    }
);


window.addEventListener(
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
            event.clientX -
            previousX;

        const dy =
            event.clientY -
            previousY;


        cameraAngle +=
            dx * .004;


        cameraHeight -=
            dy * .2;


        cameraHeight =
            Math.max(
                5,
                Math.min(
                    150,
                    cameraHeight
                )
            );


        previousX =
            event.clientX;

        previousY =
            event.clientY;
    }
);


/* =========================
   ZOOM
========================= */

canvas.addEventListener(
    "wheel",
    event => {

        cameraDistance +=
            event.deltaY *
            .08;


        cameraDistance =
            Math.max(
                15,
                Math.min(
                    500,
                    cameraDistance
                )
            );
    },
    {
        passive: true
    }
);


/* =========================
   FOCUS
========================= */

function focusTarget(
    object
) {

    if (!object)
        return;


    const distance =
        object.userData.objectType ===
        "planet"
            ? object.userData.radius
                ? object.userData.radius *
                  7
                : 15

            : 15;


    cameraDistance =
        Math.max(
            15,
            distance
        );
}


document.getElementById(
    "focusObject"
).onclick = () => {

    if (
        selectedObject
    ) {

        focusTarget(
            selectedObject
        );
    }
};


document.getElementById(
    "infoFocus"
).onclick = () => {

    if (
        selectedObject
    ) {

        focusTarget(
            selectedObject
        );
    }
};


document.getElementById(
    "resetView"
).onclick = () => {

    cameraAngle = 0;

    cameraHeight = 35;

    cameraDistance = 110;

    selectedObject = null;
};


/* =========================
   INFO CLOSE
========================= */

document.getElementById(
    "closeInfo"
).onclick = () => {

    document.getElementById(
        "infoCard"
    ).classList.remove(
        "visible"
    );
};


/* =========================
   MENU
========================= */

const sidebar =
    document.getElementById(
        "sidebar"
    );


document.getElementById(
    "menuButton"
).onclick = () => {

    sidebar.classList.toggle(
        "open"
    );
};


/* =========================
   MODALS
========================= */

const modal =
    document.getElementById(
        "sectionModal"
    );

const modalContent =
    document.getElementById(
        "modalContent"
    );


document.getElementById(
    "closeModal"
).onclick = () => {

    modal.classList.remove(
        "active"
    );
};


function openSection(
    section
) {

    let html = "";


    if (
        section ===
        "planets"
    ) {

        html = `
            <h2>PLANETARY SYSTEM</h2>

            <p>
                Aktualnie obserwowane obiekty
                Układu Słonecznego.
            </p>

            ${planetsData.map(
                planet => `
                    <div class="list-card">
                        <strong>
                            ${planet.name}
                        </strong>

                        <small>
                            ${planet.type}
                            ·
                            ${planet.velocity}
                        </small>
                    </div>
                `
            ).join("")}
        `;
    }


    if (
        section ===
        "missions"
    ) {

        html = `
            <h2>SPACE MISSIONS</h2>

            <div class="list-card">
                <strong>ARTEMIS</strong>
                <small>
                    Program powrotu ludzi
                    na Księżyc.
                </small>
            </div>

            <div class="list-card">
                <strong>JUNO</strong>
                <small>
                    Badanie Jowisza.
                </small>
            </div>

            <div class="list-card">
                <strong>JUICE</strong>
                <small>
                    Misja ESA badająca
                    układ Jowisza.
                </small>
            </div>

            <div class="list-card">
                <strong>EUCLID</strong>
                <small>
                    Obserwacje struktury
                    Wszechświata.
                </small>
            </div>
        `;
    }


    if (
        section ===
        "starlink"
    ) {

        html = `
            <h2>STARLINK</h2>

            <p>
                Konstelacja satelitów
                została tutaj przedstawiona
                jako symulacja orbitalna.
            </p>

            <div class="list-card">
                <strong>
                    ${starlinks.length}
                    SATELLITES
                </strong>

                <small>
                    SIMULATED ORBIT
                </small>
            </div>

            <div class="list-card">
                <strong>
                    ORBIT ALTITUDE
                </strong>

                <small>
                    ~550 km
                </small>
            </div>
        `;
    }


    if (
        section ===
        "stars"
    ) {

        html = `
            <h2>DEEP SPACE</h2>

            <p>
                Pole gwiazd COSMOS zawiera
                tysiące proceduralnie rozmieszczonych
                punktów świetlnych.
            </p>

            <div class="list-card">
                <strong>
                    MILKY WAY
                </strong>

                <small>
                    GALAXY · ~100 000 LY
                </small>
            </div>

            <div class="list-card">
                <strong>
                    SUN
                </strong>

                <small>
                    G-TYPE MAIN-SEQUENCE STAR
                </small>
            </div>
        `;
    }


    if (
        section ===
        "news"
    ) {

        html = `
            <h2>SPACE NEWS</h2>

            <div class="list-card">
                <strong>
                    DEEP SPACE OBSERVATION
                </strong>

                <small>
                    COSMOS SIMULATION FEED
                </small>
            </div>

            <div class="list-card">
                <strong>
                    ORBITAL NETWORK
                </strong>

                <small>
                    SATELLITE TRACKING SYSTEM
                </small>
            </div>

            <div class="list-card">
                <strong>
                    PLANETARY SCIENCE
                </strong>

                <small>
                    SOLAR SYSTEM MONITORING
                </small>
            </div>
        `;
    }


    if (
        section ===
        "home"
    ) {

        return;
    }


    modalContent.innerHTML =
        html;


    modal.classList.add(
        "active"
    );


    sidebar.classList.remove(
        "open"
    );
}


/* NAVIGATION */

document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(
                            item =>
                                item.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList.add(
                        "active"
                    );


                    openSection(
                        button.dataset.section
                    );
                }
            );
        }
    );


/* =========================
   STARLINK MOTION
========================= */

function updateStarlinks() {

    if (!earth)
        return;


    starlinks.forEach(
        satellite => {

            satellite.userData.angle +=
                .0025;


            const angle =
                satellite.userData.angle;

            const radius =
                satellite.userData.orbit;


            satellite.position.set(

                Math.cos(angle) *
                radius,

                Math.sin(
                    angle *
                    1.7
                ) *
                satellite.userData.inclination,

                Math.sin(angle) *
                radius

            );


            /*
              Starlink jest
              przedstawiony względem
              Ziemi.
            */

            satellite.position
                .add(
                    earth.mesh.position
                );


            satellite.rotation.y +=
                .01;
        }
    );
}


/* =========================
   PLANET MOTION
========================= */

function updatePlanets() {

    planets.forEach(
        planet => {

            const data =
                planet.mesh.userData;


            planet.angle +=
                data.speed;


            planet.mesh.position.x =
                Math.cos(
                    planet.angle
                ) *
                data.distance;


            planet.mesh.position.z =
                Math.sin(
                    planet.angle
                ) *
                data.distance;


            planet.mesh.rotation.y +=
                .0025;
        }
    );
}


/* =========================
   CAMERA
========================= */

function updateCamera() {

    if (
        selectedObject
    ) {

        const target =
            selectedObject
                .position;


        const desired =
            new THREE.Vector3(
                target.x +
                Math.sin(
                    cameraAngle
                ) *
                cameraDistance,

                target.y +
                cameraHeight,

                target.z +
                Math.cos(
                    cameraAngle
                ) *
                cameraDistance
            );


        camera.position.lerp(
            desired,
            .04
        );


        camera.lookAt(
            target
        );

    } else {

        const desired =
            new THREE.Vector3(
                Math.sin(
                    cameraAngle
                ) *
                cameraDistance,

                cameraHeight,

                Math.cos(
                    cameraAngle
                ) *
                cameraDistance
            );


        camera.position.lerp(
            desired,
            .04
        );


        camera.lookAt(
            0,
            0,
            0
        );
    }
}


/* =========================
   FPS
========================= */

let frames = 0;

let lastFPS =
    performance.now();


function updateFPS() {

    frames++;

    const now =
        performance.now();


    if (
        now -
        lastFPS >
        1000
    ) {

        document.getElementById(
            "fps"
        ).textContent =
            frames;


        frames = 0;

        lastFPS = now;
    }
}


/* =========================
   CAMERA DATA
========================= */

function updateHUD() {

    document.getElementById(
        "cameraData"
    ).textContent =
        "X " +
        Math.round(
            camera.position.x
        ) +

        "  Y " +

        Math.round(
            camera.position.y
        ) +

        "  Z " +

        Math.round(
            camera.position.z
        );
}


/* =========================
   ANIMATION
========================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    updatePlanets();

    updateStarlinks();

    updateCamera();

    updateHUD();

    updateFPS();


    sun.rotation.y +=
        .001;


    stars.rotation.y +=
        .00005;


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

loadingStep(
    "SPACE OPERATIONS READY...",
    100
);


setTimeout(
    () => {

        loading.classList.add(
            "hidden"
        );

        app.classList.add(
            "ready"
        );

    },
    500
);


animate();
