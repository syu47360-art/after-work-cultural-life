document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       第四章 Scene 1：标题 + 副标题逐步出现
    ===================================================== */

    const scene1 = document.getElementById("scene-ch4-s1");

    if (scene1) {
        const title = scene1.querySelector(".s1-title");
        const subtitleLines = scene1.querySelectorAll(".sub-line");

        let scene1Timers = [];

        function clearScene1Timers() {
            scene1Timers.forEach(function (timer) {
                clearTimeout(timer);
            });
            scene1Timers = [];
        }

        function resetScene1() {
            clearScene1Timers();

            if (title) {
                title.classList.remove("in");
            }

            subtitleLines.forEach(function (line) {
                line.classList.remove("in");
            });
        }

        function startScene1() {
            resetScene1();

            const titleKickoff = setTimeout(function () {
                if (title) {
                    title.classList.add("in");
                }
            }, 600);

            scene1Timers.push(titleKickoff);

            subtitleLines.forEach(function (line, index) {
                const timer = setTimeout(function () {
                    line.classList.add("in");
                }, 3850 + index * 1000);

                scene1Timers.push(timer);
            });
        }

        const scene1Observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        startScene1();
                    } else {
                        resetScene1();
                    }
                });
            },
            {
                threshold: 0.45
            }
        );

        scene1Observer.observe(scene1);
    }


    /* =====================================================
   第四章 Scene 2：三种下班选择
===================================================== */

const scene2 = document.getElementById("scene-ch4-s2");

