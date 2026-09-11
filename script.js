/* =====================================================
   COSMOS 2.0
   MISSION CONTROL
===================================================== */


/* =====================================================
   DOM
===================================================== */

const canvas =
    document.getElementById("space");

const app =
    document.getElementById("app");

const loading =
    document.getElementById("loading");

const loaderBar =
    document.getElementById("loaderBar");

const loaderText =
    document.getElementById("loaderText");


/* =====================================================
   LOADING
===================================================== */

function loadStep(text, percent) {

    loaderText.textContent = text;
    loaderBar.style.width = percent + "%";
}


loadStep(
    "INITIALIZING MISSION CONTROL",
    10
);


/* =====================================================
   THREE.JS
===================================================== */

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x010207);


const camera =
    new THREE.PerspectiveCamera(
        48,
        window.innerWidth /
        window.innerHeight,
        .1,
        3000
    );


camera.position.set(
    0,
    35,
    115
);


const renderer =
    new THREE.WebGLRenderer({
        canvas,
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


/* =====================================================
   LIGHTING
===================================================== */

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        .08
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


/* =====================================================
   STAR FIELD
===================================================== */

loadStep(
    "GENERATING DEEP SPACE",
    20
);


const starGeometry =
    new THREE.BufferGeometry();

const starPositions = [];

const starCount = 7000;


for (
    let i = 0;
    i < starCount;
    i++
) {

    const radius =
        400 +
        Math.random() *
        1000;

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

        color:
            0xffffff,

        size:
            1.05,

        transparent:
            true,

        opacity:
            .9
    });


const stars =
    new THREE.Points(
        starGeometry,
        starMaterial
    );


scene.add(
    stars
);


/* =====================================================
   TEXTURES
===================================================== */

const textureLoader =
    new THREE.TextureLoader();


const TEXTURE_URL =
    "https://threejs.org/examples/textures/planets/";


function getTexture(name) {

    return textureLoader.load(
        TEXTURE_URL + name
    );
}


/* =====================================================
   SUN
===================================================== */

loadStep(
    "INITIALIZING SOLAR CORE",
    30
);


const sun =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            9,
            32,
            32
        ),

        new THREE.MeshBasicMaterial({
            map:
                getTexture(
                    "sun.jpg"
                )
        })
    );


sun.userData = {

    name:
        "Sun",

    type:
        "STAR",

    velocity:
        "220 km/s",

    distance:
        "0 AU",

    description:
        "Gwiazda centralna Układu Słonecznego."
};


scene.add(
    sun
);


/* SUN GLOW */

const sunGlow =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            11,
            24,
            24
        ),

        new THREE.MeshBasicMaterial({

            color:
                0xff9b32,

            transparent:
                true,

            opacity:
                .13,

            side:
                THREE.BackSide
        })
    );


scene.add(
    sunGlow
);


/* =====================================================
   PLANETS
===================================================== */

loadStep(
    "LOADING PLANETARY TELEMETRY",
    42
);


const planetData = [

    {
        name: "Mercury",
        radius: 1.35,
        distance: 18,
        speed: .018,
        texture: "mercury_1k.jpg",
        type: "TERRESTRIAL PLANET",
        velocity: "47.4 km/s",
        distanceText: "0.39 AU"
    },

    {
        name: "Venus",
        radius: 2.1,
        distance: 28,
        speed: .014,
        texture: "venus_surface_1k.jpg",
        type: "TERRESTRIAL PLANET",
        velocity: "35.0 km/s",
        distanceText: "0.72 AU"
    },

    {
        name: "Earth",
        radius: 2.65,
        distance: 40,
        speed: .010,
        texture: "earth_atmos_2048.jpg",
        type: "TERRESTRIAL PLANET",
        velocity: "29.8 km/s",
        distanceText: "1.00 AU"
    },

    {
        name: "Mars",
        radius: 2.0,
        distance: 53,
        speed: .008,
        texture: "mars_1k_color.jpg",
        type: "TERRESTRIAL PLANET",
        velocity: "24.1 km/s",
        distanceText: "1.52 AU"
    },

    {
        name: "Jupiter",
        radius: 6.5,
        distance: 78,
        speed: .004,
        texture: "jupiter_1k.jpg",
        type: "GAS GIANT",
        velocity: "13.1 km/s",
        distanceText: "5.20 AU"
    },

    {
        name: "Saturn",
        radius: 5.7,
        distance: 110,
        speed: .003,
        texture: "saturn_1k.jpg",
        type: "GAS GIANT",
        velocity: "9.7 km/s",
        distanceText: "9.58 AU"
    },

    {
        name: "Uranus",
        radius: 3.8,
        distance: 140,
        speed: .002,
        texture: "uranus_1k.jpg",
        type: "ICE GIANT",
        velocity: "6.8 km/s",
        distanceText: "19.2 AU"
    },

    {
        name: "Neptune",
        radius: 3.7,
        distance: 170,
        speed: .0015,
        texture: "neptune_1k.jpg",
        type: "ICE GIANT",
        velocity: "5.4 km/s",
        distanceText: "30.1 AU"
    }

];


