// script.js
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // Generic Intersection Observer options for narrative sections
    const sectionObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3 // Trigger when 30% of the section is visible
    };

    // Function to observe and add 'active' class
    const setupSectionObserver = (sectionId, callback = null, options = sectionObserverOptions) => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    section.classList.add('active');
                    if (callback) callback(section, entry);
                }
            });
        }, options);
        observer.observe(section);
    };

    
    
    // --- Cover Section：固定画面，滚轮切换文字 --- //
    const coverSection = document.getElementById('cover-section');

    if (coverSection) {
        let introVisible = false;
        let wheelLocked = false;

        const updateCoverState = () => {
            coverSection.classList.toggle('intro-visible', introVisible);
        };

        window.addEventListener('wheel', (event) => {
            if (window.scrollY > 5) {
                return;
            }
            // 正文显示后，继续向下滚动进入下一屏
            if (introVisible && event.deltaY > 0) {
                return;
            }
            // 正文显示后，向上滚动返回标题
            if (introVisible && event.deltaY < 0) {
                event.preventDefault();
                if (wheelLocked) return;

                wheelLocked = true;
                introVisible = false;
                updateCoverState();

                setTimeout(() => {
                    wheelLocked = false;
                }, 900);
                return;
            }

            // 标题显示时，向下滚动只切换文字
            if (!introVisible && event.deltaY > 0) {
                event.preventDefault();
                if (wheelLocked) return;

                wheelLocked = true;
                introVisible = true;
                updateCoverState();

                setTimeout(() => {
                    wheelLocked = false;
                }, 900);
            }
        }, { passive: false });

        updateCoverState();
    }

// 第一章第二屏：办公楼背景独立淡入，旁白随后淡入
setupSectionObserver('office-background-section', (section) => {
    section.classList.add('scene-fade-in');
});

// 第一章第三屏：图片旁白淡入
setupSectionObserver('people-section', (section) => {
    section.classList.add('scene-fade-in');
});

// 第一章第三屏：问题淡入 → 滚轮切换 → 调查说明淡入
// =====================================================

const questionSection = document.getElementById('question-section');

if (questionSection) {

    const promptStage = questionSection.querySelector(
        '.question-stage-prompt'
    );

    const dataStage = questionSection.querySelector(
        '.question-stage-data'
    );

    if (promptStage && dataStage) {

        let stage = 'prompt';
        let inView = false;
        let transitioning = false;

        let transitionTimer = null;
        let wheelReleaseTimer = null;
        let wheelLocked = false;


        // 清理当前状态
        function resetQuestionStages() {

            window.clearTimeout(transitionTimer);
            window.clearTimeout(wheelReleaseTimer);

            promptStage.classList.remove('is-visible');
            dataStage.classList.remove('is-visible');

            stage = 'prompt';
            transitioning = false;
            wheelLocked = false;
        }


        // 等待滚轮停止，避免一次连续滚动触发多次切换
        function lockUntilWheelIdle() {

            wheelLocked = true;

            window.clearTimeout(wheelReleaseTimer);

            wheelReleaseTimer = window.setTimeout(() => {
                wheelLocked = false;
            }, 280);
        }


        // 切换到调查说明
        function showQuestionData() {

            transitioning = true;

            // 问题淡出
            promptStage.classList.remove('is-visible');

            // 问题淡出后，调查说明再淡入
            transitionTimer = window.setTimeout(() => {

                if (!inView) return;

                dataStage.classList.add('is-visible');

                stage = 'data';
                transitioning = false;

            }, 700);
        }


        // 返回两行核心问题
        function showQuestionPrompt() {

            transitioning = true;

            // 调查说明淡出
            dataStage.classList.remove('is-visible');

            // 调查说明淡出后，核心问题重新出现
            transitionTimer = window.setTimeout(() => {

                if (!inView) return;

                promptStage.classList.add('is-visible');

                stage = 'prompt';
                transitioning = false;

            }, 700);
        }


        // 进入与离开这一屏时，控制动画状态
        const questionObserver = new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        questionSection.classList.add('active');

                        body.style.backgroundColor =
                            'var(--color-ink-black)';

                        if (!inView) {

                            inView = true;

                            resetQuestionStages();

                            // 先让页面稳定，再淡入问题
                            transitioning = true;

                            transitionTimer = window.setTimeout(() => {

                                if (!inView) return;

                                promptStage.classList.add('is-visible');

                                transitioning = false;

                            }, 180);
                        }

                    } else if (inView) {

                        inView = false;

                        resetQuestionStages();
                    }

                });

            },
            {
                threshold: 0.35
            }
        );

        questionObserver.observe(questionSection);


        // 鼠标滚轮：只在这一屏对齐视口时接管滚动
        window.addEventListener(
            'wheel',
            function (event) {

                if (!inView) return;

                const rect = questionSection.getBoundingClientRect();

                const screenIsAligned =
                    Math.abs(rect.top) < 30 &&
                    Math.abs(rect.bottom - window.innerHeight) < 30;

                if (!screenIsAligned) return;


                // 动画切换期间，页面保持不动
                if (wheelLocked || transitioning) {

                    event.preventDefault();

                    if (wheelLocked) {
                        lockUntilWheelIdle();
                    }

                    return;
                }


                // 第一次向下滚动：问题淡出，调查说明出现
                if (event.deltaY > 0 && stage === 'prompt') {

                    event.preventDefault();

                    lockUntilWheelIdle();

                    showQuestionData();

                    return;
                }


                // 调查说明状态向上滚动：返回问题
                if (event.deltaY < 0 && stage === 'data') {

                    event.preventDefault();

                    lockUntilWheelIdle();

                    showQuestionPrompt();

                    return;
                }

                // 调查说明状态向下滚动：
                // 不阻止默认行为，进入下一屏数据页面
            },
            {
                passive: false
            }
        );

    }
}

    // --- Chapter 1 Intro Section (Phase 7) --- //
    setupSectionObserver('chapter1-intro-section', (section) => {
        const chapterIntroTitle = section.querySelector('.chapter-intro-title');
        if (chapterIntroTitle) chapterIntroTitle.classList.add('active');
    });

    // Observe other chapters as well for the 'active' class (if needed for future styling)
    const otherChapters = document.querySelectorAll('.chapter:not(#chapter1-content)');
    otherChapters.forEach(chapter => setupSectionObserver(chapter.id));
});