if (scene2) {

    const choiceCards =
        scene2.querySelectorAll(".choice-card");

    const middleSpace =
        scene2.querySelector(".s2-middle-space");

    const clickHint =
        document.getElementById("s2ClickHint");

    const result =
        document.getElementById("s2Result");

    let resultShown = false;
    let isMovingToNextScene = false;

    let touchStartY = 0;


    /* -----------------------------------------
       初始状态
    ----------------------------------------- */

    if (result) {

        result.style.opacity = "0";
        result.style.visibility = "hidden";
        result.style.pointerEvents = "none";

    }


    /* -----------------------------------------
       点击三张卡片
    ----------------------------------------- */

    choiceCards.forEach(function (card, index) {

        card.addEventListener("click", function () {

            let title = "";
            if (index === 0) {
                title = "直接去文化空间";
            } else if (index === 1) {
                title = "先吃饭";               
            } else {
                title = "回家";
            }
            
            /* ---------------------------------
   更新当前结果
--------------------------------- */

const choiceElement =
    document.getElementById("s2ResultChoice");

const arrivalElement =
    document.getElementById("s2ArrivalLabel");

const mealElement =
    document.getElementById("s2MealDetail");

const remainingElement =
    document.getElementById("s2RemainingMinutes");

const captionElement =
    document.getElementById("s2ResultCaption");

const usedElement =
    document.getElementById("s2TimeUsed");

const remainingBarElement =
    document.getElementById("s2TimeRemaining");

const markerElement =
    document.getElementById("s2ArrivalMarker");


let arrivalTime = "";
let remainingMinutes = 0;
let mealText = "";
let captionText = "";


if (index === 0) {

    arrivalTime = "18:40";
    remainingMinutes = 80;
    mealText = "";
    captionText = "时间还够，今天就去看看吧。";

} else if (index === 1) {

    arrivalTime = "19:10";
    remainingMinutes = 50;
    mealText = "吃饭 30 分钟";
    captionText = "时间开始变少了，还要去吗？";

} else {

    arrivalTime = "—";
    remainingMinutes = 0;
    mealText = "";
    captionText = "今天先回家，文化生活又要等到下一次。";

}


if (choiceElement) {
    choiceElement.textContent = `你选择了：${title}`;
}

if (arrivalElement) {
    const strong = arrivalElement.querySelector("strong");
    if (strong) {
        strong.textContent = arrivalTime;
    }
}

if (mealElement) {
    mealElement.textContent = mealText;
}

if (remainingElement) {
    remainingElement.textContent = remainingMinutes;
}

if (captionElement) {
    captionElement.textContent = captionText;
}


/* ---------------------------------
   更新时间轴
--------------------------------- */

if (usedElement && remainingBarElement && markerElement) {

    if (index === 2) {

        usedElement.style.width = "100%";
        remainingBarElement.style.width = "0%";
        markerElement.style.left = "100%";

    } else {

        const usedPercent =
            index === 0
                ? 33.333
                : 47.222;

        const remainingPercent =
            100 - usedPercent;

        usedElement.style.width =
            `${usedPercent}%`;

        remainingBarElement.style.width =
            `${remainingPercent}%`;

        markerElement.style.left =
            `${usedPercent}%`;

    }

}


            /* ---------------------------------
               三张卡片退出
            --------------------------------- */

            choiceCards.forEach(function (item) {

                item.style.opacity = "0";
                item.style.pointerEvents = "none";
                item.style.transform =
                    "translateY(-25px) scale(0.96)";

            });


            /* 点击提示消失 */

            if (clickHint) {

                clickHint.style.opacity = "0";
                clickHint.style.visibility =
                    "hidden";

            }


            /* ---------------------------------
               结果出现
            --------------------------------- */

            setTimeout(function () {

                if (result) {

                    result.style.opacity = "1";
                    result.style.visibility =
                        "visible";

                    result.style.pointerEvents =
                        "auto";

                }

                resultShown = true;

            }, 300);

        });

    });


    /* =================================================
       第二场景 → 第三场景
       结果出现后继续向下滚
    ================================================= */

    function goToScene3() {

        if (isMovingToNextScene) {
            return;
        }

        const scene3 =
            document.getElementById("scene-ch4-s3");

        if (!scene3) {
            return;
        }

        isMovingToNextScene = true;

        scene3.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        setTimeout(function () {

            isMovingToNextScene = false;

        }, 900);

    }


    /* =================================================
       第二场景 → 上一个场景
    ================================================= */

    function goToScene1() {

        if (isMovingToNextScene) {
            return;
        }

        const scene1 =
            document.getElementById("scene-ch4-s1");

        if (!scene1) {
            return;
        }

        isMovingToNextScene = true;

        scene1.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        setTimeout(function () {

            isMovingToNextScene = false;

        }, 900);

    }


    /* =================================================
       鼠标滚轮
    ================================================= */

    scene2.addEventListener(
        "wheel",
        function (event) {

            /* 还没点击卡片：
               完全不干预正常页面滚动 */

            if (!resultShown) {
                return;
            }


            /* 向下 */

            if (event.deltaY > 10) {

                event.preventDefault();

                goToScene3();

            }


            /* 向上 */

            else if (event.deltaY < -10) {

                event.preventDefault();

                goToScene1();

            }

        },
        {
            passive: false
        }
    );


    /* =================================================
       手机 / 触摸屏
    ================================================= */

    scene2.addEventListener(
        "touchstart",
        function (event) {

            if (!resultShown) {
                return;
            }

            const touch =
                event.changedTouches[0];

            touchStartY = touch.clientY;

        },
        {
            passive: true
        }
    );


    scene2.addEventListener(
        "touchend",
        function (event) {

            if (!resultShown) {
                return;
            }

            const touch =
                event.changedTouches[0];

            const deltaY =
                touch.clientY - touchStartY;


            /* 手指向上 */

            if (deltaY < -50) {

                goToScene3();

            }


            /* 手指向下 */

            else if (deltaY > 50) {

                goToScene1();

            }

        },
        {
            passive: true
        }
    );
    /* =================================================
   离开第二场景后，恢复初始状态
================================================= */

function resetScene2() {

    resultShown = false;

    choiceCards.forEach(function (card) {

        card.style.opacity = "";
        card.style.pointerEvents = "";
        card.style.transform = "";

    });


    if (clickHint) {

        clickHint.style.opacity = "";
        clickHint.style.visibility = "";

    }


    if (result) {

        result.style.opacity = "0";
        result.style.visibility = "hidden";
        result.style.pointerEvents = "none";

        /* 清掉 JS 对 transform 的干预，
           交回给原来的 CSS */

        result.style.transform = "";

    }


    if (middleSpace) {

        middleSpace.classList.remove(
            "is-result"
        );

    }

}


/* 第二场景进入 / 离开监听 */

const scene2Observer =
    new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                /*
                 * 当第二场景基本离开视口时，
                 * 恢复三张卡片的初始状态
                 */

                if (!entry.isIntersecting) {

                    resetScene2();
                    const choiceElement =
    document.getElementById("s2ResultChoice");

const arrivalElement =
    document.getElementById("s2ArrivalLabel");

const mealElement =
    document.getElementById("s2MealDetail");

const remainingElement =
    document.getElementById("s2RemainingMinutes");

const captionElement =
    document.getElementById("s2ResultCaption");

const usedElement =
    document.getElementById("s2TimeUsed");

const remainingBarElement =
    document.getElementById("s2TimeRemaining");

const markerElement =
    document.getElementById("s2ArrivalMarker");


if (choiceElement) {
    choiceElement.textContent = "";
}

if (arrivalElement) {
    const strong = arrivalElement.querySelector("strong");
    if (strong) {
        strong.textContent = "18:40";
    }
}

if (mealElement) {
    mealElement.textContent = "";
}

if (remainingElement) {
    remainingElement.textContent = "80";
}

if (captionElement) {
    captionElement.textContent = "时间还够，今天就去看看吧。";
}

if (usedElement) {
    usedElement.style.width = "33.333%";
}

if (remainingBarElement) {
    remainingBarElement.style.width = "66.667%";
}

if (markerElement) {
    markerElement.style.left = "33.333%";
}

                }

            });

        },
        {
            threshold: 0.45
        }
    );
