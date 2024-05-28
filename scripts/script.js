const timerStart = Date.now();

document.addEventListener("DOMContentLoaded", () => {
    const headerContainer = document.getElementById("header-container");
    const contentDiv = document.querySelector(".content");

    initialize(headerContainer, contentDiv);
    setupPopstateListener(contentDiv);
});

async function loadHTML(url, container, callback) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Ошибка загрузки контента.");
        }
        const html = await response.text();
        container.innerHTML = html;

        if (callback) callback();
    } catch (error) {
        container.innerHTML = `<p>${error.message}</p>`;
    }
    setActiveTab();
}

async function loadPage(page, contentDiv) {
    saveCurrentTab(page);
    if (page === "map") {
        await loadMap(contentDiv);
    } else if (page === "timer") {
        loadTimer(contentDiv);
    } else {
        await loadHTML(`${page}.html`, contentDiv, () => {
            startTimer();
        });
    }
}

function saveCurrentTab(tab) {
    localStorage.setItem("currentTab", tab);
}

async function loadMap(contentDiv) {
    await loadHTML("map.html", contentDiv, () => {
        const script = document.createElement("script");
        script.src =
            "https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=29c2d6f1-d9c0-4b3f-a77b-857f71b0aa9f";
        script.onload = initMap;
        document.body.appendChild(script);
    });
}

function loadTimer(contentDiv) {
    loadHTML("timer.html", contentDiv, () => {
        startTimer();
    });
}

function setupLinks(contentDiv) {
    document.querySelectorAll("a[data-page]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const page = event.currentTarget.getAttribute("href").substr(1);
            loadPage(page, contentDiv);
        });
    });
}

function initialize(headerContainer, contentDiv) {
    const initialPage = localStorage.getItem("currentTab") || "resume";
    localStorage.setItem("currentTab", initialPage);

    loadHTML("header.html", headerContainer, () => {
        setupLinks(contentDiv);
        loadPage(initialPage, contentDiv);
    });
}

function setupPopstateListener(contentDiv) {
    window.addEventListener("popstate", (event) => {
        const pathname = location.pathname;
        const page = pathname.substr(1);
        loadPage(page, contentDiv);
    });
}

function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement || mapElement.dataset.mapInitialized) return;

    ymaps.ready(() => {
        const myMap = new ymaps.Map(mapElement, {
            center: [55.751574, 37.573856],
            zoom: 9,
            searchControlProvider: "yandex#search",
        });

        const myPlacemark = new ymaps.Placemark(
            myMap.getCenter(),
            {
                balloonContent: "Место жительства",
            },
            {
                iconLayout: "default#image",
                iconImageSize: [30, 42],
                iconImageOffset: [-5, -38],
            }
        );

        myMap.geoObjects.add(myPlacemark);
        mapElement.dataset.mapInitialized = true;
    });
}

function startTimer() {
    const timerElement = document.getElementById("timer");
    if (!timerElement) return;

    const updateTimer = () => {
        const elapsed = Date.now() - timerStart;
        const timeString = new Date(elapsed).toISOString();
        timerElement.textContent = timeString.slice(11, 19);
    };

    setInterval(updateTimer, 1000);
    updateTimer();
}

function setActiveTab() {
    const navigationButtons = document.querySelectorAll(".navigation-button");

    navigationButtons.forEach((button) => {
        const dataPage = button.getAttribute("data-page");
        console.log(dataPage);
        const containerId = `${dataPage}-container`;
        console.log(containerId);

        const container = document.getElementById(containerId);
        console.log(container);

        if (container) {
            button.classList.add("active-tab");
        } else {
            button.classList.remove("active-tab");
        }
    });
}