const planets = [];


/* =====================================================
   ORBITS
===================================================== */

function createOrbit(radius) {

    const points = [];

    for (
        let i = 0;
        i <= 180;
        i++
    ) {

        const angle =
            (
                i / 180
            ) *
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

            color:
                0x34415d,

            transparent:
                true,

            opacity:
                .32
        });


    const orbit =
        new THREE.LineLoop(
            geometry,
            material
        );


    scene.add(
        orbit
    );
}


/* =====================================================
   CREATE PLANETS
===================================================== */

planetData.forEach(
    data => {

        createOrbit(
            data.distance
        );


        const planet =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    data.radius,
                    32,
                    32
                ),

                new THREE.MeshStandardMaterial({

                    map:
                        getTexture(
                            data.texture
                        ),

                    roughness:
                        .9
                })
            );


        planet.userData = {

            ...data,

            objectType:
                "planet"
        };


        const angle =
            Math.random() *
            Math.PI *
            2;


        planet.position.set(

            Math.cos(angle) *
            data.distance,

            0,

            Math.sin(angle) *
            data.distance
        );


        scene.add(
            planet
        );


        planets.push({

            mesh:
                planet,

            angle:
                angle
        });


        /* SATURN RINGS */

        if (
            data.name ===
            "Saturn"
        ) {

            const rings =
                new THREE.Mesh(

                    new THREE.RingGeometry(
                        data.radius *
                        1.35,

                        data.radius *
                        2.05,

                        80
                    ),

                    new THREE.MeshBasicMaterial({

                        color:
                            0xc6b89d,

                        transparent:
                            true,

                        opacity:
                            .65,

                        side:
                            THREE.DoubleSide
                    })
                );


            rings.rotation.x =
                Math.PI / 2;


            planet.add(
                rings
            );
        }
    }
);


/* =====================================================
   MOON
===================================================== */

loadStep(
    "CALIBRATING LUNAR SYSTEM",
    55
);


const earth =
    planets.find(
        p =>
            p.mesh.userData.name ===
            "Earth"
    );


let moon;
let moonOrbit;


if (earth) {

    moonOrbit =
        new THREE.Object3D();


    scene.add(
        moonOrbit
    );


    moon =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .75,
                24,
                24
            ),

            new THREE.MeshStandardMaterial({

                map:
                    getTexture(
                        "moon_1024.jpg"
                    ),

                roughness:
                    1
            })
        );


    moon.position.x =
        6;


    moon.userData = {

        name:
            "Moon",

        type:
            "NATURAL SATELLITE",

        velocity:
            "1.02 km/s",

        distance:
            "384,400 km",

        description:
            "Naturalny satelita Ziemi."
    };


    moonOrbit.add(
        moon
    );
}


/* =====================================================
   STARLINK
===================================================== */

loadStep(
    "INITIALIZING ORBITAL NETWORK",
    65
);


const starlinkGroup =
    new THREE.Group();


scene.add(
    starlinkGroup
);


const starlinks = [];


for (
    let i = 0;
    i < 70;
    i++
) {

    const satellite =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .22,
                .07,
                .07
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0xe9f1ff
            })
        );


    satellite.userData = {

        name:
            "STARLINK-" +
            String(
                i + 1
            ).padStart(
                4,
                "0"
            ),

        type:
            "COMMUNICATION SATELLITE",

        velocity:
            "≈ 7.6 km/s",

        distance:
            "≈ 550 km",

        description:
            "Symulowany satelita konstelacji Starlink."
    };


    satellite.userData.angle =
        Math.random() *
        Math.PI *
        2;


    satellite.userData.radius =
        4.0 +
        Math.random() *
        .6;


    satellite.userData.inclination =
        (
            Math.random() -
            .5
        ) *
        1.2;


    starlinkGroup.add(
        satellite
    );


    starlinks.push(
        satellite
    );
}


