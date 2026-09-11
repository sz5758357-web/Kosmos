import * as THREE from "three";
import * as satellite from "satellite.js";


// ============================================================
// KONFIGURACJA
// ============================================================

const API = {
    ISS: "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=JSON",
    STARLINK: "https://celestrak.org/NORAD/elements/gp.php?GROUP=STARLINK&FORMAT=JSON",
    MISJE: "https://ll.thespacedevs.com/2.3.0/launches/?limit=15&ordering=net",
    NASA: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY"
};


let satelity = [];
let issDane = null;
let wybranySatelita = null;

let scena;
let kamera;
let renderer;
let ziemia;
let ksiezyc;
let slonce;
let grupaSatelitow;

let raycaster;
let mysz;

let odlegloscKamery = 3.7;
let obracanie = false;
let ostatniaPozycja = { x: 0, y: 0 };


// ============================================================
// ELEMENTY
// ============================================================

const $ = id => document.getElementById(id);

const ekranStartowy = $("ekranStartowy");
const postep = $("postepLadowania");
const tekstLadowania = $("tekstLadowania");


// ============================================================
// START
// ============================================================

window.addEventListener("load", async () => {

    await animacjaStartowa();

    inicjalizuj3D();
    inicjalizujMenu();
    inicjalizujPlanety();
    inicjalizujInterakcje();

    await Promise.allSettled([
        pobierzISS(),
        pobierzStarlink(),
        pobierzMisje(),
        pobierzNASA()
    ]);

    aktualizujSystem();

    setTimeout(() => {
        ekranStartowy.classList.add("ukryty");
    }, 500);
});


// ============================================================
// EKRAN STARTOWY
// ============================================================

async function animacjaStartowa() {

    const etapy = [
        "Uruchamianie centrum kontroli...",
        "Inicjalizacja wizualizacji 3D...",
        "Łączenie z danymi orbitalnymi...",
        "Pobieranie danych ISS...",
        "Pobieranie danych satelitów...",
        "Pobieranie danych misji...",
        "Łączenie z NASA...",
        "System gotowy."
    ];

    for (let i = 0; i < etapy.length; i++) {

        tekstLadowania.textContent = etapy[i];
        postep.style.width = `${((i + 1) / etapy.length) * 100}%`;

        await sleep(180);
    }
}


// ============================================================
// THREE.JS
// ============================================================

function inicjalizuj3D() {

    scena = new THREE.Scene();

    scena.background = new THREE.Color(0x02030a);

    kamera = new THREE.PerspectiveCamera(
        50,
        1,
        0.01,
        1000
    );

    kamera.position.set(0, 0.4, odlegloscKamery);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.7)
    );

    renderer.setSize(
        $("scena3D").clientWidth,
        $("scena3D").clientHeight
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    $("scena3D").appendChild(renderer.domElement);


    // ŚWIATŁO

    const ambient = new THREE.AmbientLight(
        0x8899bb,
        0.5
    );

    scena.add(ambient);


    // SŁOŃCE

    const swiatloSlonca = new THREE.PointLight(
        0xffffff,
        7,
        50
    );

    swiatloSlonca.position.set(
        5,
        3,
        4
    );

    scena.add(swiatloSlonca);


    slonce = stworzSlonce();

    scena.add(slonce);


    // ZIEMIA

    const geometriaZiemi =
        new THREE.SphereGeometry(1, 64, 64);

    const materialZiemi =
        new THREE.MeshStandardMaterial({
            color: 0x2477bd,
            roughness: 0.85,
            metalness: 0
        });

    ziemia = new THREE.Mesh(
        geometriaZiemi,
        materialZiemi
    );

    scena.add(ziemia);


    // ATMOSFERA

    const atmosfera =
        new THREE.Mesh(
            new THREE.SphereGeometry(1.025, 64, 64),
            new THREE.MeshBasicMaterial({
                color: 0x4499ff,
                transparent: true,
                opacity: 0.12,
                side: THREE.BackSide
            })
        );

    ziemia.add(atmosfera);


    // KSIĘŻYC

    ksiezyc =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.27,
                32,
                32
            ),
            new THREE.MeshStandardMaterial({
                color: 0x858585,
                roughness: 1
            })
        );

    ksiezyc.position.set(
        1.7,
        0.15,
        0
    );

    scena.add(ksiezyc);


    // GWIAZDY

    stworzGwiazdy();


    // SATELITY

    grupaSatelitow = new THREE.Group();

    scena.add(grupaSatelitow);


    // RAYCASTER

    raycaster = new THREE.Raycaster();
    mysz = new THREE.Vector2();


    window.addEventListener(
        "resize",
        dopasujEkran
    );


    renderer.domElement.addEventListener(
        "pointerdown",
        rozpocznijObracanie
    );

    window.addEventListener(
        "pointermove",
        przesuwajWidok
    );

    window.addEventListener(
        "pointerup",
        zakonczObracanie
    );

    renderer.domElement.addEventListener(
        "wheel",
        zmienZoom,
        { passive: true }
    );

    renderer.domElement.addEventListener(
        "click",
        klik3D
    );


    animacja3D();
}