// 第一章动态地图：初始化广州地图
const chapter1Map = L.map('chapter1-map').setView(
    [23.1291, 113.2644],
    11
);

L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    {
        maxZoom: 19,
        attribution:
            'Tiles © Esri — Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, TomTom, and contributors'
    }
).addTo(chapter1Map);


// 在广州地图上显示95家公共文化场馆

const venueMarkers = [];

window.chapter1Venues.forEach(venue => {

    const marker = L.circleMarker(
        [venue.lat, venue.lng],
        {
            radius: 5,
            color: '#ffc107',
            weight: 1,
            fillColor: '#ffc107',
            fillOpacity: 0.9
        }
    );

    marker.bindPopup(`
        <strong>${venue.name}</strong><br>
        ${venue.address}<br>
        闭馆时间：${venue.closeTime}
    `);

    marker.addTo(chapter1Map);

    venueMarkers.push(marker);

});
// 第一章动态地图：时间自动推进
const timeButtons = document.querySelectorAll('.map-time-line button');
const currentTimeDisplay = document.getElementById('map-current-time');

const mapTimes = [
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00'
];

function updateMapTime(selectedTime) {

    currentTimeDisplay.textContent = selectedTime;

// 更新时间轴当前节点和进度
    const currentIndex = mapTimes.indexOf(selectedTime);

    timeButtons.forEach((button, index) => {

    button.classList.toggle(
        'active',
        index === currentIndex
    );

});

const progress = (currentIndex / (mapTimes.length - 1)) * 100;

const progressBar = document.querySelector('.map-time-progress');

if (progressBar) {
    progressBar.style.width = `${progress}%`;
}

    const [hour, minute] = selectedTime.split(':').map(Number);
    const selectedMinutes = hour * 60 + minute;

    const closingMarkers = [];

window.chapter1Venues.forEach((venue, index) => {

    const marker = venueMarkers[index];

    if (venue.closeMinutes <= selectedMinutes) {

        closingMarkers.push(marker);

    } else {

        marker.setStyle({
            opacity: 0.9,
            fillOpacity: 0.9
        });

        marker.addTo(chapter1Map);

    }

});


closingMarkers.forEach((marker, index) => {

    setTimeout(() => {

        marker.setStyle({
            opacity: 0,
            fillOpacity: 0
        });

        setTimeout(() => {

            chapter1Map.removeLayer(marker);

        }, 700);

    }, index * 40);

});

};

// 点击时间按钮仍然可以手动查看
timeButtons.forEach(button => {

    button.addEventListener('click', () => {

        updateMapTime(button.dataset.time);

    });

});


// 地图进入视野后自动播放
const mapSection = document.getElementById('chapter1-map-section');

let mapAnimationStarted = false;

const mapObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting && !mapAnimationStarted) {

            mapAnimationStarted = true;

            let index = 0;

            // 从17:00开始
            updateMapTime(mapTimes[index]);

function playNextTime() {
    index++;

    updateMapTime(mapTimes[index]);

    // 到达21:00后，等待一小段时间，再显示结尾文字
    if (index === mapTimes.length - 1) {

        setTimeout(() => {

            const endingText = document.getElementById('map-ending-text');

            if (endingText) {
                endingText.classList.add('show');
            }

        }, 1200);

        return;
    }

    setTimeout(playNextTime, 2000);
}
            setTimeout(playNextTime, 2000);

        }

    });}, {threshold: 0.1});

mapObserver.observe(mapSection);

// 第一章 → 第二章转场

const chapter2 = document.getElementById('chapter2');

if (chapter2) {

    const chapter2Observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                chapter2.classList.add('chapter2-visible');

            }

        });

    }, {
        threshold: 0.15
    });

    chapter2Observer.observe(chapter2);

}

/* ========================================
   第二章 · 场景1：聊天气泡依次出现
======================================== */

(function () {
    const chatScene = document.querySelector('#chapter2 .scene-chat');

    if (!chatScene) return;

    const chatBubbles = chatScene.querySelectorAll('.chat-bubble');

    if (!chatBubbles.length) return;

    let chatPlayed = false;

    const chatObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {

                if (entry.isIntersecting && !chatPlayed) {

                    chatPlayed = true;

                    chatBubbles.forEach((bubble, index) => {
                        setTimeout(() => {
                            bubble.classList.add('chat-show');
                        }, index * 650);
                    });

                    chatObserver.unobserve(chatScene);
                }

            });
        },
        {
            threshold: 0.35
        }
    );

    chatObserver.observe(chatScene);
})();

/* ========================================
   第二章 · 场景2：两个问题依次出现
======================================== */

(function () {
    const questionScene = document.querySelector(
        '#chapter2 .scene-question'
    );

    if (!questionScene) return;

    const questionParts = Array.from(
        questionScene.children
    );

    if (!questionParts.length) return;

    let questionPlayed = false;

    const questionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {

                if (entry.isIntersecting && !questionPlayed) {

                    questionPlayed = true;

                    questionParts.forEach((part, index) => {
                        setTimeout(() => {
                            part.classList.add('question-show');
                        }, index * 850);
                    });

                    questionObserver.unobserve(questionScene);
                }

            });
        },
        {
            threshold: 0.35
        }
    );

    questionObserver.observe(questionScene);
})();

/* ========================================
   第二章 · 场景3：通勤情景模拟
======================================== */

(function () {
    const commuteScene = document.querySelector(
        '#chapter2 .scene-commute'
    );

    if (!commuteScene) return;

    let commutePlayed = false;

    const commuteObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {

                if (entry.isIntersecting && !commutePlayed) {

                    commutePlayed = true;

                    commuteScene.classList.add('commute-show');

                    commuteObserver.unobserve(commuteScene);
                }

            });
        },
        {
            threshold: 0.4
        }
    );

    commuteObserver.observe(commuteScene);
})();