/* =====================================================
   STATE
===================================================== */

let selectedObject =
    earth ?
    earth.mesh :
    sun;


let dragging =
    false;

let lastPointerX =
    0;

let lastPointerY =
    0;

let cameraAngle =
    .3;

let cameraHeight =
    35;

let cameraDistance =
    115;


/* =====================================================
   RAYCASTER
===================================================== */

const raycaster =
    new THREE.Raycaster();


const pointer =
    new THREE.Vector2();


function pointerPosition(event) {

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


/* =====================================================
   OBJECT INFORMATION
===================================================== */

function selectObject(object) {

    if (!object)
        return;


    selectedObject =
        object;


    const data =
        object.userData;


    document.getElementById(
        "heroTitle"
    ).textContent =
        (
            data.name ||
            "UNKNOWN"
        ).toUpperCase();


    document.getElementById(
        "heroDescription"
    ).textContent =
        data.description ||
        (
            data.name +
            " — observation target."
        );


    document.getElementById(
        "objectName"
    ).textContent =
        (
            data.name ||
            "UNKNOWN"
        ).toUpperCase();


    document.getElementById(
        "objectDescription"
    ).textContent =
        data.description ||
        "Observation target.";


    document.getElementById(
        "objectType"
    ).textContent =
        data.type ||
        "OBJECT";


    document.getElementById(
        "objectVelocity"
    ).textContent =
        data.velocity ||
        "—";


    document.getElementById(
        "objectDistance"
    ).textContent =
        data.distanceText ||
        data.distance ||
        "—";


    document.getElementById(
        "objectCard"
    ).classList.add(
        "show"
    );


    focusObject();
}


/* =====================================================
   CLICK
===================================================== */

canvas.addEventListener(
    "pointerup",
    event => {

        if (
            Math.abs(
                event.clientX -
                lastPointerX
            ) > 8
        ) return;


        pointerPosition(
            event
        );


        raycaster.setFromCamera(
            pointer,
            camera
        );


        const targets = [

            ...planets.map(
                p =>
                    p.mesh
            ),

            moon,

            sun,

            ...starlinks

        ].filter(Boolean);


        const hits =
            raycaster.intersectObjects(
                targets
            );


        if (
            hits.length
        ) {

            selectObject(
                hits[0].object
            );
        }
    }
);


/* =====================================================
   CAMERA DRAG
===================================================== */

canvas.addEventListener(
    "pointerdown",
    event => {

        dragging = true;

        lastPointerX =
            event.clientX;

        lastPointerY =
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
            lastPointerX;


        const dy =
            event.clientY -
            lastPointerY;


        cameraAngle +=
            dx * .004;


        cameraHeight -=
            dy * .18;


        cameraHeight =
            Math.max(
                5,
                Math.min(
                    150,
                    cameraHeight
                )
            );


        lastPointerX =
            event.clientX;

        lastPointerY =
            event.clientY;
    }
);


/* =====================================================
   ZOOM
===================================================== */

canvas.addEventListener(
    "wheel",
    event => {

        cameraDistance +=
            event.deltaY *
            .08;


        cameraDistance =
            Math.max(
                12,
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


/* =====================================================
   FOCUS
===================================================== */

function focusObject() {

    if (
        !selectedObject
    ) return;


    const type =
        selectedObject.userData
            .objectType;


    if (
        type ===
        "planet"
    ) {

        cameraDistance =
            Math.max(
                15,
                selectedObject.userData.radius *
                7
            );

    } else {

        cameraDistance =
            18;
    }
}


document.getElementById(
    "focusBtn"
).onclick =
    focusObject;


document.getElementById(
    "objectTrack"
).onclick =
    focusObject;


document.getElementById(
    "resetBtn"
).onclick =
    () => {

        selectedObject =
            null;

        cameraAngle =
            .3;

        cameraHeight =
            35;

        cameraDistance =
            115;

        document.getElementById(
            "objectCard"
        ).classList.remove(
            "show"
        );
    };


document.getElementById(
    "closeObject"
).onclick =
    () => {

        document.getElementById(
            "objectCard"
        ).classList.remove(
            "show"
        );
    };


/* =====================================================
   CAMERA UPDATE
===================================================== */

function updateCamera() {

    let target =
        new THREE.Vector3(
            0,
            0,
            0
        );


    if (
        selectedObject
    ) {

        target =
            selectedObject.position;
    }


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
        .045
    );


    camera.lookAt(
        target
    );
}


/* =====================================================
   PLANET MOTION
===================================================== */

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
                .002;
        }
    );
}


