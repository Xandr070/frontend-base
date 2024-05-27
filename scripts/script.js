document.addEventListener("DOMContentLoaded", () => {
    const headerContainer = document.getElementById("header-container");
    const contentDiv = document.querySelector(".content");

    initialize(headerContainer, contentDiv);
    setupPopstateListener(contentDiv);
});

function loadHTML(url, container, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            container.innerHTML = xhr.responseText;
            executeScripts(container);
            if (callback) callback();
        } else {
            container.innerHTML = "<p>Ошибка загрузки контента.</p>";
        }
    };
    xhr.onerror = () => {
        container.innerHTML = "<p>Ошибка загрузки контента.</p>";
    };
    xhr.send();
}

function executeScripts(container) {
    container.querySelectorAll("script").forEach((script) => {
        const newScript = document.createElement("script");
        if (script.src) newScript.src = script.src;
        else newScript.textContent = script.textContent;
        document.body.appendChild(newScript).parentNode.removeChild(newScript);
    });
}

function loadPage(page, contentDiv) {
    loadHTML(`${page}.html`, contentDiv, () => {
        if (page === "map") {
            const script = document.createElement("script");
            script.src =
                "https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=29c2d6f1-d9c0-4b3f-a77b-857f71b0aa9f";
            script.onload = initMap;
            document.body.appendChild(script);
        }
        startTimer();
        setActiveTab();
    });
}

function setupLinks(contentDiv) {
    document.querySelectorAll("a[data-page]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const page = event.currentTarget.dataset.page;
            history.pushState({ page }, "", `/${page}`);
            loadPage(page, contentDiv);
        });
    });
}

function initialize(headerContainer, contentDiv) {
    loadHTML("header.html", headerContainer, () => {
        setupLinks(contentDiv);
        const initialPage = location.pathname.slice(1) || "resume";
        loadPage(initialPage, contentDiv);
    });
}

function setupPopstateListener(contentDiv) {
    window.addEventListener("popstate", (event) => {
        if (event.state?.page) loadPage(event.state.page, contentDiv);
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

    let startTime = localStorage.getItem("timerStart");
    if (!startTime) {
        startTime = Date.now();
        localStorage.setItem("timerStart", startTime);
    }

    const updateTimer = () =>
        (timerElement.textContent = new Date(Date.now() - startTime)
            .toISOString()
            .substr(11, 8));

    setInterval(updateTimer, 1000);
    updateTimer();

    window.addEventListener("beforeunload", () => {
        localStorage.removeItem("timerStart");
    });
}

function setActiveTab() {
    const currentPath = window.location.pathname;
    const navigationButtons = document.querySelectorAll(".navigation-button");

    navigationButtons.forEach(button => {
        const href = button.getAttribute("href");;
        if (href === currentPath) {
            button.classList.add("active-tab");
        } else {
            button.classList.remove("active-tab");
        }
    });
}