/* ========================================
   第二章第四屏：横向通勤时间轴控制
======================================== */

(function () {
    const scene = document.querySelector(
        '#chapter2 .scene-commute'
    );

    if (!scene) return;

    const stage = scene.querySelector('.journey-sticky');
    const route = scene.querySelector('.journey-route');
    const lineProgress = scene.querySelector('.journey-line-progress');
    const walker = scene.querySelector('.journey-person');
    const timeDisplay = scene.querySelector('#journey-current-time');
    const info = scene.querySelector('.journey-info');

    const officeStop = scene.querySelector('.journey-office-stop');
    const subwayStop = scene.querySelector('.journey-subway-stop');
    const walkStop = scene.querySelector('.journey-walk-stop');
    const museumStop = scene.querySelector('.journey-museum-stop');

    const closeText = scene.querySelector('.journey-close');
    const remainingText = scene.querySelector('.journey-remaining');

    if (!stage || !route || !lineProgress || !walker) return;

    let ticking = false;

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function toggleClass(element, className, active) {
        if (element) {
            element.classList.toggle(className, active);
        }
    }

    function formatTime(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return (
            String(hours).padStart(2, '0') +
            ':' +
            String(minutes).padStart(2, '0')
        );
    }

    function updateJourney() {
        const rect = scene.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollDistance = scene.offsetHeight - viewportHeight;

        let progress = scrollDistance > 0
            ? -rect.top / scrollDistance
            : 0;

        progress = clamp(progress, 0, 1);

        // 滚动进度的前72%呈现从公司到场馆的通勤过程
        const routeProgress = clamp(progress / 0.72, 0, 1);

        // 黄色路线逐渐延伸
        lineProgress.style.width =
            `${routeProgress * 100}%`;

        // 小人从公司向文化场馆移动
        walker.style.left =
            `${9 + routeProgress * 82}%`;

        // 时间从18:00推进到18:40
        if (timeDisplay) {
            const minutes =
                18 * 60 + Math.round(routeProgress * 40);

            timeDisplay.textContent = formatTime(minutes);
        }

        // 公司节点
        toggleClass(
            officeStop,
            'journey-active',
            progress >= 0.02
        );

        toggleClass(
            officeStop?.querySelector('.journey-node'),
            'journey-active',
            progress >= 0.02
        );

        // 地铁节点
        toggleClass(
            subwayStop,
            'journey-active',
            progress >= 0.27
        );

        toggleClass(
            subwayStop?.querySelector('.journey-node'),
            'journey-active',
            progress >= 0.27
        );

        // 步行节点
        toggleClass(
            walkStop,
            'journey-active',
            progress >= 0.50
        );

        toggleClass(
            walkStop?.querySelector('.journey-node'),
            'journey-active',
            progress >= 0.50
        );

        // 文化场馆节点
        toggleClass(
            museumStop,
            'journey-active',
            progress >= 0.70
        );

        toggleClass(
            museumStop?.querySelector('.journey-node'),
            'journey-active',
            progress >= 0.70
        );

        // 显示通勤信息
        toggleClass(
            info,
            'journey-info-show',
            progress >= 0.12
        );

        // 到达后显示闭馆时间与剩余时间
        toggleClass(
            closeText,
            'journey-arrived',
            progress >= 0.78
        );

        toggleClass(
            remainingText,
            'journey-arrived',
            progress >= 0.85
        );

                // 时间轴动画最后阶段，显示结尾说明
        const conclusion = scene.querySelector(
            '.journey-conclusion'
        );

        toggleClass(
            conclusion,
            'show-conclusion',
            progress >= 0.90
        );

        // 场景结束时淡出
        const fadeProgress = clamp(
            (progress - 0.93) / 0.07,
            0,
            1
        );

        stage.style.opacity = String(1 - fadeProgress);

        stage.style.transform =
            `translateY(${-12 * fadeProgress}px)`;

        ticking = false;
    }

    function requestUpdate() {
        if (ticking) return;

        ticking = true;
        window.requestAnimationFrame(updateJourney);
    }

    window.addEventListener(
        'scroll',
        requestUpdate,
        { passive: true }
    );

    window.addEventListener('resize', requestUpdate);

    // 页面加载后立即更新一次状态
    updateJourney();
})();

/* ========================================
   第二章 · 场景5
   95家 → 22家地图数据验证
======================================== */

(function () {

    const scene = document.querySelector(
        '#chapter2 .scene-data'
    );

    const mapContainer = document.querySelector(
        '#chapter2-data-map'
    );

    const countElement = document.querySelector(
        '#chapter2-map-count'
    );

    const statusElement = document.querySelector(
        '#chapter2-map-status'
    );

    const resultElement = document.querySelector(
        '#chapter2 .chapter2-map-result'
    );


    /* ====================================
       先检查必要的HTML和Leaflet
       不再因为数据问题提前退出
    ==================================== */

    if (!scene || !mapContainer) {
        console.warn('场景5：地图容器不存在');
        return;
    }

    if (typeof L === 'undefined') {
        console.warn('场景5：Leaflet没有加载');
        return;
    }


    /* ====================================
       创建地图
    ==================================== */

    const dataMap = L.map(
        'chapter2-data-map',
        {
            zoomControl: false,
            attributionControl: true,

            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            touchZoom: false
        }
    ).setView(
        [23.1291, 113.2644],
        11
    );


    /* ====================================
       底图
    ==================================== */

    L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
            maxZoom: 19,
            attribution: 'Tiles © Esri'
        }
    ).addTo(dataMap);

let venueData = [];