scene2Observer.observe(scene2);  

}

/* =====================================================
   第四章 Scene 3：22 家 → 36 家灯光变化
===================================================== */

const scene3 = document.getElementById("scene-ch4-s3");
const beforeLights = document.getElementById("s3LightsBefore");
const afterLights = document.getElementById("s3LightsAfter");

let scene3Timers = [];


/* -----------------------------------------
   创建灯
----------------------------------------- */

function createLights(container, count) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {

        const light = document.createElement("span");

        light.className = "s3-light";

        container.appendChild(light);
    }
}


/* -----------------------------------------
   清除正在进行的动画
----------------------------------------- */

function clearScene3Timers() {

    scene3Timers.forEach(function (timer) {
        clearTimeout(timer);
    });

    scene3Timers = [];
}


/* -----------------------------------------
   所有灯恢复为熄灭状态
----------------------------------------- */

function resetScene3Lights() {

    if (beforeLights) {

        beforeLights
            .querySelectorAll(".s3-light")
            .forEach(function (light) {

                light.classList.remove("is-on");

            });
    }

    if (afterLights) {

        afterLights
            .querySelectorAll(".s3-light")
            .forEach(function (light) {

                light.classList.remove("is-on");

            });
    }
}


/* -----------------------------------------
   按顺序点亮指定范围的灯
----------------------------------------- */

function lightUpRange(
    container,
    startIndex,
    endIndex,
    interval,
    startDelay
) {

    if (!container) {
        return;
    }

    const lights =
        container.querySelectorAll(".s3-light");

    for (
        let i = startIndex;
        i < endIndex;
        i++
    ) {

        const timer = setTimeout(function () {

            if (lights[i]) {

                lights[i].classList.add("is-on");

            }

        }, startDelay + (i - startIndex) * interval);

        scene3Timers.push(timer);
    }
}


/* -----------------------------------------
   开始第三场景动画
----------------------------------------- */

function startScene3() {

    clearScene3Timers();

    resetScene3Lights();


    /*
     * 第一阶段：
     * 18:40 仍开放的 22 家
     * 左侧 22 个灯依次亮起
     */

    lightUpRange(
        beforeLights,
        0,
        22,
        70,
        0
    );


    /*
     * 同时让延长开放后的前 22 家亮起
     *
     * 这 22 家是原本已经开放的场馆。
     */

    lightUpRange(
        afterLights,
        0,
        22,
        70,
        0
    );


    /*
     * 第二阶段：
     * 稍作停顿后，
     * 新增的 14 家再依次亮起
     */

    const first22Duration =
        21 * 70;

    const pauseAfter22 = 700;

    const newLightsStartDelay =
        first22Duration + pauseAfter22;


    lightUpRange(
        afterLights,
        22,
        36,
        70,
        newLightsStartDelay
    );
}


/* -----------------------------------------
   第三场景进入 / 离开监听
----------------------------------------- */

