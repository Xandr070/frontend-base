document.addEventListener('DOMContentLoaded', async () => {
    const headerContainer = document.getElementById('header-container');
    const contentDiv = document.querySelector('.content');

    async function loadHTML(url, container) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Page not found');
            const html = await response.text();
            container.innerHTML = html;
            executeScripts(container);
        } catch (error) {
            container.innerHTML = '<p>Error loading content.</p>';
        }
    }

    function executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            document.body.appendChild(newScript);
        });
    }

    async function loadPage(page) {
        await loadHTML(`${page}.html`, contentDiv);
        if (page === 'map') {
            loadYandexMapAPI();
        }
        startTimer();
    }

    async function initialize() {
        await loadHTML('header.html', headerContainer);
        document.querySelectorAll('a[data-page]').forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault();
                const page = event.currentTarget.getAttribute('data-page');
                history.pushState({ page }, '', `#${page}`);
                loadPage(page);
            });
        });

        const initialPage = location.hash.replace('#', '') || 'resume';
        loadPage(initialPage);
    }

    window.addEventListener('popstate', event => {
        if (event.state && event.state.page) {
            loadPage(event.state.page);
        }
    });

    await initialize();
});

function loadYandexMapAPI() {
    if (typeof ymaps !== 'undefined' && ymaps.ready) {
        initMap();
    } else {
        var script = document.createElement("script");
        script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=YOUR_API_KEY";
        script.onload = initMap;
        document.body.appendChild(script);
    }
}


function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    if (mapElement.dataset.mapInitialized) {
        return;
    }

    ymaps.ready(function () {
        var myMap = new ymaps.Map(mapElement, {
            center: [55.751574, 37.573856],
            zoom: 9
        }, {
            searchControlProvider: 'yandex#search'
        });

        var myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
            hintContent: 'Custom placemark',
            balloonContent: 'This is a beautiful placemark'
        }, {
            iconLayout: 'default#image',
            iconImageSize: [30, 42],
            iconImageOffset: [-5, -38]
        });

        myMap.geoObjects.add(myPlacemark);
        mapElement.dataset.mapInitialized = true;
    });
}

async function startTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;

    let timerInterval;

    function updateTimer() {
        let startTime = Date.now();
        timerInterval = setInterval(() => {
            let elapsedTime = Date.now() - startTime;
            let seconds = Math.floor((elapsedTime / 1000) % 60);
            let minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
            let hours = Math.floor((elapsedTime / (1000 * 60 * 60)) % 24);
            timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    updateTimer();
}