if (Array.isArray(window.chapter1Venues)) {
    venueData = window.chapter1Venues;
}
    /* ====================================
       创建场馆点
    ==================================== */

    const venueMarkers = [];


    venueData.forEach(
        function (venue) {

            const lat =
                Number(venue.lat);

            const lng =
                Number(venue.lng);

            const closeMinutes =
                Number(
                    venue.closeMinutes
                );


            if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lng)
            ) {

                return;

            }


            const marker =
                L.circleMarker(
                    [lat, lng],
                    {
                        radius: 6,

                        color: '#FFD166',

                        weight: 1.5,

                        fillColor: '#F2A900',

                        fillOpacity: 1,

                        opacity: 1,

                        interactive: false
                    }
                ).addTo(dataMap);


            venueMarkers.push({

                marker: marker,

                closeMinutes:
                    Number.isFinite(
                        closeMinutes
                    )
                    ? closeMinutes
                    : 0

            });

        }
    );

    /* ====================================
       地图尺寸
    ==================================== */

    function refreshMapSize() {

        dataMap.invalidateSize();

    }


    setTimeout(
        refreshMapSize,
        100
    );

    setTimeout(
        refreshMapSize,
        500
    );

    setTimeout(
        refreshMapSize,
        1000
    );


    /* ====================================
       工具函数
    ==================================== */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );

    }


    /* ====================================
       滚动控制
    ==================================== */

    let ticking = false;


    function updateDataMap() {

        const rect =
            scene.getBoundingClientRect();

        const sceneHeight =
            scene.offsetHeight;

        const viewportHeight =
            window.innerHeight;

        const scrollDistance =
            sceneHeight -
            viewportHeight;


        let progress =
            scrollDistance > 0
            ? -rect.top /
              scrollDistance
            : 0;


        progress =
            clamp(
                progress,
                0,
                1
            );


        /* 17:00 → 18:40 */

        const startMinutes =
            17 * 60;

        const endMinutes =
            18 * 60 + 40;


        const currentMinutes =
            startMinutes +
            (
                endMinutes -
                startMinutes
            ) * progress;


        /* ====================================
           根据闭馆时间改变透明度
        ==================================== */

        let visibleCount = 0;


        venueMarkers.forEach(
    function (item) {

        const closeMinutes =
            item.closeMinutes;


        if (
            closeMinutes >
            currentMinutes
        ) {

            visibleCount += 1;

            item.marker.setStyle({

                fillOpacity: 0.9,

                opacity: 0.9

            });

        } else {

            const fadeProgress =
                clamp(
                    (
                        currentMinutes -
                        closeMinutes
                    ) / 20,
                    0,
                    1
                );

            const opacity =
                0.9 -
                (
                    0.8 *
                    fadeProgress
                );

            item.marker.setStyle({

                fillOpacity:
                    opacity,

                opacity:
                    opacity

            });

        }

    }
);


/* ====================================
   最终终态锁定
   到达18:40后，只保留仍开放的场馆
==================================== */

if (progress >= 0.98) {

    visibleCount = 0;

    venueMarkers.forEach(
        function (item) {

            if (
                item.closeMinutes >
                endMinutes
            ) {

                visibleCount += 1;

                item.marker.setStyle({

                    fillOpacity: 0.9,

                    opacity: 0.9

                });

            } else {

                item.marker.setStyle({

                    fillOpacity: 0,

                    opacity: 0

                });

            }

        }
    );

}


        /* ====================================
           左下角数字
        ==================================== */

        if (countElement) {

            countElement.textContent =
                visibleCount ||
                venueMarkers.length;

        }


        /* ====================================
           状态文字
        ==================================== */

        if (statusElement) {

            if (
                venueMarkers.length === 0
            ) {

                statusElement.textContent =
                    '场馆数据未读取';

            } else if (
                progress < 0.05
            ) {

                statusElement.textContent =
                    '95家场馆';

            } else if (
                progress < 0.82
            ) {

                statusElement.textContent =
                    '随着时间推移，场馆逐渐关闭';

            } else {

                statusElement.textContent =
                    '18:40到达时';

            }

        }


        /* ====================================
           最后显示22家
        ==================================== */

        if (
            resultElement
        ) {

            if (
                progress >= 0.9
            ) {

                resultElement.classList.add(
                    'map-result-show'
                );

            } else {

                resultElement.classList.remove(
                    'map-result-show'
                );

            }

        }


        ticking = false;

    }


    function requestUpdate() {

        if (!ticking) {

            window.requestAnimationFrame(
                updateDataMap
            );

            ticking = true;

        }

    }


    window.addEventListener(
        'scroll',
        requestUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        'resize',
        function () {

            dataMap.invalidateSize();

            requestUpdate();

        }
    );


    updateDataMap();

})();

/* ========================================
   第二章 · 场景11
   剩余文化时间滚动动画
======================================== */

(function () {

    const scene =
        document.querySelector(
            '#chapter2 .scene-time-left'
        );

    if (!scene) return;


    const rows =
        scene.querySelectorAll(
            '.time-bar-row'
        );

    const fills =
        scene.querySelectorAll(
            '.time-bar-fill'
        );


    if (
        !rows.length ||
        !fills.length
    ) {
        return;
    }


    /*
     * 最大时间：
     * 21:00 - 18:40 = 140分钟
     */

    const maxMinutes = 140;


    let ticking = false;


    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );

    }


    function updateTimeLeft() {

        const rect =
            scene.getBoundingClientRect();

        const sceneHeight =
            scene.offsetHeight;

        const viewportHeight =
            window.innerHeight;

        const scrollDistance =
            sceneHeight -
            viewportHeight;


        let progress =
            scrollDistance > 0
                ? -rect.top /
                  scrollDistance
                : 0;


        progress =
            clamp(
                progress,
                0,
                1
            );


        /*
         * 每个时间条依次出现
         */

        const thresholds = [
            0.18,
            0.37,
            0.56,
            0.75
        ];


        rows.forEach(
            (row, index) => {

                const fill =
                    fills[index];

                if (!fill) return;


                const show =
                    progress >=
                    thresholds[index];


                /*
                 * 时间条出现
                 */

                if (show) {

                    row.classList.add(
                        'time-row-show'
                    );


                    /*
                     * 条长按照真实分钟数比例
                     */

                    const minutes =
                        Number(
                            fill.dataset.minutes
                        );


                    const width =
                        (
                            minutes /
                            maxMinutes
                        ) * 100;


                    fill.style.width =
                        `${width}%`;

                } else {

                    row.classList.remove(
                        'time-row-show'
                    );

                    fill.style.width =
                        '0%';

                }

            }
        );


        ticking = false;

    }


    function requestUpdate() {

        if (!ticking) {

            window.requestAnimationFrame(
                updateTimeLeft
            );

            ticking = true;

        }

    }


    window.addEventListener(
        'scroll',
        requestUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        'resize',
        requestUpdate
    );


    updateTimeLeft();

})();