function stworzSlonce() {

    const grupa = new THREE.Group();

    const kula =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.22,
                32,
                32
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffd27a
            })
        );

    kula.position.set(
        4,
        2,
        -4
    );

    grupa.add(kula);

    return grupa;
}


function stworzGwiazdy() {

    const liczba = 6000;

    const geometria =
        new THREE.BufferGeometry();

    const pozycje =
        new Float32Array(liczba * 3);

    for (let i = 0; i < liczba; i++) {

        const r =
            40 + Math.random() * 90;

        const theta =
            Math.random() * Math.PI * 2;

        const phi =
            Math.acos(
                2 * Math.random() - 1
            );

        pozycje[i * 3] =
            r * Math.sin(phi) * Math.cos(theta);

        pozycje[i * 3 + 1] =
            r * Math.sin(phi) * Math.sin(theta);

        pozycje[i * 3 + 2] =
            r * Math.cos(phi);
    }

    geometria.setAttribute(
        "position",
        new THREE.BufferAttribute(
            pozycje,
            3
        )
    );

    const material =
        new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.035,
            transparent: true,
            opacity: 0.9
        });

    scena.add(
        new THREE.Points(
            geometria,
            material
        )
    );
}


// ============================================================
// ANIMACJA 3D
// ============================================================

function animacja3D() {

    requestAnimationFrame(animacja3D);

    const teraz = Date.now();

    ziemia.rotation.y += 0.00035;

    ksiezyc.position.x =
        Math.cos(teraz * 0.00003) * 1.7;

    ksiezyc.position.z =
        Math.sin(teraz * 0.00003) * 1.7;

    ksiezyc.rotation.y += 0.0005;

    if (grupaSatelitow) {
        aktualizujPozycjeSatelitow();
    }

    renderer.render(
        scena,
        kamera
    );
}


// ============================================================
// SATELITY
// ============================================================

async function pobierzISS() {

    try {

        const odpowiedz =
            await fetch(API.ISS);

        if (!odpowiedz.ok) {
            throw new Error("ISS HTTP");
        }

        const dane =
            await odpowiedz.json();

        issDane = dane[0];

        $("issStatus").textContent =
            "AKTYWNA";

        $("statusCelestrak").textContent =
            "POŁĄCZONO";

        $("issOdnowienie").textContent =
            "DANE POBRANE";

        aktualizujISS();

    } catch (blad) {

        console.error(blad);

        $("issStatus").textContent =
            "BŁĄD";

        $("statusCelestrak").textContent =
            "BŁĄD POŁĄCZENIA";
    }
}


