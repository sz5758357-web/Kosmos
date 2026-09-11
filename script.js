/* =========================
   COSMOS 1.0
========================= */


/* STARS */

const starsContainer = document.getElementById("stars");

for (let i = 0; i < 180; i++) {

    const star = document.createElement("div");

    star.className = "star";

    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";

    const size = Math.random() * 2 + 1;

    star.style.width = size + "px";
    star.style.height = size + "px";

    star.style.animationDelay =
        Math.random() * 4 + "s";

    starsContainer.appendChild(star);
}


/* MOBILE MENU */

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn.addEventListener("click", () => {

    navMenu.classList.toggle("active");

});


document.querySelectorAll("#navMenu a").forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("active");

    });

});


/* PLANET MODAL */

const planets = document.querySelectorAll(".planet");

const modal = document.getElementById("planetModal");
const modalName = document.getElementById("modalName");
const modalInfo = document.getElementById("modalInfo");

const closeModal = document.getElementById("closeModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");


planets.forEach(planet => {

    planet.addEventListener("click", () => {

        const name = planet.dataset.name;
        const info = planet.dataset.info;

        modalName.textContent = name.toUpperCase();
        modalInfo.textContent = info;

        modal.classList.add("active");

    });

});


function closePlanetModal() {

    modal.classList.remove("active");

}


closeModal.addEventListener("click", closePlanetModal);

modalCloseBtn.addEventListener("click", closePlanetModal);


modal.addEventListener("click", (event) => {

    if (event.target === modal) {
        closePlanetModal();
    }

});


/* ESC CLOSE */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closePlanetModal();
    }

});


/* COUNTDOWN */

const targetDate = new Date();

targetDate.setDate(
    targetDate.getDate() + 27
);

targetDate.setHours(20);
targetDate.setMinutes(0);
targetDate.setSeconds(0);


function updateCountdown() {

    const now = new Date();

    const difference =
        targetDate.getTime() - now.getTime();


    if (difference <= 0) {

        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";

        return;

    }


    const days =
        Math.floor(difference / 86400000);

    const hours =
        Math.floor(
            (difference % 86400000) / 3600000
        );

    const minutes =
        Math.floor(
            (difference % 3600000) / 60000
        );

    const seconds =
        Math.floor(
            (difference % 60000) / 1000
        );


    document.getElementById("days").textContent =
        String(days).padStart(2, "0");

    document.getElementById("hours").textContent =
        String(hours).padStart(2, "0");

    document.getElementById("minutes").textContent =
        String(minutes).padStart(2, "0");

    document.getElementById("seconds").textContent =
        String(seconds).padStart(2, "0");

}


updateCountdown();

setInterval(updateCountdown, 1000);


/* PARALLAX STARS */

window.addEventListener("scroll", () => {

    const scroll =
        window.scrollY;

    starsContainer.style.transform =
        `translateY(${scroll * 0.08}px)`;

});