/* ========================================
   第二章 · 场景12
   “那算了” → 周末再去
======================================== */

(function () {

    const endingScene =
        document.querySelector(
            '#chapter2 .scene-ending'
        );

    if (!endingScene) return;


    const person =
        endingScene.querySelector(
            '.ending-person'
        );

    const bubble =
        endingScene.querySelector(
            '.ending-bubble'
        );

    const calendar =
        endingScene.querySelector(
            '.ending-calendar'
        );

    const calendarPages =
        endingScene.querySelectorAll(
            '.calendar-page'
        );

    const calendarArrows =
        endingScene.querySelectorAll(
            '.calendar-arrow'
        );

    const question =
        endingScene.querySelector(
            '.ending-question'
        );


    let ticking = false;


    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(value, min),
            max
        );

    }


    function updateEnding() {

        const rect =
            endingScene.getBoundingClientRect();

        const sceneHeight =
            endingScene.offsetHeight;

        const viewportHeight =
            window.innerHeight;

        const scrollDistance =
            sceneHeight -
            viewportHeight;


        let progress =
            scrollDistance > 0
                ? -rect.top / scrollDistance
                : 0;


        progress =
            clamp(
                progress,
                0,
                1
            );


        /* ====================================
           ① 人物出现
        ==================================== */

        if (progress >= 0.08) {

            person?.classList.add(
                'ending-show'
            );

        } else {

            person?.classList.remove(
                'ending-show'
            );

        }


        /* ====================================
           ② “那算了”气泡
        ==================================== */

        if (progress >= 0.20) {

            bubble?.classList.add(
                'ending-show'
            );

        } else {

            bubble?.classList.remove(
                'ending-show'
            );

        }


        /* ====================================
           ③ 日历整体出现
        ==================================== */

        if (progress >= 0.36) {

            calendar?.classList.add(
                'calendar-show'
            );

        } else {

            calendar?.classList.remove(
                'calendar-show'
            );

        }


        /* ====================================
           ④ 今天
        ==================================== */

        if (
            calendarPages[0] &&
            progress >= 0.46
        ) {

            calendarPages[0].classList.add(
                'calendar-page-show'
            );

        }


        /* ====================================
           ⑤ → 周末
        ==================================== */

        if (progress >= 0.58) {

            if (calendarArrows[0]) {

                calendarArrows[0].classList.add(
                    'calendar-page-show'
                );

            }

            if (calendarPages[1]) {

                calendarPages[1].classList.add(
                    'calendar-page-show'
                );

            }

        }


        /* ====================================
           ⑥ → 下一个周末
        ==================================== */

        if (progress >= 0.70) {

            if (calendarArrows[1]) {

                calendarArrows[1].classList.add(
                    'calendar-page-show'
                );

            }

            if (calendarPages[2]) {

                calendarPages[2].classList.add(
                    'calendar-page-show'
                );

            }

        }


        /* ====================================
           ⑦ 最后的问题
        ==================================== */

        if (progress >= 0.86) {

            question?.classList.add(
                'question-show'
            );

        } else {

            question?.classList.remove(
                'question-show'
            );

        }


        ticking = false;

    }


    function requestEndingUpdate() {

        if (!ticking) {

            window.requestAnimationFrame(
                updateEnding
            );

            ticking = true;

        }

    }


    window.addEventListener(
        'scroll',
        requestEndingUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        'resize',
        requestEndingUpdate
    );


    updateEnding();

})();

/* =====================================================
   第三章
   让数据告诉我们“错过之后发生了什么”
===================================================== */

/* =====================================================
   第三章第一屏｜错过之后
   进入视口后依次显示文字
===================================================== */

(function () {

    const scene13 = document.querySelector(
        '#chapter3 .scene13'
    );

    if (!scene13) return;

    let scene13Played = false;

    const observer = new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                if (
                    entry.isIntersecting &&
                    !scene13Played
                ) {

                    scene13Played = true;

                    scene13.classList.add(
                        'scene13-active'
                    );

                    observer.unobserve(scene13);
                }

            });

        },
        {
            threshold: 0.15
        }
    );

    observer.observe(scene13);

})();

/* =====================================================
   14｜Q6＋Q7
===================================================== */

(function () {

    const scene =
        document.querySelector(
            '#chapter3 .scene14'
        );

    if (!scene) return;


    let ticking = false;


    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(value, min),
            max
        );

    }

    function updateScene14() {

        const rect =
            scene.getBoundingClientRect();

        const sceneHeight =
            scene.offsetHeight;

        const viewportHeight =
            window.innerHeight;

        const scrollDistance =
            sceneHeight -
            viewportHeight;


        let progress =
            scrollDistance > 0
                ? -rect.top /
                  scrollDistance
                : 0;


        progress =
            clamp(
                progress,
                0,
                1
            );


        if (
            progress >= 0.08
        ) {

            scene.classList.add(
                'scene14-active'
            );

        } else {

            scene.classList.remove(
                'scene14-active'
            );

        }


        ticking = false;

    }


    function requestScene14Update() {

        if (!ticking) {

            window.requestAnimationFrame(
                updateScene14
            );

            ticking = true;

        }

    }


    window.addEventListener(
        'scroll',
        requestScene14Update,
        {
            passive: true
        }
    );


    window.addEventListener(
        'resize',
        requestScene14Update
    );


    updateScene14();

})();