async function pobierzStarlink() {

    try {

        const odpowiedz =
            await fetch(API.STARLINK);

        if (!odpowiedz.ok) {
            throw new Error("Starlink HTTP");
        }

        const dane =
            await odpowiedz.json();

        satelity = [
            ...dane
        ];

        if (issDane) {
            satelity.unshift(issDane);
        }

        $("satelityRazem").textContent =
            satelity.length;

        $("starlinkRazem").textContent =
            dane.length;

        $("liczbaSatelitow").textContent =
            satelity.length;

        $("czasSatelity").textContent =
            new Date().toLocaleTimeString(
                "pl-PL",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        stworzObiektySatelitow();

        wyswietlListeSatelitow();

    } catch (blad) {

        console.error(blad);

        $("satelityRazem").textContent =
            "BŁĄD";

        $("liczbaSatelitow").textContent =
            "BŁĄD";

        $("statusCelestrak").textContent =
            "BŁĄD";
    }
}


// ============================================================
// SGP4
// ============================================================

function obliczPozycjeSatellity(element) {

    try {

        const satrec =
            satellite.twoline2satrec(
                element.TLE_LINE1,
                element.TLE_LINE2
            );

        const teraz =
            new Date();

        const pozycja =
            satellite.propagate(
                satrec,
                teraz
            );

        if (!pozycja.position) {
            return null;
        }

        const gmst =
            satellite.gstime(teraz);

        const geodetyczne =
            satellite.eciToGeodetic(
                pozycja.position,
                gmst
            );

        const x =
            geodetyczne.longitude;

        const y =
            geodetyczne.latitude;

        const wysokosc =
            geodetyczne.height;

        return {
            lat:
                satellite.degreesLat(y),

            lon:
                satellite.degreesLong(x),

            wysokosc
        };

    } catch {
        return null;
    }
}


// ============================================================
// ISS TELEMETRIA
// ============================================================

function aktualizujISS() {

    if (!issDane) return;

    const dane =
        obliczPozycjeSatellity(
            issDane
        );

    if (!dane) return;

    $("issWysokosc").textContent =
        dane.wysokosc.toFixed(0);

    $("issLat").textContent =
        dane.lat.toFixed(2);

    $("issLon").textContent =
        dane.lon.toFixed(2);


    // Przybliżona prędkość orbitalna ISS.
    // Jest to wartość wynikająca z typowej prędkości
    // orbitalnej, a nie pomiar z czujnika ISS.

    $("issPredkosc").textContent =
        "7.66";


    setTimeout(
        aktualizujISS,
        5000
    );
}


// ============================================================
// OBIEKTY 3D SATELITÓW
// ============================================================

function stworzObiektySatelitow() {

    grupaSatelitow.clear();

    const limit =
        Math.min(
            satelity.length,
            500
        );

    for (let i = 0; i < limit; i++) {

        const sat =
            satelity[i];

        const obiekt =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    sat.OBJECT_NAME === "ISS (ZARYA)"
                        ? 0.035
                        : 0.012,
                    8,
                    8
                ),
                new THREE.MeshBasicMaterial({
                    color:
                        sat.OBJECT_NAME === "ISS (ZARYA)"
                            ? 0x45f59b
                            : 0x63b8ff
                })
            );

        obiekt.userData.satelita =
            sat;

        grupaSatelitow.add(obiekt);
    }
}


function aktualizujPozycjeSatelitow() {

    if (!grupaSatelitow) return;

    for (
        let i = 0;
        i < grupaSatelitow.children.length;
        i++
    ) {

        const obiekt =
            grupaSatelitow.children[i];

        const sat =
            obiekt.userData.satelita;

        const dane =
            obliczPozycjeSatellity(
                sat
            );

        if (!dane) continue;


        // Zamiana szerokości/długości geograficznej
        // na pozycję na sferze Ziemi.

        const promien =
            1.06;

        const lat =
            THREE.MathUtils.degToRad(
                dane.lat
            );

        const lon =
            THREE.MathUtils.degToRad(
                dane.lon
            );

        const x =
            promien *
            Math.cos(lat) *
            Math.cos(lon);

        const y =
            promien *
            Math.sin(lat);

        const z =
            -promien *
            Math.cos(lat) *
            Math.sin(lon);

        obiekt.position.set(
            x,
            y,
            z
        );
    }
}


// ============================================================
// LISTA SATELITÓW
// ============================================================