/* =====================================================
   MOON MOTION
===================================================== */

function updateMoon() {

    if (!moonOrbit)
        return;


    moonOrbit.rotation.y +=
        .006;
}


/* =====================================================
   STARLINK MOTION
===================================================== */

function updateStarlink() {

    if (!earth)
        return;


    starlinks.forEach(
        satellite => {

            satellite.userData.angle +=
                .003;


            const angle =
                satellite.userData.angle;


            const radius =
                satellite.userData.radius;


            satellite.position.set(

                Math.cos(angle) *
                radius,

                Math.sin(
                    angle *
                    1.7
                ) *
                satellite.userData
                    .inclination,

                Math.sin(angle) *
                radius

            );


            satellite.position.add(
                earth.mesh.position
            );


            satellite.rotation.y +=
                .01;
        }
    );
}


/* =====================================================
   TIME
===================================================== */

function updateClock() {

    const now =
        new Date();


    const h =
        String(
            now.getUTCHours()
        ).padStart(
            2,
            "0"
        );


    const m =
        String(
            now.getUTCMinutes()
        ).padStart(
            2,
            "0"
        );


    const s =
        String(
            now.getUTCSeconds()
        ).padStart(
            2,
            "0"
        );


    document.getElementById(
        "utcClock"
    ).textContent =
        `${h}:${m}:${s}`;
}


/* =====================================================
   TELEMETRY
===================================================== */

function updateTelemetry() {

    document.getElementById(
        "camX"
    ).textContent =
        Math.round(
            camera.position.x
        );


    document.getElementById(
        "camY"
    ).textContent =
        Math.round(
            camera.position.y
        );


    document.getElementById(
        "camZ"
    ).textContent =
        Math.round(
            camera.position.z
        );
}


/* =====================================================
   FPS
===================================================== */

let frames =
    0;

let fpsTime =
    performance.now();


function updateFPS() {

    frames++;


    const now =
        performance.now();


    if (
        now -
        fpsTime >
        1000
    ) {

        document.getElementById(
            "fps"
        ).textContent =
            frames;


        frames =
            0;

        fpsTime =
            now;
    }
}


/* =====================================================
   NAVIGATION PANELS
===================================================== */

const overlay =
    document.getElementById(
        "panelOverlay"
    );


const panelContent =
    document.getElementById(
        "panelContent"
    );