/* =====================================================
   15｜Q8＋Q9
   六个气泡随滚动依次出现
===================================================== */

(function () {
    const scene = document.querySelector('#chapter3 .scene15');

    if (!scene) return;

    const track = scene.querySelector('.chapter3-q8-scroll-track');
    const bubbles = Array.from(
        scene.querySelectorAll('.chapter3-q8-bubble')
    );
    const q9 = scene.querySelector('.chapter3-q9-analysis');

    if (!track || bubbles.length === 0) return;

    let ticking = false;

    // 六个气泡依次出现的滚动节点
    const thresholds = [0.06, 0.17, 0.28, 0.39, 0.50, 0.61];

    // 气泡基本全部出现后，再显示Q9文字
    const q9Threshold = 0.70;

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function updateScene15() {
        const rect = track.getBoundingClientRect();
        const trackHeight = track.offsetHeight;
        const viewportHeight = window.innerHeight;

        const scrollDistance = Math.max(
            1,
            trackHeight - viewportHeight
        );

        let progress = -rect.top / scrollDistance;
        progress = clamp(progress, 0, 1);

        // 根据滚动进度，依次显示六个气泡
        bubbles.forEach((bubble, index) => {
            const shouldShow = progress >= thresholds[index];
            bubble.classList.toggle('is-visible', shouldShow);
        });

        // 滚动到指定位置后，显示Q9分析文字
        if (q9) {
            q9.classList.toggle(
                'is-visible',
                progress >= q9Threshold
            );
        }

        ticking = false;
    }

    function requestScene15Update() {
        if (!ticking) {
            window.requestAnimationFrame(updateScene15);
            ticking = true;
        }
    }

    window.addEventListener(
        'scroll',
        requestScene15Update,
        { passive: true }
    );

    window.addEventListener('resize', requestScene15Update);

    updateScene15();
})();

/* =====================================================
   第五屏：现实案例滚动切换
   向下切换案例，向上返回案例
   ===================================================== */

(function () {
    const casesSection = document.getElementById('scene-ch5-cases');

    if (!casesSection) return;

    const slides = Array.from(
        casesSection.querySelectorAll('.case-slide')
    );

    if (slides.length < 2) return;

    let currentIndex = 0;
    let wheelLocked = false;

    // 根据当前案例位置，更新显示状态
    function showCase(index) {
        currentIndex = index;

        slides.forEach((slide, i) => {
            slide.classList.remove(
                'case-active',
                'case-prev',
                'case-next'
            );

            if (i === currentIndex) {
                slide.classList.add('case-active');
            } else if (i < currentIndex) {
                slide.classList.add('case-prev');
            } else {
                slide.classList.add('case-next');
            }
        });
    }

    // 初始化：显示第一个案例
    showCase(0);

    // 滚轮切换案例
    window.addEventListener('wheel', function (event) {
        const rect = casesSection.getBoundingClientRect();

        // 只在第五屏基本处于当前视口时接管滚轮
        const sectionInPosition =
            rect.top > -window.innerHeight * 0.25 &&
            rect.top < window.innerHeight * 0.25;

        if (!sectionInPosition) return;

        // 正在切换时，避免连续滚动导致跳过案例
        if (wheelLocked) {
            if (
                (event.deltaY > 0 && currentIndex < slides.length - 1) ||
                (event.deltaY < 0 && currentIndex > 0)
            ) {
                event.preventDefault();
            }
            return;
        }

        // 向下滚动：切换到下一个案例
        if (event.deltaY > 0 && currentIndex < slides.length - 1) {
            event.preventDefault();

            wheelLocked = true;
            showCase(currentIndex + 1);

            setTimeout(() => {
                wheelLocked = false;
            }, 750);

            return;
        }

        // 向上滚动：返回上一个案例
        if (event.deltaY < 0 && currentIndex > 0) {
            event.preventDefault();

            wheelLocked = true;
            showCase(currentIndex - 1);

            setTimeout(() => {
                wheelLocked = false;
            }, 750);
        }

        // 第一个案例继续向上、最后一个案例继续向下时，
        // 不拦截滚轮，让网页正常切换屏幕
    }, { passive: false });
})();


/* =====================================================
   第八屏：公共文化服务的意义
   文字淡入 → 切换第二张背景图
   ===================================================== */

(function () {
    const section = document.getElementById('scene-ch4-ending');

    if (!section) return;

    // 防止重复初始化
    if (section.dataset.endingInitialized === 'true') return;
    section.dataset.endingInitialized = 'true';

    let animationStarted = false;
    let timer1 = null;
    let timer2 = null;

    function startEndingAnimation() {
        if (animationStarted) return;
        animationStarted = true;

        // 进入这一屏后，先让文字淡入
        timer1 = setTimeout(() => {
            section.classList.add('show-text');
        }, 500);

        // 文字出现并停留一段时间后，切换第二张图片
        timer2 = setTimeout(() => {
            section.classList.add('show-second');
        }, 2000);
    }

    // 进入视口时启动动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                startEndingAnimation();
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(section);
})();

/* 第二章第一屏：标题显示控制 */
(function () {
    function initChapter2Title() {
        const title = document.querySelector(
            '#chapter2 .chapter2-title'
        );

        if (!title) {
            console.warn('未找到第二章标题容器');
            return;
        }

        // 进入标题屏时显示标题
        function showTitle() {
            title.classList.add('chapter2-title-visible');
        }

        if (!('IntersectionObserver' in window)) {
            showTitle();
            return;
        }

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        showTitle();
                        observer.disconnect();
                    }
                });
            },
            {
                threshold: 0.1
            }
        );

        observer.observe(title);
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initChapter2Title,
            { once: true }
        );
    } else {
        initChapter2Title();
    }
})();


/* ==========================================================
   第四屏：弹幕自动飞入、定格、继续滚动后收尾
   第五屏：两段文字依次淡入
   ========================================================== */