function wyswietlListeSatelitow(
    filtr = ""
) {

    const lista =
        $("listaSatelitow");

    const szukana =
        filtr.trim().toLowerCase();


    const wyniki =
        satelity
            .filter(sat =>
                !szukana ||
                sat.OBJECT_NAME
                    .toLowerCase()
                    .includes(szukana)
            )
            .slice(0, 150);


    if (!wyniki.length) {

        lista.innerHTML =
            `<div class="ladowanieLista">
                Nie znaleziono satelity.
            </div>`;

        return;
    }


    lista.innerHTML =
        wyniki.map(
            (sat, index) => {

                const typ =
                    sat.OBJECT_NAME.includes(
                        "STARLINK"
                    )
                        ? "STARLINK"
                        : sat.OBJECT_NAME.includes(
                            "ISS"
                        )
                            ? "STACJA KOSMICZNA"
                            : "SATELITA";

                return `
                    <div
                        class="satelitaItem"
                        data-index="${satelity.indexOf(sat)}"
                    >
                        <strong>
                            ${uciecHTML(sat.OBJECT_NAME)}
                        </strong>

                        <span>
                            ${typ} · NORAD ${sat.NORAD_CAT_ID || "—"}
                        </span>
                    </div>
                `;
            }
        ).join("");


    lista
        .querySelectorAll(".satelitaItem")
        .forEach(element => {

            element.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            element.dataset.index
                        );

                    pokazSzczegoly(
                        satelity[index]
                    );

                }
            );

        });
}


function pokazSzczegoly(sat) {

    wybranySatelita =
        sat;

    const dane =
        obliczPozycjeSatellity(
            sat
        );


    let typ =
        "SATELITA";

    if (
        sat.OBJECT_NAME
            .toUpperCase()
            .includes("STARLINK")
    ) {
        typ = "STARLINK";
    }

    if (
        sat.OBJECT_NAME
            .toUpperCase()
            .includes("ISS")
    ) {
        typ = "MIĘDZYNARODOWA STACJA KOSMICZNA";
    }


    $("szczegolySatelity").innerHTML = `
        <div class="daneSatelity">

            <div class="typ">${typ}</div>

            <h3>
                ${uciecHTML(sat.OBJECT_NAME)}
            </h3>

            <div class="daneGrid">

                <div class="danePole">
                    <small>NORAD</small>
                    <strong>
                        ${sat.NORAD_CAT_ID || "—"}
                    </strong>
                </div>

                <div class="danePole">
                    <small>KLASYFIKACJA</small>
                    <strong>
                        ${sat.CLASSIFICATION || "—"}
                    </strong>
                </div>

                <div class="danePole">
                    <small>POCHODZENIE</small>
                    <strong>
                        ${sat.COUNTRY_CODE || "—"}
                    </strong>
                </div>

                <div class="danePole">
                    <small>WYSOKOŚĆ</small>
                    <strong>
                        ${
                            dane
                                ? dane.wysokosc.toFixed(1) + " km"
                                : "—"
                        }
                    </strong>
                </div>

                <div class="danePole">
                    <small>SZEROKOŚĆ</small>
                    <strong>
                        ${
                            dane
                                ? dane.lat.toFixed(3) + "°"
                                : "—"
                        }
                    </strong>
                </div>

                <div class="danePole">
                    <small>DŁUGOŚĆ</small>
                    <strong>
                        ${
                            dane
                                ? dane.lon.toFixed(3) + "°"
                                : "—"
                        }
                    </strong>
                </div>

                <div class="danePole">
                    <small>INCLINACJA</small>
                    <strong>
                        ${sat.INCLINATION || "—"}°
                    </strong>
                </div>

                <div class="danePole">
                    <small>OKRES OBIEGU</small>
                    <strong>
                        ${
                            sat.PERIOD
                                ? sat.PERIOD + " min"
                                : "—"
                        }
                    </strong>
                </div>

            </div>

        </div>
    `;
}


// ============================================================
// MISJE
// ============================================================