if (
    scene3 &&
    beforeLights &&
    afterLights
) {

    /*
     * 左侧 22 个
     * 右侧 36 个
     */

    createLights(
        beforeLights,
        22
    );

    createLights(
        afterLights,
        36
    );


    const scene3Observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        startScene3();

                    } else {

                        /*
                         * 离开第三场景时：
                         * 停止动画 + 灯全部熄灭
                         */

                        clearScene3Timers();

                        resetScene3Lights();

                    }

                });

            },
            {
                threshold: 0.45
            }
        );


    scene3Observer.observe(scene3);
}
    
    /* =====================================================
       第五章：三个案例横向切换
    ===================================================== */

    const caseScene = document.getElementById("scene-ch5-cases");

    if (caseScene) {

        const caseSlides = caseScene.querySelectorAll(".case-slide");

        let currentCase = 0;
        let startY = 0;
        let startX = 0;

        function showCase(index) {

            if (!caseSlides.length) {
                return;
            }

            if (index < 0 || index >= caseSlides.length) {
                return;
            }

            caseSlides.forEach(function (slide, i) {               
               slide.classList.remove(
                 "case-active",
                 "case-prev",
                 "case-next"
);


                if (i < index) {
                    slide.classList.add("case-prev");
                }

                if (i === index) {
                    slide.classList.add("case-active");
                }

                if (i > index) {
                    slide.classList.add("case-next");
                }

            });

            currentCase = index;
        }

        showCase(0);

        caseScene.addEventListener(
            "touchstart",
            function (event) {

                const touch = event.changedTouches[0];

                startY = touch.clientY;
                startX = touch.clientX;

            },
            {
                passive: true
            }
        );


        caseScene.addEventListener(
            "touchend",
            function (event) {

                const touch = event.changedTouches[0];

                const deltaY = touch.clientY - startY;
                const deltaX = touch.clientX - startX;

                if (Math.abs(deltaY) < 40) {
                    return;
                }

                if (Math.abs(deltaY) < Math.abs(deltaX)) {
                    return;
                }

                if (deltaY < 0) {

                    if (currentCase < caseSlides.length - 1) {
                        showCase(currentCase + 1);
                    }

                } else {

                    if (currentCase > 0) {
                        showCase(currentCase - 1);
                    }
                }

            },
            {
                passive: true
            }
        );
    }


    /* =====================================================
       第六章：政策导航
    ===================================================== */

    const policyContent = document.getElementById("policyContent");
    const policyNavItems = document.querySelectorAll(
        "#scene-ch4-policy .policy-nav-item"
    );
    const policyParts = document.querySelectorAll(
        "#scene-ch4-policy .policy-part"
    );

    if (policyContent && policyNavItems.length && policyParts.length) {

        policyNavItems.forEach(function (item, index) {

            item.addEventListener("click", function () {

                const target = policyParts[index];

                if (!target) {
                    return;
                }

                policyContent.scrollTo({
                    top: target.offsetTop,
                    behavior: "smooth"
                });

            });

        });


        policyContent.addEventListener(
            "scroll",
            function () {

                let activeIndex = 0;
                let smallestDistance = Infinity;

                policyParts.forEach(function (part, index) {

                    const distance = Math.abs(
                        part.offsetTop - policyContent.scrollTop
                    );

                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        activeIndex = index;
                    }

                });

                policyNavItems.forEach(function (item, index) {

                    item.classList.toggle(
                        "is-active",
                        index === activeIndex
                    );

                });

            }
        );

    }


    /* =====================================================
       第六章：夜景视频 + 文字逐行出现
    ===================================================== */

    const nightScene = document.getElementById("scene-ch4-night");
    const nightVideo = nightScene
        ? nightScene.querySelector(".night-video")
        : null;

    const nightLines = nightScene
        ? nightScene.querySelectorAll(".night-line")
        : [];


    if (nightScene && nightVideo && nightLines.length) {

        const nightObserver = new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        nightVideo
                            .play()
                            .catch(function () {});

                        nightLines.forEach(function (line) {
                            line.classList.remove("is-visible");
                        });

                        nightLines.forEach(function (line, index) {

                            setTimeout(function () {
                                line.classList.add("is-visible");
                            }, index * 1500);

                        });

                    } else {

                        nightVideo.pause();

                        nightLines.forEach(function (line) {
                            line.classList.remove("is-visible");
                        });

                    }

                });

            },
            {
                threshold: 0.55
            }
        );

        nightObserver.observe(nightScene);
    }
});