(function initChapter3BarrageAndEnding() {
    const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

    function smoothstep(n) {
        n = clamp(n, 0, 1);
        return n * n * (3 - 2 * n);
    }

    function initBarrage() {
        const section = document.querySelector(
            '#chapter3 .scene-barrage'
        );

        const track = section?.querySelector(
            '.chapter3-barrage-track'
        );

        const stage = section?.querySelector(
            '.chapter3-barrage-stage'
        );

        const field = section?.querySelector(
            '.chapter3-barrage-field'
        );

        if (!section || !track || !stage || !field) {
            console.warn('第四屏未找到必要的 HTML 容器。');
            return;
        }

        if (field.dataset.barrageBuilt === 'true') return;
        field.dataset.barrageBuilt = 'true';
        field.replaceChildren();

        /* 一、问卷选项：Q8 和 Q9 交错呈现 */

        const q8 = [
            '最后就没有再去了',
            '以后再说，之后再找时间',
            '改到其他工作日',
            '换成其他休闲活动',
            '改到周末',
            '换一个开放时间更合适的场馆'
        ];

        const q9 = [
            '没什么变化',
            '慢慢就不太想去了',
            '专门选择开放时间更晚的场馆',
            '因为经常赶不上，后来去得少了',
            '只有特别感兴趣的时候才会想办法去',
            '尽量改到周末或节假日去',
            '提前安排时间，避免再次错过'
        ];

        const firstLayer = [];

        for (let i = 0; i < Math.max(q8.length, q9.length); i++) {
            if (q8[i]) {
                firstLayer.push({
                    text: q8[i],
                    type: 'q8-word'
                });
            }

            if (q9[i]) {
                firstLayer.push({
                    text: q9[i],
                    type: 'q9-word'
                });
            }
        }

        // 视觉回声：重复的是文字展示，不代表选择人数或频次
        const answers = [
            ...firstLayer,
            ...firstLayer.slice().reverse()
        ];

        /* 二、弹幕最终定格的位置 */

        const positions = [
            [24, 13, -8],
            [46,  9,  4],
            [68, 15, -5],
            [81, 21,  7],
            [35, 23,  3],
            [57, 20, -7],
            [19, 31,  6],
            [43, 34, -3],
            [72, 33,  8],
            [29, 43, -5],
            [54, 41,  3],
            [80, 46, -7],
            [20, 52,  4],
            [41, 55, -8],
            [64, 51,  6],
            [77, 61, -3],
            [31, 63,  8],
            [53, 66, -5],
            [18, 71, -4],
            [42, 75,  3],
            [66, 76, -8],
            [80, 82,  5],
            [30, 85, -6],
            [56, 88,  4],
            [39, 18, -5],
            [61, 28,  5]
        ];

        // 从左、右、上、下以及四个斜角飞入
        const directions = [
            [-115,   0],
            [ 115,   0],
            [   0, -85],
            [   0,  85],
            [-100, -65],
            [ 100, -65],
            [-100,  65],
            [ 100,  65]
        ];

        const cards = [];

        answers.forEach((answer, index) => {
            const card = document.createElement('div');

            card.className =
                'chapter3-barrage-word ' + answer.type;

            if (index % 5 === 0) {
                card.classList.add('word-large');
            } else if (index % 4 === 0) {
                card.classList.add('word-small');
            } else {
                card.classList.add('word-medium');
            }

            card.textContent = answer.text;

            const pos = positions[index % positions.length];
            const direction = directions[index % directions.length];

            card.dataset.x = String(pos[0]);
            card.dataset.y = String(pos[1]);
            card.dataset.angle = String(pos[2]);
            card.dataset.dx = String(direction[0]);
            card.dataset.dy = String(direction[1]);

            card.style.zIndex = String(index + 1);
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
            card.style.transition =
                'transform 1.15s cubic-bezier(0.2, 0.8, 0.2, 1), ' +
                'opacity 0.65s ease';

            field.appendChild(card);
            cards.push(card);
        });

        /* 三、最后出现的“以后再说。” */

        const finale = document.createElement('div');

        finale.className =
            'chapter3-barrage-word barrage-finale';

        finale.textContent = '以后再说......';
        finale.style.left = '50%';
        finale.style.top = '50%';
        finale.style.zIndex = '1000';
        finale.style.opacity = '0';
        finale.style.visibility = 'hidden';
        finale.style.transform =
            'translate(-50%, -50%) scale(0.82)';
        finale.style.transition =
            'opacity 0.8s ease, transform 0.8s ease';

        field.appendChild(finale);

        let entranceStarted = false;
        let entranceComplete = false;
        let settledScrollY = 0;

        function setFinalPositions() {
            const isMobile = window.matchMedia(
                '(max-width: 768px)'
            ).matches;

            cards.forEach(card => {
                const originalX = Number(card.dataset.x);
                const y = Number(card.dataset.y);
                const angle = Number(card.dataset.angle);

                const x = isMobile
                    ? 50 + (originalX - 50) * 0.5
                    : originalX;

                card.style.left = x + '%';
                card.style.top = y + '%';

                card.dataset.finalTransform =
                    `translate(-50%, -50%) rotate(${angle}deg) scale(1)`;

                card.dataset.startTransform =
                    `translate(-50%, -50%) ` +
                    `translate(${card.dataset.dx}vw, ${card.dataset.dy}vh) ` +
                    `rotate(${angle + (Number(card.dataset.dx) >= 0 ? 15 : -15)}deg) ` +
                    `scale(0.78)`;
            });
        }

        /*
         * 自动飞入：
         * 一旦第四屏进入视口就启动。
         * 每个框有少量延迟，所有框进入后停留在最终位置。
         */

        function playEntrance() {
            if (entranceStarted) return;
            entranceStarted = true;

            setFinalPositions();

            cards.forEach((card, index) => {
                card.style.transform = card.dataset.startTransform;

                window.setTimeout(() => {
                    card.style.visibility = 'visible';

                    // 下一帧再切换到最终位置，触发飞入动画
                    window.requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform =
                            card.dataset.finalTransform;
                    });
                }, index * 65);
            });

            // 等最后一个框完成飞入，再允许后续滚动触发结尾
            const totalDuration = cards.length * 65 + 1450;

            window.setTimeout(() => {
                entranceComplete = true;
                settledScrollY = window.scrollY;

                // 动画结束时只定格，不立即显示“以后再说。”
                updateBarrageScroll();
            }, totalDuration);
        }

        /* 四、滚动控制：定格后，下一次滚动才出现结尾 */

        function barrageProgress() {
            const trackStartY =
                track.getBoundingClientRect().top + window.scrollY;

            const distance = Math.max(
                track.offsetHeight - stage.offsetHeight,
                1
            );

            return clamp(
                (window.scrollY - trackStartY) / distance,
                0,
                1
            );
        }

        function updateBarrageScroll() {
            if (!entranceStarted) return;

            // 动画播放期间不让滚动进度干扰飞入效果
            if (!entranceComplete) return;

            const progress = barrageProgress();

            // 必须完成飞入，而且定格后继续向下滚动
            const scrolledAgain =
                window.scrollY > settledScrollY + 18;

            let finaleOpacity = 0;

            if (scrolledAgain && progress >= 0.54) {
                finaleOpacity = smoothstep(
                    (progress - 0.54) / 0.15
                );
            }

            // 结尾出现时，弹幕群逐渐淡出
            cards.forEach(card => {
                card.style.opacity = String(1 - finaleOpacity);
            });

            finale.style.opacity = String(finaleOpacity);
            finale.style.visibility =
                finaleOpacity > 0.01 ? 'visible' : 'hidden';

            finale.style.transform =
                `translate(-50%, -50%) scale(${0.82 + finaleOpacity * 0.18})`;
        }

        /* 五、第五屏：两段文字依次淡入 */

        function initEnding() {
            const endingSection = document.querySelector(
                '#chapter3 .scene16'
            );

            const inner = endingSection?.querySelector(
                '.chapter3-voice-inner'
            );

            const sequence = endingSection?.querySelector(
                '.chapter3-voice-sequence'
            );

            const endingText = endingSection?.querySelector(
                '.chapter3-ending-text'
            );

            if (!endingSection || !inner || !sequence || !endingText) {
                console.warn(
                    '第五屏未找到两段文字容器，请检查 voice-sequence 和 ending-text 类名。'
                );
                return;
            }

            [sequence, endingText].forEach(element => {
                element.style.opacity = '0';
                element.style.visibility = 'hidden';
                element.style.transition = 'opacity 1s ease';
            });

            function endingProgress() {
                const sectionStartY =
                    endingSection.getBoundingClientRect().top +
                    window.scrollY;

                const distance = Math.max(
                    endingSection.offsetHeight - window.innerHeight,
                    1
                );

                return clamp(
                    (window.scrollY - sectionStartY) / distance,
                    0,
                    1
                );
            }

            function updateEnding() {
                const progress = endingProgress();

                // 第一段：淡入、停留、淡出
                const firstFadeIn = smoothstep(
                    (progress - 0.015) / 0.13
                );

                const firstFadeOut = 1 - smoothstep(
                    (progress - 0.44) / 0.10
                );

                const firstOpacity = firstFadeIn * firstFadeOut;

                sequence.style.opacity = String(firstOpacity);
                sequence.style.visibility =
                    firstOpacity > 0.01 ? 'visible' : 'hidden';

                // 第二段：在第一段淡出后逐渐浮现
                const secondOpacity = smoothstep(
                    (progress - 0.54) / 0.16
                );

                endingText.style.opacity = String(secondOpacity);
                endingText.style.visibility =
                    secondOpacity > 0.01 ? 'visible' : 'hidden';
            }

            return updateEnding;
        }

        const updateEnding = initEnding();

        /* 六、统一处理滚动与窗口变化 */

        let ticking = false;

        function updateAll() {
            if (ticking) return;
            ticking = true;

            window.requestAnimationFrame(() => {
                updateBarrageScroll();

                if (updateEnding) {
                    updateEnding();
                }

                ticking = false;
            });
        }

        setFinalPositions();

        window.addEventListener(
            'scroll',
            updateAll,
            { passive: true }
        );

        window.addEventListener('resize', () => {
            setFinalPositions();
            updateAll();
        });

        // 当第四屏进入视口时，自动播放弹幕飞入
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        playEntrance();
                        observer.disconnect();
                    }
                });
            }, {
                threshold: 0.15
            });

            observer.observe(section);
        } else {
            playEntrance();
        }

        updateAll();
    }

    function run() {
        initBarrage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            run,
            { once: true }
        );
    } else {
        run();
    }
})();