async function pobierzMisje() {

    try {

        const odpowiedz =
            await fetch(API.MISJE);

        if (!odpowiedz.ok) {
            throw new Error("Misje HTTP");
        }

        const dane =
            await odpowiedz.json();

        const misje =
            dane.results || [];

        $("listaMisji").innerHTML =
            misje.map(
                misja => {

                    const data =
                        misja.net
                            ? new Date(
                                misja.net
                            ).toLocaleString(
                                "pl-PL",
                                {
                                    dateStyle: "medium",
                                    timeStyle: "short"
                                }
                            )
                            : "Data nieznana";


                    const firma =
                        misja.launch_service_provider
                            ?.name ||
                        "Nieznany operator";


                    return `
                        <article class="misja">

                            <div class="misjaData">
                                ${data}
                            </div>

                            <h3>
                                ${uciecHTML(
                                    misja.name ||
                                    "Nieznana misja"
                                )}
                            </h3>

                            <div class="misjaFirma">
                                ${uciecHTML(firma)}
                            </div>

                            <p>
                                ${
                                    uciecHTML(
                                        misja.mission?.description ||
                                        "Brak opisu misji."
                                    )
                                }
                            </p>

                        </article>
                    `;
                }
            ).join("");


        $("statusMisji").textContent =
            "POŁĄCZONO";

    } catch (blad) {

        console.error(blad);

        $("listaMisji").innerHTML =
            `<div class="ladowanieLista">
                Nie udało się pobrać aktualnych misji.
            </div>`;

        $("statusMisji").textContent =
            "BŁĄD";
    }
}


// ============================================================
// NASA APOD
// ============================================================

async function pobierzNASA() {

    try {

        const odpowiedz =
            await fetch(API.NASA);

        if (!odpowiedz.ok) {
            throw new Error("NASA HTTP");
        }

        const dane =
            await odpowiedz.json();


        if (
            dane.media_type === "image"
        ) {

            $("aktualnoscGlowna").innerHTML = `
                <article class="apod">

                    <img
                        src="${dane.url}"
                        alt="Astronomiczne zdjęcie dnia NASA"
                    >

                    <div class="apodTekst">

                        <small>
                            NASA · ASTRONOMICZNE ZDJĘCIE DNIA
                        </small>

                        <h3>
                            ${uciecHTML(
                                dane.title ||
                                "Astronomiczne zdjęcie dnia"
                            )}
                        </h3>

                        <p>
                            ${uciecHTML(
                                dane.explanation ||
                                "Brak opisu."
                            )}
                        </p>

                        <p>
                            DATA: ${
                                dane.date || "—"
                            }
                        </p>

                    </div>

                </article>
            `;

        } else {

            $("aktualnoscGlowna").innerHTML = `
                <div class="ladowanieLista">
                    Dzisiejsze dane NASA nie są obrazem.
                </div>
            `;
        }


        $("statusNASA").textContent =
            "POŁĄCZONO";

    } catch (blad) {

        console.error(blad);

        $("aktualnoscGlowna").innerHTML =
            `<div class="ladowanieLista">
                Nie udało się pobrać danych NASA.
            </div>`;

        $("statusNASA").textContent =
            "BŁĄD";
    }
}


// ============================================================
// PLANETY
// ============================================================

function inicjalizujPlanety() {

    const planety = [
        ["Merkury", "Najbliższa Słońcu planeta."],
        ["Wenus", "Gorąca planeta o bardzo gęstej atmosferze."],
        ["Ziemia", "Nasza planeta i miejsce działania ISS."],
        ["Mars", "Czerwona planeta."],
        ["Jowisz", "Największa planeta Układu Słonecznego."],
        ["Saturn", "Gazowy olbrzym z charakterystycznymi pierścieniami."],
        ["Uran", "Lodowy olbrzym obracający się pod dużym kątem."],
        ["Neptun", "Najdalsza planeta Układu Słonecznego."]
    ];


    $("planetyGrid").innerHTML =
        planety.map(
            planeta => `
                <article class="planetaKarta">

                    <div class="planetaKula"></div>

                    <h3>
                        ${planeta[0]}
                    </h3>

                    <p>
                        ${planeta[1]}
                    </p>

                </article>
            `
        ).join("");
}


// ============================================================
// MENU
// ============================================================

function inicjalizujMenu() {

    document
        .querySelectorAll(".menuPrzycisk")
        .forEach(przycisk => {

            przycisk.addEventListener(
                "click",
                () => {

                    const strona =
                        przycisk.dataset.strona;

                    document
                        .querySelectorAll(
                            ".menuPrzycisk"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "aktywny"
                            )
                        );

                    przycisk.classList.add(
                        "aktywny"
                    );


                    document
                        .querySelectorAll(
                            ".strona"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "aktywna"
                            )
                        );


                    const cel =
                        $(
                            `strona${
                                strona
                                    .charAt(0)
                                    .toUpperCase()
                                +
                                strona.slice(1)
                            }`
                        );

                    if (cel) {
                        cel.classList.add(
                            "aktywna"
                        );
                    }

                }
            );

        });
}