function openPanel(page) {

    let content = "";


    if (
        page ===
        "planets"
    ) {

        content = `
            <h2>PLANETS</h2>

            <p>
                Planetary tracking and orbital
                observation system.
            </p>

            <div class="panel-list">

                ${planetData.map(
                    p => `

                    <div class="panel-item">

                        <strong>
                            ${p.name.toUpperCase()}
                        </strong>

                        <span>
                            ${p.type}<br>
                            Velocity:
                            ${p.velocity}<br>
                            Distance:
                            ${p.distanceText}
                        </span>

                    </div>

                `
                ).join("")}

            </div>
        `;
    }


    if (
        page ===
        "missions"
    ) {

        content = `
            <h2>SPACE MISSIONS</h2>

            <p>
                Mission monitoring center.
            </p>

            <div class="panel-list">

                <div class="panel-item">
                    <strong>ARTEMIS</strong>
                    <span>
                        Lunar exploration program.
                        Status: ACTIVE
                    </span>
                </div>

                <div class="panel-item">
                    <strong>JUICE</strong>
                    <span>
                        Jupiter Icy Moons Explorer.
                        Status: EN ROUTE
                    </span>
                </div>

                <div class="panel-item">
                    <strong>JUNO</strong>
                    <span>
                        Jupiter observation mission.
                        Status: ACTIVE
                    </span>
                </div>

                <div class="panel-item">
                    <strong>EUCLID</strong>
                    <span>
                        Deep-space cosmology mission.
                        Status: ACTIVE
                    </span>
                </div>

            </div>
        `;
    }


    if (
        page ===
        "starlink"
    ) {

        content = `
            <h2>STARLINK</h2>

            <p>
                Orbital visualization of a
                simulated low-Earth-orbit
                satellite constellation.
            </p>

            <div class="panel-list">

                <div class="panel-item">
                    <strong>
                        ${starlinks.length}
                    </strong>

                    <span>
                        SATELLITES IN SIMULATION
                    </span>
                </div>

                <div class="panel-item">
                    <strong>
                        ~550 KM
                    </strong>

                    <span>
                        SIMULATED ORBIT ALTITUDE
                    </span>
                </div>

                <div class="panel-item">
                    <strong>
                        ~7.6 KM/S
                    </strong>

                    <span>
                        APPROXIMATE ORBITAL VELOCITY
                    </span>
                </div>

                <div class="panel-item">
                    <strong>
                        LEO
                    </strong>

                    <span>
                        LOW EARTH ORBIT
                    </span>
                </div>

            </div>
        `;
    }


    if (
        page ===
        "stars"
    ) {

        content = `
            <h2>DEEP SPACE</h2>

            <p>
                Explore the simulated stellar
                background surrounding the
                solar system.
            </p>

            <div class="panel-list">

                <div class="panel-item">
                    <strong>SUN</strong>
                    <span>
                        G-type main-sequence star
                    </span>
                </div>

                <div class="panel-item">
                    <strong>MILKY WAY</strong>
                    <span>
                        Our home galaxy.
                    </span>
                </div>

                <div class="panel-item">
                    <strong>STAR FIELD</strong>
                    <span>
                        7,000 procedural stars
                        rendered in the scene.
                    </span>
                </div>

                <div class="panel-item">
                    <strong>DEEP SPACE</strong>
                    <span>
                        Long-range observation mode.
                    </span>
                </div>

            </div>
        `;
    }


    if (
        page ===
        "news"
    ) {

        content = `
            <h2>SPACE NEWS</h2>

            <p>
                COSMOS information feed.
            </p>

            <div class="panel-list">

                <div class="panel-item">
                    <strong>
                        ORBITAL MONITORING
                    </strong>
                    <span>
                        Satellite tracking systems
                        are online.
                    </span>
                </div>

                <div class="panel-item">
                    <strong>
                        LUNAR EXPLORATION
                    </strong>
                    <span>
                        Lunar mission monitoring
                        available.
                    </span>
                </div>

                <div class="panel-item">
                    <strong>
                        DEEP SPACE
                    </strong>
                    <span>
                        Observatory systems active.
                    </span>
                </div>

                <div class="panel-item">
                    <strong>
                        SOLAR SYSTEM
                    </strong>
                    <span>
                        Planetary simulation running.
                    </span>
                </div>

            </div>
        `;
    }


    if (
        page ===
        "home"
    ) {

        return;
    }


    panelContent.innerHTML =
        content;


    overlay.classList.add(
        "show"
    );


    document.getElementById(
        "sidebar"
    ).classList.remove(
        "open"
    );
}


/* =====================================================
   NAV BUTTONS
===================================================== */

document
    .querySelectorAll(".nav")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".nav"
                        )
                        .forEach(
                            n =>
                                n.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList.add(
                        "active"
                    );


                    openPanel(
                        button.dataset.page
                    );
                }
            );
        }
    );


/* =====================================================
   CLOSE PANEL
===================================================== */

document.getElementById(
    "closePanel"
).onclick =
    () => {

        overlay.classList.remove(
            "show"
        );
    };


overlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            overlay
        ) {

            overlay.classList.remove(
                "show"
            );
        }
    }
);


/* =====================================================
   MOBILE MENU
===================================================== */

document.getElementById(
    "menuBtn"
).onclick =
    () => {

        document
            .getElementById(
                "sidebar"
            )
            .classList.toggle(
                "open"
            );
    };


/* =====================================================
   RESIZE
===================================================== */

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


/* =====================================================
   ANIMATION
===================================================== */

function animate() {

    requestAnimationFrame(
        animate
    );


    updatePlanets();

    updateMoon();

    updateStarlink();

    updateCamera();

    updateTelemetry();

    updateClock();

    updateFPS();


    sun.rotation.y +=
        .0015;


    stars.rotation.y +=
        .00003;


    renderer.render(
        scene,
        camera
    );
}


/* =====================================================
   START
===================================================== */

loadStep(
    "MISSION CONTROL ONLINE",
    100
);


setTimeout(
    () => {

        loading.classList.add(
            "hide"
        );

        app.classList.add(
            "ready"
        );

    },
    700
);


animate();