/* =====================================================
   全站背景音乐：仅播放 / 暂停 one.mp3
   ===================================================== */

(function initBackgroundMusic() {
    function setupMusic() {
        const audio = document.getElementById('siteBgm');
        const button = document.getElementById('bgmToggle');

        if (!audio || !button) {
            console.warn('背景音乐控件未找到，请检查 HTML。');
            return;
        }

        audio.volume = 0.2;

        function updateButton(isPlaying) {
            button.textContent = isPlaying
                ? '♫ 暂停背景音'
                : '♫ 播放背景音';

            button.setAttribute(
                'aria-label',
                isPlaying ? '暂停背景音乐' : '播放背景音乐'
            );

            button.setAttribute('aria-pressed', String(isPlaying));
        }

        button.addEventListener('click', async () => {
            if (audio.paused) {
                try {
                    await audio.play();
                    updateButton(true);
                } catch (error) {
                    console.error('背景音乐播放失败：', error);
                    updateButton(false);
                    alert('音乐暂时无法播放，请检查 MP3 文件路径和文件是否正常。');
                }
            } else {
                audio.pause();
                updateButton(false);
            }
        });

        audio.addEventListener('pause', () => updateButton(false));
        audio.addEventListener('play', () => updateButton(true));
        updateButton(false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupMusic, { once: true });
    } else {
        setupMusic();
    }
})();