// ============================================================
// INTERAKCJE
// ============================================================

function inicjalizujInterakcje() {

    $("szukajSatelity")
        .addEventListener(
            "input",
            e => {
                wyswietlListeSatelitow(
                    e.target.value
                );
            }
        );


    document.addEventListener(
        "keydown",
        e => {

            if (e.key === "Escape") {

                wybranySatelita =
                    null;

            }

        }
    );
}


function rozpocznijObracanie(e) {

    obracanie = true;

    ostatniaPozycja = {
        x: e.clientX,
        y: e.clientY
    };
}


function przesuwajWidok(e) {

    if (!obracanie) return;

    const dx =
        e.clientX -
        ostatniaPozycja.x;

    const dy =
        e.clientY -
        ostatniaPozycja.y;

    ziemia.rotation.y +=
        dx * 0.005;

    ziemia.rotation.x +=
        dy * 0.003;

    ostatniaPozycja = {
        x: e.clientX,
        y: e.clientY
    };
}


function zakonczObracanie() {

    obracanie = false;
}


function zmienZoom(e) {

    odlegloscKamery +=
        e.deltaY * 0.0015;

    odlegloscKamery =
        THREE.MathUtils.clamp(
            odlegloscKamery,
            1.8,
            8
        );

    kamera.position.z =
        odlegloscKamery;
}


function klik3D(e) {

    const prostokat =
        renderer.domElement
            .getBoundingClientRect();

    mysz.x =
        ((e.clientX - prostokat.left)
            / prostokat.width) * 2 - 1;

    mysz.y =
        -((e.clientY - prostokat.top)
            / prostokat.height) * 2 + 1;


    raycaster.setFromCamera(
        mysz,
        kamera
    );


    const trafienia =
        raycaster.intersectObjects(
            grupaSatelitow.children
        );


    if (!trafienia.length) {
        return;
    }


    const sat =
        trafienia[0]
            .object
            .userData
            .satelita;


    pokazPowiadomienie(
        `Wybrano: ${sat.OBJECT_NAME}`
    );

    pokazSzczegoly(
        sat
    );
}


// ============================================================
// ZEGAR
// ============================================================

function aktualizujZegar() {

    const teraz =
        new Date();

    $("zegar").textContent =
        teraz.toISOString()
            .substring(11, 19);
}

setInterval(
    aktualizujZegar,
    1000
);

aktualizujZegar();


// ============================================================
// SYSTEM
// ============================================================

function aktualizujSystem() {

    $("statusThree").textContent =
        "AKTYWNY";
}


// ============================================================
// RESPONSYWNOŚĆ
// ============================================================

function dopasujEkran() {

    const kontener =
        $("scena3D");

    if (!kontener || !renderer) return;

    kamera.aspect =
        kontener.clientWidth /
        kontener.clientHeight;

    kamera.updateProjectionMatrix();

    renderer.setSize(
        kontener.clientWidth,
        kontener.clientHeight
    );
}


// ============================================================
// NARZĘDZIA
// ============================================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


function pokazPowiadomienie(tekst) {

    const element =
        $("powiadomienie");

    element.textContent =
        tekst;

    element.classList.add(
        "pokaz"
    );

    clearTimeout(
        pokazPowiadomienie.timer
    );

    pokazPowiadomienie.timer =
        setTimeout(
            () => {
                element.classList.remove(
                    "pokaz"
                );
            },
            2500
        );
}


function uciecHTML(tekst) {

    if (tekst === undefined ||
        tekst === null) {
        return "";
    }

    return String(tekst)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// AUTOMATYCZNE ODŚWIEŻANIE DANYCH
// ============================================================

setInterval(
    async () => {

        await pobierzISS();

    },
    60 * 1000
);


setInterval(
    async () => {

        await pobierzStarlink();

    },
    30 * 60 * 1000
);


setInterval(
    async () => {

        await pobierzMisje();

    },
    15 * 60 * 1000
);


setInterval(
    async () => {

        await pobierzNASA();

    },
    60 * 60 * 1000
);
